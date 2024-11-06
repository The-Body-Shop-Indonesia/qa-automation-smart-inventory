const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
let vouchers
describe('User Available Acces to Redemption Voucher', () => {
  before('User Login', () => {
    const url_user = URL_USER + '/otp/validate'
    const url_admin = URL_USER + '/admin/login'

    cy.api({
      method: 'POST',
      url: url_user,
      body: {
        identifier: Cypress.env('identifier_user'),
        otp: Cypress.env('otp_user'),
        pageType: 'Login'
      }
    })
      .should((response) => {
        expect(response.status).to.equal(201)
        const body = response.body
        expect(body).to.haveOwnProperty('statusCode')
        expect(body).to.haveOwnProperty('message')
        expect(body).to.haveOwnProperty('data')
        expect(body.statusCode).to.equal(201)
        expect(body.message).to.equal('Success')
        const data = body.data
        expect(data).to.haveOwnProperty('accessToken')
      })
      .then((response) => {
        const userToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + userToken
        })
      })

    cy.api({
      method: 'POST',
      url: url_admin,
      body: {
        username: Cypress.env('ADMIN_USERNAME'),
        password: Cypress.env('ADMIN_PASSWORD')
      }
    })
      .should((response) => {
        expect(response.status).to.equal(201)
        const body = response.body
        expect(body).to.haveOwnProperty('statusCode')
        expect(body).to.haveOwnProperty('message')
        expect(body).to.haveOwnProperty('data')
        expect(body.statusCode).to.equal(201)
        expect(body.message).to.equal('Success')
        const data = body.data
        expect(data).to.haveOwnProperty('accessToken')
      })
      .then((response) => {
        const AdminToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS_ADMIN', {
          Authorization: 'Bearer ' + AdminToken
        })
      })
  })

  it('Shows My Current Point', () => {
    const URL_USER = Cypress.config('baseUrlUser')
    const url = URL_USER + '/membership/point'

    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Expect Statuscode to be 200').to.equal(200)
        const body = response.body.data
        expect(body, 'Check Point Availability').to.haveOwnProperty(
          'currentPoint'
        )
        Cypress.env('CUSTOMER_POINT', body.currentPoint)
        return body
      })
      .then((response) => {
        cy.log({ point: response.body.data.currentPoint })
      })
  })

  it('Shows All Vouchers', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      expect(response.status, 'Expect Statuscode to be 200').to.equal(200)
      vouchers = response.body.data

      const fieldsToCheck = [
        '_id',
        'displayName',
        'image',
        'isRedeemable',
        'redeemPoint',
        'isPartnerShip',
        'isDisplay',
        'bgImageUrl'
      ]
      for (let voucher of vouchers) {
        fieldsToCheck.forEach((fieldName) => {
          const message = `Must Contain fieldname [${fieldName}]`
          expect(voucher, message).to.haveOwnProperty(fieldName)
        })

        expect(
          voucher.redeemPoint,
          "Voucher's point value must be greater than 0"
        ).to.be.greaterThan(0)
      }
      //Ambil hanya field yang diperlukan: _id, displayName, dan redeemPoint
      const filteredVouchers = vouchers.map((voucher) => ({
        id: voucher._id,
        displayName: voucher.displayName,
        redeemPoint: voucher.redeemPoint,
        isDisplay: voucher.isDisplay
      }))

      cy.then(() => {
        console.table(filteredVouchers)
      })
    })
  })

  it('Shows Vouchers as Grayed-out, When Customer`s Point is Insufficient', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      response.body.data.forEach((voucher) => {
        const { redeemPoint, isDisplay } = voucher
        if (myPoint < redeemPoint) {
          expect(isDisplay, 'Check Field [isDisplay]').to.be.false
          cy.log(
            `Voucher "${voucher.displayName}" should not be displayed because required points (${voucher.redeemPoint}) exceed customer points (${myPoint}).`
          )
        }
      })
    })
  })

  it('Shows Grayed-out Vouchers at The End Of The List', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      // check if there are any unaffordable vouchers exist, they have to be at the end of the list
      const unaffordableVouchers = response.body.data.filter(
        (vcr) => vcr.redeemPoint > myPoint
      ).length

      // if there are any, the last N items of the list must have isDisplay False
      const body = response.body.data
      const length = body.length
      if (unaffordableVouchers > 0) {
        cy.log(`Found ${unaffordableVouchers} unaffordable vouchers.`)
        for (let i = 1; i <= unaffordableVouchers; i++) {
          const vouchersToCheck = body[length - i]
          expect(vouchersToCheck.isDisplay).to.be.false
          cy.log(
            `Voucher "${vouchersToCheck.displayName}" should not be should not be redeemed.`
          )
        }
      } else {
        cy.log('No unaffordable vouchers found.')
      }
    })
  })

  it('Shows The Right Result When Search Filter is Applied', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const query = 'qa'
    const url =
      URL_PRODUCT + '/online-voucher-redemption/list' + `?search=${query}`
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      const body = response.body.data
      const regex = new RegExp(query, 'gi')
      for (let voucher of body) {
        const match = voucher.displayName.match(regex)
        cy.log(
          `Checking voucher "${voucher.displayName}" for match with query "${query}"`
        )
        expect(match).to.be.not.null
      }
    })
  })

  // // expired vouchers?
  it('Not show if  voucher expiry period', () => {
    // get vms voucher program
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_vms = URL_PRODUCT + '/admin/voucher/vms/voucher-program'
    const url_catalog_voucher_list =
      URL_PRODUCT + '/online-voucher-redemption/list'
    cy.api({
      method: 'GET',
      url: url_vms,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 50,
        sort: '-updatedAt'
      }
    }).then((response) => {
      const body = response.body.data.docs
      const today = new Date()
      // Filter vouchers that have expired but are still redeemable
      const expiredVouchers = body.filter((voucher) => {
        const periodEndDate = new Date(voucher.periodEnd) // Convert periodEnd to Date object
        return (
          periodEndDate < today &&
          voucher.isRedeemable === true &&
          voucher.isPartnerShip === true
        )
      })
      // Log expired vouchers for debugging
      cy.log(`Expired Vouchers Count: ${expiredVouchers.length}`)
      expiredVouchers.forEach((voucher) => {
        cy.log(
          `Voucher ID: ${voucher._id}, Display Name: ${voucher.displayName}`
        )
      })
      //Validate each expired voucher should not be redeemable and not show
      cy.api({
        method: 'GET',
        url: url_catalog_voucher_list,
        headers: Cypress.env('REQUEST_HEADERS')
      }).then((responseCatalog) => {
        const bodyCatalog = responseCatalog.body.data
        // Check if any expired vouchers from VMS appear in the catalog list
        expiredVouchers.forEach((expiredVoucher) => {
          const foundInCatalog = bodyCatalog.some(
            (catalogVoucher) => catalogVoucher._id === expiredVoucher._id
          )
          cy.log(`Checking expired voucher ID: ${expiredVoucher._id}`)

          // Expect the expired voucher to not be in the catalog list
          expect(
            foundInCatalog,
            `Expired voucher "${expiredVoucher.displayName}" should not appear in the catalog`
          ).to.be.false
        })
      })
    })
  })

  // // sort & pagination tests. sort by price is important!
  it('Should return the correct sort voucher list for Display', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      const sortedVouchersList = vouchers.sort((a, b) => {
        // Sort by isDisplay (true first), then by reedempoint (descending)
        if (a.isDisplay === b.isDisplay) {
          return b.reedempoint - a.reedempoint // Sort by reedempoint descending
        }
        return a.isDisplay === true ? -1 : 1 // Sort true isDisplay before false
      })

      // Logging the sorted vouchers for debugging
      cy.log('My Point:', myPoint)
      cy.log(
        JSON.stringify(
          sortedVouchersList.map(
            ({ _id, displayName, redeemPoint, isDisplay }) => ({
              _id,
              displayName,
              redeemPoint,
              isDisplay
            })
          ),
          null,
          2
        ),
        'Sorted Voucher List:'
      )
      // cy.log(
      //   JSON.stringify(sortedVouchersList, null, 2),
      //   'Sorted Voucher List:'
      // )
      // Validation of sorted order
      let isValid = true
      let foundFalse = false

      for (let i = 0; i < sortedVouchersList.length - 1; i++) {
        const currentVoucher = sortedVouchersList[i]
        const nextVoucher = sortedVouchersList[i + 1]

        // Validate that all `isDisplay = true` are in front of `isDisplay = false`
        if (!foundFalse && currentVoucher.isDisplay === false) {
          foundFalse = true
        } else if (foundFalse && currentVoucher.isDisplay === true) {
          isValid = false
          break
        }

        // Validate that `reedempoint` is sorted in descending order within each `isDisplay` group
        if (
          currentVoucher.isDisplay === nextVoucher.isDisplay &&
          currentVoucher.reedempoint < nextVoucher.reedempoint
        ) {
          isValid = false
          break
        }
      }

      // Assertion for validation
      expect(isValid, 'Sorting Sudah benar:').to.be.true
    })
  })

  // // Filter tests
  it('Shows Vouchers as Grayed-out, When quota OOS', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      // Filter data to only include vouchers with quota <= 0
      const vouchersWithZeroQuota = response.body.data
        .filter((voucher) => voucher.quota <= 0)
        .map(({ _id, displayName, quota, redeemPoint, isDisplay }) => ({
          myPoint,
          _id,
          displayName,
          quota,
          redeemPoint,
          isDisplay
        }))

      // Log the filtered voucher details
      cy.log(JSON.stringify(vouchersWithZeroQuota, null, 2))

      response.body.data.forEach((voucher) => {
        const { redeemPoint, quota, isDisplay } = voucher
        if (quota <= 0 && myPoint >= redeemPoint) {
          // Validate that isDisplay should be false
          // expect(isDisplay, 'Check Field [isDisplay]').to.be.false
          expect(false, 'Check Field [isDisplay]').to.equal(isDisplay)
          cy.log(
            `Voucher "${voucher.displayName}" should not be displayed because the quota (${quota}) is zero or less.`
          )
        }
      })
    })
  })
})
