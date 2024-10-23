describe('General API Test Group', () => {
  before(() => {
    const customerToken = Cypress.env('TOKEN_CUSTOMER_BOB')
    Cypress.env('CUSTOMER_REQ_HEADERS', {
      Authorization: 'Bearer ' + customerToken,
      channel: 'web'
    })

    const URL_USER = Cypress.config('baseUrlUser')
    const url = URL_USER + '/membership/point'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).then((response) => {
      const URL_PRODUCT = Cypress.config('baseUrlProduct')
      const redeemUrl = URL_PRODUCT + '/online-voucher-redemption/redeem'
      Cypress.env('REDEEM_URL', redeemUrl)
      Cypress.env('CUSTOMER_POINT', response.body.data.currentPoint)
      cy.log({ point: response.body.data.currentPoint })
    })
  })

  // ---- technical sections
  // validate all payload
  it('Shows error 401 when customer token is not available', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer ',
        channel: 'web'
      },
      body: {
        voucherId: 'undefined'
      }
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  it('Shows error 400 when request voucherId is not exist', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: ''
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })

  it('Shows error 400 when request voucherId is random string', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: 'asdasdass'
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })

  it('Shows error 400 when request voucherId is not the right mongoID', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: '66a58004b3c08bb1169f9944'
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })
})

describe('Voucher Purchase Attempt Testing', () => {
  // ---- business sections
  // success to buy voucher with sufficient point
  it('Success to buy voucher with sufficient point', () => {
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.log({ point: myPoint })

    // get voucher to buy
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/online-voucher-redemption/list',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).then((response) => {
      const affordableVouchers = response.body.data.filter((vcr) => {
        const redeemable = vcr.isDisplay
        const sufficientPoint = vcr.redeemPoint <= myPoint
        return redeemable && sufficientPoint
      })
      const voucherToBuy = affordableVouchers[0]
      Cypress.env('VOUCHER_TO_BUY', affordableVouchers[0])

      cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
      // purchase voucher
      cy.api({
        method: 'POST',
        url: Cypress.env('REDEEM_URL'),
        headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
        failOnStatusCode: false,
        body: {
          voucherId: voucherToBuy._id
        }
      }).should((_response) => {
        expect(_response.status, 'Expect Tttp status 201').to.equal(201)
      })
    })
  })

  it('My Point should correctly deducted', () => {
    // check point deduction!
    const myPoint = Cypress.env('CUSTOMER_POINT')
    const URL_USER = Cypress.config('baseUrlUser')
    cy.api({
      method: 'GET',
      url: URL_USER + '/membership/point',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      const pointAfterDeduction = response.body.data.currentPoint
      const purchasedVoucher = Cypress.env('VOUCHER_TO_BUY')
      const voucherPrice = purchasedVoucher.redeemPoint
      const pointAfterPurchase = myPoint - voucherPrice
      expect(pointAfterDeduction, 'My Point is correctly deducted').to.be.equal(
        pointAfterPurchase
      )
      Cypress.env('CUSTOMER_POINT', pointAfterPurchase)
    })
  })

  it('Shows Purchased Voucher in My Voucher List', () => {
    // check my vouchers
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/voucher/my-voucher',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      const { activeVouchers } = response.body.data
      const redeemedVoucherExist = activeVouchers.filter((vcr) => {
        vcr.tbsCodeVoucherProgram ==
          Cypress.env('VOUCHER_TO_BUY').tbsCodeVoucherProgram
      })
      expect(
        redeemedVoucherExist.length,
        'Purchased Voucher exist in my voucher'
      ).to.be.greaterThan(0)
      const purchasedVoucher = redeemedVoucherExist[0]
      expect(purchasedVoucher.redeemDate).to.be.null
      expect(purchasedVoucher.available).to.be.true
      expect(purchasedVoucher.status).to.equal('available')
    })
  })

  // failed to boy voucher with insufficient point
  it('Failed to buy voucher with insufficient point', () => {
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.log({ point: myPoint })

    // get voucher to buy
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/online-voucher-redemption/list',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).then((response) => {
      const unaffordableVouchers = response.body.data.filter((vcr) => {
        const insufficientPoint = vcr.redeemPoint > myPoint
        return insufficientPoint
      })
      const voucherToBuy = unaffordableVouchers[0]
      console.log(voucherToBuy)

      Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])

      cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
      // purchase voucher
      cy.api({
        method: 'POST',
        url: Cypress.env('REDEEM_URL'),
        headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
        failOnStatusCode: false,
        body: {
          voucherId: voucherToBuy._id
        }
      }).should((_response) => {
        expect(_response.status, 'Expect Http status 400').to.equal(400)
      })
    })
  })

  it('failed to buy voucher when voucher quota limit is exceeded', () => {})
})
