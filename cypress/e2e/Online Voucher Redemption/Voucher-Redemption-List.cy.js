describe('General API Test Group', () => {
  before(() => {
    const customerToken = Cypress.env('TOKEN_CUSTOMER_BOB')
    Cypress.env('CUSTOMER_REQ_HEADERS', {
      Authorization: 'Bearer ' + customerToken,
      channel: 'web'
    })
  })

  it('Shows My Current Point', () => {
    const URL_USER = Cypress.config('baseUrlUser')
    const url = URL_USER + '/membership/point'

    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Expect Status Code to be 200').to.equal(200)
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
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      expect(response.status, 'Expect Statuscode to be 200').to.equal(200)
      const vouchers = response.body.data

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
    })
  })

  it('Shows Vouchers as Grayed-out, When Customer`s Point is Insufficient', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url = URL_PRODUCT + '/online-voucher-redemption/list'
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      response.body.data.forEach((voucher) => {
        const { redeemPoint, isDisplay } = voucher
        if (myPoint < redeemPoint) {
          expect(isDisplay, 'Check Field [isDisplay]').to.be.false
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
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      // check if there are any unaffordable vouchers exist, they have to be at the end of the list
      const unaffordableVouchers = response.body.data.filter(
        (vcr) => vcr.redeemPoint > myPoint
      ).length

      // if there are any, the last N items of the list must have isDisplay False
      const body = response.body.data
      const length = body.length
      for (let i = 1; i <= unaffordableVouchers; i++) {
        const vouchersToCheck = body[length - i]
        expect(vouchersToCheck.isDisplay).to.be.false
      }
    })
  })

  it('Shows The Right Result When Search Filter is Applied', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const query = 'meong'
    const url =
      URL_PRODUCT + '/online-voucher-redemption/list' + `?search=${query}`
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      const body = response.body.data
      const regex = new RegExp(query, 'gi')
      for (let voucher of body) {
        const match = voucher.displayName.match(regex)
        expect(match).to.be.not.null
      }
    })
  })

  // expired vouchers?
  it('', () => {})

  // used vouchers?
  it('', () => {})

  // sort & pagination tests. sort by price is important!
  it('', () => {})

  // Filter tests
  it('', () => {})
})
