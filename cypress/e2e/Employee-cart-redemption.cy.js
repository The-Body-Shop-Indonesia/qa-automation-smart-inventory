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
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
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
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
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
        isGuest: false,
        firstName: "Sandra",
        lastName: "Testtest",
        cardNumber: "10000115160820",
        nik: "",
        familyNumber: "",
        isFamily: false,
        customerGroup: "FAN",
        image: "https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/0a145430-550a-4099-93d4-9e2b4e63ca5a.jpeg",
        isScanner: true,
        isLapsed: true,
        isReactivated: true,
        isIcarusAppUser: true,
        autoEnroll: true,
        autoEnrollFrom: "string"
      },
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const body = response.body
      const data = response.body.data
      expect(body.statusCode).to.equal(201)
      expect(data.customer.firstName).to.equal("Sandra")
      expect(data.customer.lastName).to.equal("Testtest")
      expect(data.customer.isGuest).to.equal(false)
      expect(data.customer.cardNumber).to.equal("10000115160820")
      expect(data.customer.customerGroup).to.equal("FAN")
    })
    .then(response => {
      Cypress.env("CART_ID", response.body.data._id)
    })
  })

  it("Assign employee to cart", () => {
    const cart_id = Cypress.env("CART_ID")
    const urlAssign = URL_PRODUCT + "/employee/cart-redemption" + `/${cart_id}/assign-to`
    cy.api({
      method: "POST",
      url: urlAssign,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        nik: "14310"
      },
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const body = response.body
      const data = response.body.data
      expect(body.statusCode).to.equal(201)
    })
  })

})