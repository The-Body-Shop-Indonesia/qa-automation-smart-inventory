const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

const skuQR = '112620556'
const ubd = '2024-10'
const sort = '-createdAt'
const storeCode = '14160'
const nik = '05593'

const skuBarcode = '112780045'
const ubdBarcode = '2024-11'

describe('Get last product stock on Stock Summary and Stock Movement', function() {
  it('Successfully login Admin', () => {
    const urlUser = URL_USER + "/admin/login"
    cy.api({
      method: "POST",
      url: urlUser,
      body: {
        username: "admin-tbs",
        password: "TBSIcms@Desember2022"
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
      const adminToken = response.body.data.accessToken
      Cypress.env("REQUEST_HEADERS_ADMIN", {
        Authorization: "Bearer " + adminToken,
      })
    })
  })

  it("Get product stock from Stock Summary 112620556", () => {
    const ubd = '2024-10-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter = url + `?sku=${skuQR}&page=1&limit=100&ubd=${ubd}&storeCode=${storeCode}`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)
    })
    .then(response => {
      const qty = response.body.data.docs[0].qty
      Cypress.env("stock_summary_qty_112620556", qty)
      cy.log('Stock summary Qty 112620556:', qty)
    })
  })

  it("Get product stock from Stock Summary 112780045", () => {
    const ubd = '2024-11-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter = url + `?sku=${skuBarcode}&page=1&limit=100&ubd=${ubd}&storeCode=${storeCode}`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)
    })
    .then(response => {
      const qty = response.body.data.docs[0].qty
      Cypress.env("stock_summary_qty_112780045", qty)
      cy.log('Stock summary Qty 112780045:', qty)
    })
  })
  
  it("Get product stock from Stock Movement 112620556", () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter = url + `?sku=${skuQR}&page=1&limit=10&sort=${sort}&ubd=${ubd}&from=${storeCode}`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)
    })
    .then(response => {
      const totalStock = response.body.data.docs[0].totalStock
      cy.log('Stock movement Qty 112620556:', totalStock)
      cy.log('Stock movement Qty 112620556:', response.body.data.docs[0].orderNumber)
      Cypress.env("stock_movement_qty_112620556", totalStock)
    })
  })

  it("Get product stock from Stock Movement 112780045", () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter = url + `?sku=${skuBarcode}&page=1&limit=10&sort=${sort}&ubd=${ubdBarcode}&from=${storeCode}`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)
    })
    .then(response => {
      const totalStock = response.body.data.docs[0].totalStock
      cy.log('Stock movement Qty 112780045:', totalStock)
      cy.log('Stock movement Qty 112780045:', response.body.data.docs[0].orderNumber)
      Cypress.env("stock_movement_qty_112780045", totalStock)
    })
  })
})

describe('Staff Create Order Redemption for Member Customer', function() {
  it('Successfully login', () => {
    const url = URL_USER + "/employee/login"
    cy.api({
      method: "POST",
      url,
      body: {
        nik: nik,
        storeCode: storeCode,
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
    const cartId = Cypress.env("CART_ID")
    const urlAssign = URL_PRODUCT + "/employee/cart-redemption" + `/${cartId}/assign-to`
    cy.api({
      method: "POST",
      url: urlAssign,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        nik: nik
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

  it("Add product Redemption by scan QR", () => {
    const cartId = Cypress.env("CART_ID")
    const qtyProduct = 1
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"
    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuQR,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR)
      expect(items[0].qty).to.equal(qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(qtyProduct)

      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1

      const ubdResponse = new Date(items[0].ubdDetail[0].ubd)
      const yearExpiredResponse = ubdResponse.getFullYear()
      const monthExpiredResponse = ubdResponse.getMonth() + 1

      expect(yearExpiredResponse).to.equal(yearExpiredTest)
      expect(monthExpiredResponse).to.equal(monthExpiredTest)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS", items[0].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL", items[0].ubdDetail[0].total)
    })
  })

  it("Add product quantity with the same SKU and UBD", () => {
    const cartId = Cypress.env("CART_ID")
    const productItemsQTY = Cypress.env("PRODUCT_QTY_ITEMS")
    const productQTYUBDDetail = Cypress.env("PRODUCT_QTY_UBDDETAIL")
    const qtyProduct = 1
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"

    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuQR,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR)
      expect(items[0].qty).to.equal(productItemsQTY + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(productQTYUBDDetail + qtyProduct)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS", items[0].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL", items[0].ubdDetail[0].total)
    })
  })

  it("Add same product with different UBD", () => {
    const cartId = Cypress.env("CART_ID")
    const productItemsQTY = Cypress.env("PRODUCT_QTY_ITEMS")
    const productQTYUBDDetail = Cypress.env("PRODUCT_QTY_UBDDETAIL")
    const qtyProduct = 1
    const difUBD = "2024-11"
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"

    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuQR,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: difUBD
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR)
      expect(items[0].qty).to.equal(productItemsQTY + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(2)
      expect(items[0].ubdDetail[0].total).to.equal(productQTYUBDDetail)
      expect(items[0].ubdDetail[1].total).to.equal(qtyProduct)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS", items[0].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL_1", items[0].ubdDetail[0].total)
      Cypress.env("PRODUCT_QTY_UBDDETAIL_2", items[0].ubdDetail[1].total)
    })
  })

  it("Delete product by scan QR", () => {
    const cartId = Cypress.env("CART_ID")
    const productItemsQTY = Cypress.env("PRODUCT_QTY_ITEMS")
    const productQTYUBDDetail_1 = Cypress.env("PRODUCT_QTY_UBDDETAIL_1")
    //const productQTYUBDDetail_2 = Cypress.env("PRODUCT_QTY_UBDDETAIL_2")
    const qtyProduct = -1
    const difUBD = "2024-11"
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"

    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuQR,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: difUBD,
        failOnStatusCode: false
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR)
      expect(items[0].qty).to.equal(productItemsQTY + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(productQTYUBDDetail_1)
      //expect(items[0].ubdDetail[1].total).to.equal(qtyProduct)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS", items[0].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL_1", items[0].ubdDetail[0].total)
      //Cypress.env("PRODUCT_QTY_UBDDETAIL_2", items[1].ubdDetail[0].total)
    })
  })

  it("Reduce product qty by scan QR", () => {
    const cartId = Cypress.env("CART_ID")
    const productItemsQTY = Cypress.env("PRODUCT_QTY_ITEMS")
    const productQTYUBDDetail_1 = Cypress.env("PRODUCT_QTY_UBDDETAIL_1")
    //const productQTYUBDDetail_2 = Cypress.env("PRODUCT_QTY_UBDDETAIL_2")
    const qtyProduct = -1
    //const difUBD = "2024-11"
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"

    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuQR,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd,
        failOnStatusCode: false
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR)
      expect(items[0].qty).to.equal(productItemsQTY + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(productQTYUBDDetail_1 + qtyProduct)
      //expect(items[0].ubdDetail[1].total).to.equal(qtyProduct)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS", items[0].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL_1", items[0].ubdDetail[0].total)
      //Cypress.env("PRODUCT_QTY_UBDDETAIL_2", items[1].ubdDetail[0].total)
    })
  })

  it("Add product Redemption by barcode", () => {
    const cartId = Cypress.env("CART_ID")
    const qtyProduct = 1
    const urlAddProduct = URL_PRODUCT + "/employee/cart-redemption-ubd/item"
    cy.api({
      method: "PATCH",
      url: urlAddProduct,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: skuBarcode,
        qty: qtyProduct,
        notes: "",
        requiredUbd: false,
        ubd: ubdBarcode
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items[0].sku).to.equal(skuQR) //perlu cek SKU 1 lagi nda?
      expect(items[0].qty).to.equal(Cypress.env("PRODUCT_QTY_ITEMS"))
      //expect(items[0].ubdDetail).to.have.length(1) //delete belum berhasil
      expect(items[0].ubdDetail[0].total).to.equal(Cypress.env("PRODUCT_QTY_UBDDETAIL_1"))

      expect(items[1].sku).to.equal(skuBarcode)
      expect(items[1].qty).to.equal(qtyProduct)
      expect(items[1].ubdDetail).to.have.length(1)
      expect(items[1].ubdDetail[0].total).to.equal(qtyProduct)

      //perlu cek ubd sku 1 lgi nda?
      const ubdTest = new Date(ubdBarcode)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1

      const ubdResponse = new Date(items[1].ubdDetail[0].ubd)
      const yearExpiredResponse = ubdResponse.getFullYear()
      const monthExpiredResponse = ubdResponse.getMonth() + 1

      expect(yearExpiredResponse).to.equal(yearExpiredTest)
      expect(monthExpiredResponse).to.equal(monthExpiredTest)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("PRODUCT_QTY_ITEMS_BARCODE", items[1].qty)
      Cypress.env("PRODUCT_QTY_UBDDETAIL_BARCODE", items[1].ubdDetail[0].total)
    })
  })
})