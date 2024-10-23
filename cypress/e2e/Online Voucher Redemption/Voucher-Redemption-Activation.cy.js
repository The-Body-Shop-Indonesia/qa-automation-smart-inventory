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

  it('Shows error 400 when request voucherId is the wrong format', () => {
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

  it('Shows error 400 when request voucherId is the wrong format', () => {
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

  // ---- business sections
  // success to buy voucher with sufficient point
  it('success to buy voucher with sufficient point', () => {})

  // failed to boy voucher with insufficient point
  it('failed to buy voucher with insufficient point', () => {})

  it('failed to buy voucher when voucher quota limit is exceeded', () => {})

  it('successfully bought vouchers should be listed on my voucher page', () => {})

  it('', () => {})
})
