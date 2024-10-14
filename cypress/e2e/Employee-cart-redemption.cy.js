const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")
const URL_PRODUCT_REDEMPTION = URL_PRODUCT + "/employee/cart-redemption-ubd/item"
const URL_REDEMPTION_ORDER = URL_PRODUCT + "/order-redemption"

const sku_112620556 = '112620556'
const ubd_112620556 = '2024-10'
const sort_desc = '-createdAt'
const store_code = '14160'
const nik_employee = '05593'

const sku_112780045 = '112780045'
const ubd_112780045 = '2024-11'

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
    const urlFilter = url + `?sku=${sku_112620556}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
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
    const urlFilter = url + `?sku=${sku_112780045}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
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
    const urlFilter = url + `?sku=${sku_112620556}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_112620556}&from=${store_code}`
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
    const urlFilter = url + `?sku=${sku_112780045}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_112780045}&from=${store_code}`
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

describe('Staff Add Cart Redemption for Member Customer', function() {
  it('Successfully login', () => {
    const url = URL_USER + "/employee/login"
    cy.api({
      method: "POST",
      url,
      body: {
        nik: nik_employee,
        storeCode: store_code,
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
      cy.log(Cypress.env("CART_ID"))
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
        nik: nik_employee
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

describe('Add product Redemption test group', function() {
  it("Add product Redemption by scan QR", () => {
    const cartId = Cypress.env("CART_ID")
    const qtyProduct = 1
    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112620556,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd_112620556
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(1)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(qtyProduct)

      const ubdTest = new Date(ubd_112620556)
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

      Cypress.env("SKU_112620556_DATA", items[0])
    })
  })

  it("Add product quantity with the same SKU and UBD", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_qty = sku_112620556_data.ubdDetail[0].total
    const qtyProduct = 1

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112620556,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd_112620556
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(1)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_qty + qtyProduct)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
    })
  })

  it("Add same product with different UBD", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_qty = sku_112620556_data.ubdDetail[0].total
    const qtyProduct = 1
    const different_UBD = "2024-11"

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112620556,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: different_UBD
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(1)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(2)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_qty)
      expect(items[0].ubdDetail[1].total).to.equal(qtyProduct)

      const ubdTest = new Date(different_UBD)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1

      const ubdResponse = new Date(items[0].ubdDetail[1].ubd)
      const yearExpiredResponse = ubdResponse.getFullYear()
      const monthExpiredResponse = ubdResponse.getMonth() + 1

      expect(yearExpiredResponse).to.equal(yearExpiredTest)
      expect(monthExpiredResponse).to.equal(monthExpiredTest)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
    })
  })

    it("Add product redemption UBD null/barcode", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_0_qty = sku_112620556_data.ubdDetail[0].total
    const sku_112620556_ubddetail_1_qty = sku_112620556_data.ubdDetail[1].total
    const qtyProduct = 1

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112780045,
        qty: qtyProduct,
        notes: "",
        requiredUbd: false,
        ubd: ""
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(2)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty)
      expect(items[0].ubdDetail).to.have.length(2)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_0_qty)
      expect(items[0].ubdDetail[1].total).to.equal(sku_112620556_ubddetail_1_qty)

      expect(items[1].sku).to.equal(sku_112780045)
      expect(items[1].qty).to.equal(qtyProduct)
      expect(items[1].ubdDetail).to.have.length(1)
      expect(items[1].ubdDetail[0].total).to.equal(qtyProduct)
      expect(items[1].ubdDetail[0].ubd).to.equal(null)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
      Cypress.env("SKU_112780045_DATA", items[1])
    })
  })
})

describe('Reduce qty and remove product Redemption test group', function() {
  it("Reduce product quantity", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_0_qty = sku_112620556_data.ubdDetail[0].total
    const sku_112620556_ubddetail_1_qty = sku_112620556_data.ubdDetail[1].total
    const sku_112780045_data = Cypress.env("SKU_112780045_DATA")
    const sku_112780045_data_qty = sku_112780045_data.qty
    const sku_112780045_ubddetail_0_qty = sku_112780045_data.ubdDetail[0].total
    const qtyProduct = -1

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112620556,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: ubd_112620556
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(2)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(2)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_0_qty + qtyProduct)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_1_qty)

      expect(items[1].sku).to.equal(sku_112780045)
      expect(items[1].qty).to.equal(sku_112780045_data_qty)
      expect(items[1].ubdDetail).to.have.length(1)
      expect(items[1].ubdDetail[0].total).to.equal(sku_112780045_ubddetail_0_qty)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
      Cypress.env("SKU_112780045_DATA", items[1])
    })
  })

  it("Remove product from cart", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_0_qty = sku_112620556_data.ubdDetail[0].total
    //const sku_112620556_ubddetail_1_qty = sku_112620556_data.ubdDetail[1].total
    const sku_112780045_data = Cypress.env("SKU_112780045_DATA")
    const sku_112780045_data_qty = sku_112780045_data.qty
    const sku_112780045_ubddetail_0_qty = sku_112780045_data.ubdDetail[0].total
    const qtyProduct = -1
    const different_UBD = "2024-11"

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112620556,
        qty: qtyProduct,
        notes: "",
        requiredUbd: true,
        ubd: different_UBD
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(2)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty + qtyProduct)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_0_qty)

      expect(items[1].sku).to.equal(sku_112780045)
      expect(items[1].qty).to.equal(sku_112780045_data_qty)
      expect(items[1].ubdDetail).to.have.length(1)
      expect(items[1].ubdDetail[0].total).to.equal(sku_112780045_ubddetail_0_qty)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
      Cypress.env("SKU_112780045_DATA", items[1])
    })
  })

  //kena error 400 "sku 112780045 with Invalid Date ubd is not in cart"
  it("Delete product UBD null", () => {
    const cartId = Cypress.env("CART_ID")
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const sku_112620556_data_qty = sku_112620556_data.qty
    const sku_112620556_ubddetail_0_qty = sku_112620556_data.ubdDetail[0].total
    const qtyProduct = -1

    cy.api({
      method: "PATCH",
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart_id: cartId,
        sku: sku_112780045,
        qty: qtyProduct,
        notes: "",
        requiredUbd: false,
        ubd: null
      }
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      
      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(items).to.have.length(1)
      expect(items[0].sku).to.equal(sku_112620556)
      expect(items[0].qty).to.equal(sku_112620556_data_qty)
      expect(items[0].ubdDetail).to.have.length(1)
      expect(items[0].ubdDetail[0].total).to.equal(sku_112620556_ubddetail_0_qty)
    })
    .then(response => {
      const items = response.body.data.items

      Cypress.env("SKU_112620556_DATA", items[0])
      Cypress.env("SKU_112780045_DATA", items[1])
    })
  })

})

describe('Staff checkout Redemption Order', function() {
  it("Checkout Redemption order", () => {
    const cartId = Cypress.env("CART_ID")

    cy.api({
      method: "POST",
      url: URL_REDEMPTION_ORDER,
      headers: Cypress.env("REQUEST_HEADERS"),
      body: {
        cart: cartId,
        orderBy: nik_employee,
        notes: ""
      }
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const body = response.body
      const data = response.body.data
      //const items = response.body.data.items
      
      expect(body.statusCode).to.equal(201)
      expect(data.cartId).to.equal(cartId)
    })
  })

  it("Get product stock from Stock Summary 112620556", () => {
    const ubd = '2024-10-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter = url + `?sku=${sku_112620556}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
    const sku_112620556_data = Cypress.env("SKU_112620556_DATA")
    const qty_checkout_112620556 = sku_112620556_data.qty
    const stock_qty_summary_awal = Cypress.env("stock_summary_qty_112620556")
    //const sku_112620556_ubddetail_0_qty = sku_112620556_data.ubdDetail[0].total
    
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)

      const qty_summary_112620556 = stock_qty_summary_awal - qty_checkout_112620556
      expect(qty_summary_112620556)
      //dapetin qty di cart dikurangin sama summary
    })
  })

  it("Get product stock from Stock Summary 112780045", () => {
    const ubd = '2024-11-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter = url + `?sku=${sku_112780045}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
    const sku_112780045_data = Cypress.env("SKU_112780045_DATA")
    const qty_checkout_112780045 = sku_112780045_data.qty
    const stock_qty_summary_awal = Cypress.env("stock_summary_qty_112780045")

    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS_ADMIN")
    })
    .should(response => {
      expect(response.status).to.equal(200)

      const qty_summary_112780045 = stock_qty_summary_awal - qty_checkout_112780045
      cy.log(qty_summary_112780045)
      //dapetin quantity dikrang yg di cart
    })
  })
  
  // it("Get product stock from Stock Movement 112620556", () => {
  //   const url = URL_PRODUCT + '/admin/stock-movement'
  //   const urlFilter = url + `?sku=${sku_112620556}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_112620556}&from=${store_code}`
  //   cy.request({
  //     method: "GET",
  //     url: urlFilter,
  //     headers: Cypress.env("REQUEST_HEADERS_ADMIN")
  //   })
  //   .should(response => {
  //     expect(response.status).to.equal(200)
  //     //qty yg keluar get dari cart redmeption
  //     //ambil total stock ambil stock awal
  //   })
  //   .then(response => {
  //     const totalStock = response.body.data.docs[0].totalStock
  //     cy.log('Stock movement Qty 112620556:', totalStock)
  //     cy.log('Stock movement Qty 112620556:', response.body.data.docs[0].orderNumber)
  //     Cypress.env("stock_movement_qty_112620556", totalStock)
  //   })
  // })

  // it("Get product stock from Stock Movement 112780045", () => {
  //   const url = URL_PRODUCT + '/admin/stock-movement'
  //   const urlFilter = url + `?sku=${sku_112780045}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_112780045}&from=${store_code}`
  //   cy.request({
  //     method: "GET",
  //     url: urlFilter,
  //     headers: Cypress.env("REQUEST_HEADERS_ADMIN")
  //   })
  //   .should(response => {
  //     expect(response.status).to.equal(200)
  //     //qty yg keluar get dari cart redmeption
  //     //ambil total stock ambil stock awal
  //   })
  //   .then(response => {
  //     const totalStock = response.body.data.docs[0].totalStock
  //     cy.log('Stock movement Qty 112780045:', totalStock)
  //     cy.log('Stock movement Qty 112780045:', response.body.data.docs[0].orderNumber)
  //     Cypress.env("stock_movement_qty_112780045", totalStock)
  //   })
  // })
})