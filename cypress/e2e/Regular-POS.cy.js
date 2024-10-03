const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

describe('Staff Create Order for Public Customer', function() {
  it('Successfully login', () => {
    const url = URL_USER + "/employee/login"
    cy.api({
      method: "POST",
      url,
      body: {
        nik: "00012",
        storeCode: "14036",
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

  it("Shows all cart list", () => {
    const url = URL_PRODUCT + "/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0"
    cy.api({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
    })
  })

  it("Creates a public cart", () => {
    const { request: mockRequest, response: mockResponse } = require("../fixtures/generators").createPublicCartPayload()
    const url = URL_PRODUCT + "/employee/cart/create"
    cy.api({
      method: "POST",
      url,
      body: mockRequest,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const data = response.body.data
      delete data.user
      delete data.customer.id
      delete data.customer._id
      delete data.createdBy.updatedAt
      delete data.createdBy.lastLogin
      delete data.createdBy.shiftAttendanceId
      delete data.createdBy.shiftCode
      delete data._id
      delete data.updatedAt
      delete data.createdAt
      expect(data).to.deep.equal(mockResponse)
      Cypress.env('PUBLIC_CUSTOMER_FIRSTNAME', mockRequest.firstName);
    })
  })

  it("Shows recently created public cart on the first list", () => {
    const url = URL_PRODUCT + "/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0"
    cy.api({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const data = response.body.data
      const firstItem = data.docs[0]
      Cypress.env("CUSTOMER_ID", firstItem.customer_id)
      delete firstItem._id
      delete firstItem.customer_id

      const firstname = Cypress.env("PUBLIC_CUSTOMER_FIRSTNAME")
      const expected = require("../fixtures/generators").newlyCreatedPublicCart(firstname)
      expect(firstItem).to.deep.equal(expected)
    })
  })

  it("Shows empty cart details", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}`
    cy.api({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
      expect(response.body.data.items.length).to.equal(0)
      expect(response.body.data.totalAmount).to.equal(0)
      expect(response.body.data.totalWeight).to.equal(0)
      expect(response.body.data.paymentAmount).to.equal(0)
      expect(response.body.data.currentPayment).to.equal(0)

    })
  })
})


/**
 * ------ JOURNEY 1 ------
 * 
 * 1. create cart customer public
 * 2. Get cart list
 * 3. Open Newly created cart
 * 4. Assign Nama Sales
 * 5. Add new Item (112010666)
 * 6. Add qty newly added item (112010666)
 * 7. Add notes to 112010666
 * 8. Add Void Item (112010666)
 * 9. select GWP (if any)
 * 10. select payment (Cash)
 * 11. masuk ke halaman konfirmasi order
 * 12. create order
 */
