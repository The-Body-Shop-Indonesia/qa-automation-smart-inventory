const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")
const URL_PAYMENT = Cypress.config("baseUrlPayment")


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
      Cypress.env("CART", response.body.data)
    })
  })

  it("Sucessfully assign sales name", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/assign-to`
    const nik = "00012"
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: { nik }
    })
    .should(response => {
      const actualData = response.body.data.assignTo
      expect(actualData.nik).to.equal(nik)
      Cypress.env("CART", response.body.data)
    })
  })

  it("Successfully add 1 new item", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/item/add`
    const payload = {
      "sku": "112010666",
      "qty": 1,
      "customPrice": 0,
      "notes": ""
    }
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: payload
    })
    .should(response => {
      const data = response.body.data
      expect(data.items.length).to.equal(1)
      expect(data.void_items.length).to.equal(0)

      const item = data.items[0]
      expect(item.sku).to.equal(payload.sku)
      expect(item.qty).to.equal(payload.qty)
      expect(item.customPrice).to.equal(payload.customPrice)
      expect(item.ubd).to.equal(null)

      const ubdDetail = item.ubdDetail[0]
      expect(ubdDetail.ubd).to.equal(null)
      expect(ubdDetail.total).to.equal(1)
    })
    .should(response => {
      const data = response.body.data
      const itemPrice = data.items[0].sub_total
      expect(data.totalAmount).to.equal(itemPrice)
      expect(data.paymentAmount).to.equal(itemPrice)

      const paymentDetails = data.paymentDetails
      expect(paymentDetails[0].total).to.equal(itemPrice)
      expect(paymentDetails[12].total).to.equal(itemPrice)

      Cypress.env("CART", data)
    })


  })

  it("Successfully increasing item's quantity to 2", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/item/add`
    const payload = {
      "sku": "112010666",
      "qty": 1,
      "customPrice": 0,
      "notes": ""
    }
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: payload
    })
    .should(response => {
      const data = response.body.data
      expect(data.items.length).to.equal(1)
      expect(data.void_items.length).to.equal(0)

      const item = data.items[0]
      expect(item.sku).to.equal(payload.sku)
      expect(item.qty).to.equal(2)
      expect(item.customPrice).to.equal(payload.customPrice)
      expect(item.ubd).to.equal(null)

      const ubdDetail = item.ubdDetail[0]
      expect(ubdDetail.ubd).to.equal(null)
      expect(ubdDetail.total).to.equal(2)
    })
    .should(response => {
      const data = response.body.data
      const itemPrice = data.items[0].sub_total
      expect(data.totalAmount).to.equal(itemPrice)
      expect(data.paymentAmount).to.equal(itemPrice)

      const paymentDetails = data.paymentDetails
      expect(paymentDetails[0].total).to.equal(itemPrice)
      expect(paymentDetails[12].total).to.equal(itemPrice)

      Cypress.env("CART", data)
    })
  })

  it("Error when searched sku is not in the database", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/item/add`
    const payload = {
      "sku": "1234567891",
      "qty": 1,
      "customPrice": 0,
      "notes": ""
    }
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: payload,
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal("Product not found.")
    })
  })

  it("Successfully add 1 more new item", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/item/add`
    const payload = {
      "sku": "126490005",
      "qty": 1,
      "customPrice": 0,
      "notes": ""
    }
    cy.api({
      method: "POST",
      url,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: payload
    })
    .should(response => {
      const data = response.body.data
      expect(data.items.length).to.equal(2)
      expect(data.void_items.length).to.equal(0)

      const item = data.items[1]
      expect(item.sku).to.equal(payload.sku)
      expect(item.qty).to.equal(payload.qty)
      expect(item.customPrice).to.equal(payload.customPrice)
      expect(item.ubd).to.equal(null)

      const ubdDetail = item.ubdDetail[0]
      expect(ubdDetail.ubd).to.equal(null)
      expect(ubdDetail.total).to.equal(1)
    })
    .should(response => {
      const data = response.body.data
      const itemsSubtotal = data.items.reduce((total, { sub_total }) => total + sub_total, 0)
      expect(data.totalAmount).to.equal(itemsSubtotal)
      expect(data.paymentAmount).to.equal(itemsSubtotal)

      const paymentDetails = data.paymentDetails
      expect(paymentDetails[0].total).to.equal(itemsSubtotal)
      expect(paymentDetails[12].total).to.equal(itemsSubtotal)
      Cypress.env("CART", data)
    })
  })

  // describe("Sucessfully handle GWP products (if any)", function() {
  //   let gwpOptions
  //   before(() => {
  //     this.gwpOptions = Cypress.env("CART")
  //     cy.wrap(gwpOptions).as('gwpOptions');
  //   })

  //   it ("Sucessfully select GWP product", function() {
  //     const gwpOptions = Cypress.env("CART").freeProductOptions
  //     gwpOptions.forEach((gwp, idx ) => {
  //       expect(gwp).to.haveOwnProperty("ruleId")
  //       expect(gwp).to.haveOwnProperty("displayName")
  //       expect(gwp).to.haveOwnProperty("products")

  //       const selectedProduct = gwp.products[0]
  //       expect(selectedProduct).to.haveOwnProperty("sku")
        
  //       const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/select-gwp`
  //       const payload = {
  //         sku: selectedProduct.sku,
  //         ruleId: gwp.ruleId
  //       }
  //       cy.api({
  //         method: "POST",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         body: payload
  //       })
  //       .should(response => {
  //         expect(response.status).to.equal(201)
  //         const data = response.body.data
  //         expect(data).to.haveOwnProperty("freeProductOptionsSelected")
  //       })
  //       .then(response => {
  //         const data = response.body.data
  //         cy
  //           .wrap(data.freeProductOptionsSelected)
  //           .then((arr) => { expect(arr.some(obj => Cypress._.isEqual(obj, payload))).to.be.true });

  //         Cypress.env("CART", response)
  //       })
  //     })
  //   })
  // })


  it(`Successfully select "Tunai" as payment method`, () => {
    const cart = Cypress.env("CART")
    const mockPayload = {
      "method": "18",
      "isInstallment": false,
      "token": "",
      "installmentTenor": 0,
      "isOvo": false,
      "ovoNumber": "",
      "ovoRetryCount": 0,
      "bin_number": "",
      approvalCode: "AUT123",
      value: cart.paymentAmount
    }

    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/update-payment-v2`
    cy.api({
      url,
      method: "PATCH",
      headers: Cypress.env("REQUEST_HEADERS"),
      body: mockPayload
    }).should(response => {
      expect(response.status).to.equal(200)

      const body = response.body.data
      // validate payment field
      const { info, name, changeDue, ...paymentObjResponse } = body.payments
      expect(paymentObjResponse).to.deep.equal(mockPayload)

      // validate multipayment
      expect(body.multiPayments).to.be.an('array');
      expect(body.multiPayments.length).to.be.greaterThan(0)
      Cypress.env("CART", response.body.data)
    })
  })

  it("Successfully validates pre-order informations", () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env("CUSTOMER_ID")}/validate-purchase`
    cy.api({
      url,
      method: "GET",
      headers: Cypress.env("REQUEST_HEADERS"),
    }).should(response => {
      expect(response.status).to.equal(200)
    })
  })

  it("Successfully create order", () => {
    const cart = Cypress.env("CART")

    // expect(cart.omni_trx_type).to.equal("WALK_IN")
    // expect(cart.is_omni).to.equal(false)

    const payload = {
      "cart": cart._id,
      "approvalCode": cart.payments.approvalCode,
      "notes": ""
    }

    const url = URL_PRODUCT + `/order/create-v2`
    cy.api({
      url,
      method: "POST",
      headers: Cypress.env("REQUEST_HEADERS"),
      body: payload
    }).should(response => {
      expect(response.status).to.equal(201)
      const body = response.body.data

      expect(body).to.haveOwnProperty("orderNumber")
      expect(body.cartId).to.equal(cart._id)

      expect(body.items).to.be.an('array');
      expect(body.items.length).to.be.greaterThan(0);
      let totalItemPrice = 0
      body.items.forEach(item => {
        totalItemPrice += item.grandTotal
        const qty = item.qty
        const totalQtyFromUbdDetail = item.ubdDetail.reduce((total, ubd) => {
          total += ubd.total
          return total
        }, 0)
        expect(qty).to.equal(totalQtyFromUbdDetail)
      })

      expect(body.totalAmount).to.equal(totalItemPrice)
      expect(body.paymentAmount).to.equal(totalItemPrice)
      expect(body.payments.paymentStatus).to.equal('Paid')
      expect(body.paymentStatus).to.equal('Paid')
      expect(body.orderStatus).to.equal('PAID')
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
 *jamil_testing
 */ 
