const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

describe('Staff Create Order Redemption for Member Customer', function() {
  it('Successfully login', () => {
    const url = URL_USER + "/employee/login"
    cy.api({
      method: "POST",
      url,
      body: {
        nik: "05593",
        storeCode: "14160",
        pin: "1234"
      }
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const body = response.body
      expect(body).to.haveOwnProperty("statusCode")
      expect(body).to.haveOwnProperty("message")
      expect(body).to.haveOwnProperty("data")
      expect(body.statusCode).to.equal(201)
      expect(body.message).to.equal("Success")
      const data = body.data
      expect(data).to.haveOwnProperty("accessToken")
    })
    .then(response => {
      const employeeToken = response.body.data.accessToken
      Cypress.env("REQUEST_HEADERS", {
        Authorization: "Bearer " + employeeToken,
        channel: "pos"
      })
    })
  })

  it("Check shift", () => {
    const url = URL_USER + "/employee/shift"
    cy.api({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      failOnStatusCode: false
    })
    .should(response => {
      const body = response.body
      expect(body).to.haveOwnProperty("statusCode")
      expect(body).to.haveOwnProperty("message")
    })
    .then(response => {
      Cypress.env("RESPONSE_BODY", response.body)
    })
  })

  //senen perlu dicoba
  it("Close shift", () => {
    const body = Cypress.env("RESPONSE_BODY")
    if (body.statusCode === 200 && body.data.shift.status === "expired") {
      const url = URL_USER + "/employee/shift/close"
      cy.api({
        method: "POST",
        url,
        headers: Cypress.env("REQUEST_HEADERS"),
        failOnStatusCode: false
      })
      .should(response => {
        expect(response.status).to.equal(201)
      })
      .then(response => {
        Cypress.env("RESPONSE_BODY", response.body)
      })
    } else {
      cy.log('tidak perlu close shift')
    }
  })

  it("Open shift", () => {
    const body = Cypress.env("RESPONSE_BODY")
    if (body.statusCode === 201) {
      const url = URL_USER + "/employee/shift/open"
      cy.api({
        method: "POST",
        url,
        headers: Cypress.env("REQUEST_HEADERS"),
        failOnStatusCode: false
      })
      .should(response => {
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 400) {
      const url = URL_USER + "/employee/shift/open"
      cy.api({
        method: "POST",
        url,
        headers: Cypress.env("REQUEST_HEADERS"),
        failOnStatusCode: false
      })
      .should(response => {
        expect(response.status).to.equal(201)
      })
    } else {
      cy.log('shift sedang berjalan')
    }
  })

  it("Create Redemption Cart", () => {
    const url = URL_PRODUCT + "/employee/cart-redemption"
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        isGuest: true,
        firstName: "Sandra",
        lastName: "Testtest",
        cardNumber: "10000115160820",
        isFamily: false,
        customerGroup: "FAN",
        isScanner: true
      },
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const data = response.body.data
      expect(data.customer.firstName).to.equal("Sandra")
    })
  })

})