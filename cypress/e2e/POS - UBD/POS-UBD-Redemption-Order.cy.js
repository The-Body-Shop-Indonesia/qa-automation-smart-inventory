const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PRODUCT_REDEMPTION =
  URL_PRODUCT + '/employee/cart-redemption-ubd/item'
const URL_REDEMPTION_ORDER = URL_PRODUCT + '/order-redemption'

const sku_redemption_1 = '112620556'
const ubd_redemption_1 = '2024-10'
const different_UBD = '2024-11'
const qty_sku_redemption_1 = 1
const sort_desc = '-updatedAt'
const store_code = Cypress.env('STORE_CODE_BXC')
const nik_employee = Cypress.env('NIK_BXC')
const first_name = Cypress.env('FIRST_NAME')
const last_name = Cypress.env('LAST_NAME')
const card_number = Cypress.env('CARD_NUMBER')

const sku_redemption_2 = '112780045'
const ubd_redemption_2 = 'null'
const qty_sku_redemption_2 = 1

describe('Get last product stock on Stock Summary and Stock Movement', function () {
  it('Successfully login Admin', () => {
    cy.log(Cypress.env('ADMIN_USERNAME'))
    const urlUser = URL_USER + '/admin/login'
    const username_adm = Cypress.env('ADMIN_USERNAME')
    const password_adm = Cypress.env('ADMIN_PASSWORD')

    cy.api({
      method: 'POST',
      url: urlUser,
      body: {
        username: username_adm,
        password: password_adm
      }
    })
      .should((response) => {
        expect(response.status, 'Response code should be 201').to.equal(201)
        const body = response.body
        expect(body.statusCode, 'Status code should be 201').to.equal(201)
        expect(body.message).to.equal('Success')
        const data = body.data
        expect(data).to.haveOwnProperty('accessToken')
      })
      .then((response) => {
        const adminToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS_ADMIN', {
          Authorization: 'Bearer ' + adminToken
        })
      })
  })

  //stock summary
  it(`Get product stock from Stock Summary ${sku_redemption_1}`, () => {
    //const ubd = '2024-10-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter =
      url +
      `?sku=${sku_redemption_1}&page=1&limit=100&ubd=${ubd_redemption_1}&storeCode=${store_code}`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        const data = response.body.data
        expect(response.status, 'Response code should be 200').to.equal(200)
        expect(data.totalDocs, 'Total Docs should be 1').to.equal(1)
      })
      .then((response) => {
        const qty = response.body.data.docs[0].qty
        Cypress.env('stock_summary_qty_112620556', qty)
        cy.log('Stock summary Qty 112620556:', qty)
      })
  })

  it(`Get product stock from Stock Summary ${sku_redemption_2}`, () => {
    //const ubd = '2024-11-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter =
      url +
      `?sku=${sku_redemption_2}&page=1&limit=100&ubd=${ubd_redemption_2}&storeCode=${store_code}`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        const data = response.body.data
        expect(response.status, 'Response code should be 200').to.equal(200)
        expect(data.totalDocs, 'Total Docs should be 1').to.equal(1)
      })
      .then((response) => {
        const qty = response.body.data.docs[0].qty
        Cypress.env('stock_summary_qty_112780045', qty)
        cy.log('Stock summary Qty 112780045:', qty)
      })
  })

  //stock movement
  it(`Get product stock from Stock Movement ${sku_redemption_1}`, () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter =
      url +
      `?sku=${sku_redemption_1}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_redemption_1}&from=${store_code}`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const totalStock = response.body.data.docs[0].totalStock
        cy.log(`Stock movement Qty ${sku_redemption_1}:`, totalStock)
        //cy.log('Stock movement Qty 112620556:', response.body.data.docs[0].orderNumber)
        Cypress.env('stock_movement_sku_1', totalStock)
      })
  })

  it(`Get product stock from Stock Movement ${sku_redemption_2}`, () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter =
      url +
      `?sku=${sku_redemption_2}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_redemption_2}&from=${store_code}`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const totalStock = response.body.data.docs[0].totalStock
        cy.log(`Stock movement Qty ${sku_redemption_2}:`, totalStock)
        //cy.log('Stock movement Qty 112780045:', response.body.data.docs[0].orderNumber)
        Cypress.env('stock_movement_sku_2', totalStock)
      })
  })
})

describe('Staff Add Cart Redemption for Member Customer', function () {
  it('Successfully login', () => {
    const url = URL_USER + '/employee/login'
    const pin_emp = Cypress.env('PIN_BXC')
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee,
        storeCode: store_code,
        pin: pin_emp
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
        const employeeToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + employeeToken,
          channel: 'pos'
        })
      })
  })

  it('Check shift', () => {
    const url = URL_USER + '/employee/shift'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    })
      .should((response) => {
        const body = response.body
        expect(body).to.haveOwnProperty('statusCode')
        expect(body).to.haveOwnProperty('message')
      })
      .then((response) => {
        Cypress.env('RESPONSE_BODY', response.body)
      })
  })

  it('Close shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 200 && body.data.shift.status === 'expired') {
      const url = URL_USER + '/employee/shift/close'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      })
        .should((response) => {
          expect(response.status, 'Response code should be 201').to.equal(201)
        })
        .then((response) => {
          Cypress.env('RESPONSE_BODY', response.body)
        })
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
    } else {
      cy.log('tidak perlu close shift')
    }
  })

  it('Open shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 201) {
      const url = URL_USER + '/employee/shift/open'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 400) {
      const url = URL_USER + '/employee/shift/open'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status, 'Response code should be 201').to.equal(201)
      })
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
    } else {
      cy.log('shift sedang berjalan')
    }
  })

  it('Get user point before redemption', () => {
    const url =
      URL_USER + '/employee/detail-member/point' + `?cardNumber=${card_number}`
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 201').to.equal(201)
      })
      .then((response) => {
        const data = response.body.data

        Cypress.env('CURRENT_POINT', data.currentPoint)
      })
  })

  it('Create Redemption Cart', () => {
    const url = URL_PRODUCT + '/employee/cart-redemption'
    const url_cus =
      URL_USER + '/employee/detail-member?cardNumber=' + card_number
    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      const first_name = response.body.data.firstName
      const last_name = response.body.data.lastName
      const currentTier = response.body.data.currentTier.code

      Cypress.env('FIRST_NAME', first_name)
      Cypress.env('LAST_NAME', last_name)
      Cypress.env('CUST_TIER', currentTier)

      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        body: {
          isGuest: false,
          firstName: Cypress.env('FIRST_NAME'),
          lastName: Cypress.env('LAST_NAME'),
          cardNumber: card_number,
          nik: '',
          familyNumber: '',
          isFamily: false,
          customerGroup: Cypress.env('CUST_TIER'),
          image:
            'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/0a145430-550a-4099-93d4-9e2b4e63ca5a.jpeg',
          isScanner: true,
          isLapsed: true,
          isReactivated: true,
          isIcarusAppUser: true,
          autoEnroll: true,
          autoEnrollFrom: 'string'
        },
        failOnStatusCode: false
      })
        .should((data_response) => {
          expect(data_response.status, 'Response code should be 200').to.equal(
            201
          )
          const body = data_response.body
          const data = data_response.body.data
          expect(body.statusCode, 'Status code should be 200').to.equal(201)
          expect(
            data.customer.firstName,
            'First name should be ' + `${Cypress.env('FIRST_NAME')}`
          ).to.equal(Cypress.env('FIRST_NAME'))
          expect(
            data.customer.lastName,
            'Last name should be ' + `${Cypress.env('LAST_NAME')}`
          ).to.equal(Cypress.env('LAST_NAME'))
          expect(data.customer.isGuest, 'isGuest should be false').to.equal(
            false
          )
          expect(
            data.customer.cardNumber,
            'Card number should be ' + `${card_number}`
          ).to.equal(card_number)
          expect(data.customer.customerGroup).to.equal(Cypress.env('CUST_TIER'))
        })
        .then((response) => {
          Cypress.env('CART_ID', response.body.data._id)
          //cy.log(Cypress.env("CART_ID"))
        })
    })
  })

  it('Assign employee to cart', () => {
    const cartId = Cypress.env('CART_ID')
    const urlAssign =
      URL_PRODUCT + '/employee/cart-redemption' + `/${cartId}/assign-to`
    cy.api({
      method: 'POST',
      url: urlAssign,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        nik: nik_employee
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 201').to.equal(201)
      const body = response.body
      expect(body.statusCode, 'Status code should be 201').to.equal(201)
    })
  })
})

describe('Add product Redemption test group', function () {
  it(`Add product Redemption SKU ${sku_redemption_1} with UBD ${ubd_redemption_1}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = 1
    cy.api({
      method: 'PATCH',
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        cart_id: cartId,
        sku: sku_redemption_1,
        qty: qtyProduct,
        notes: '',
        requiredUbd: true,
        ubd: ubd_redemption_1
      }
    }).should((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      const ubdDetail = response.body.data.items.ubdDetail

      //check response protperties
      expect(data).to.haveOwnProperty('_id')
      expect(data).to.haveOwnProperty('omni_trx_type')
      expect(data).to.haveOwnProperty('is_omni')
      expect(data).to.haveOwnProperty('assignToStoreDispatcher')
      expect(data).to.haveOwnProperty('user')
      expect(data).to.haveOwnProperty('items')
      expect(data).to.haveOwnProperty('void_items')
      expect(data).to.haveOwnProperty('totalAmount')
      expect(data).to.haveOwnProperty('totalWeight')
      expect(data).to.haveOwnProperty('payments')
      expect(data).to.haveOwnProperty('multiPayments')
      expect(data).to.haveOwnProperty('billingAddress')
      expect(data).to.haveOwnProperty('shippingMethod')
      expect(data).to.haveOwnProperty('shippingAddress')
      expect(data).to.haveOwnProperty('shippingDetails')
      expect(data).to.haveOwnProperty('vouchers')
      expect(data).to.haveOwnProperty('paymentDetails')
      expect(data).to.haveOwnProperty('paymentAmount')
      expect(data).to.haveOwnProperty('currentPayment')
      expect(data).to.haveOwnProperty('isActive')
      expect(data).to.haveOwnProperty('isSendAsGift')
      expect(data).to.haveOwnProperty('greetingCartType')
      expect(data).to.haveOwnProperty('sendAsGiftDetail')
      expect(data).to.haveOwnProperty('storeCredit')
      expect(data).to.haveOwnProperty('store')
      //expect(data).to.haveOwnProperty("store_dispatcher")
      expect(data).to.haveOwnProperty('point')
      expect(data).to.haveOwnProperty('cartRuleApplied')
      expect(data).to.haveOwnProperty('customer')
      expect(data).to.haveOwnProperty('createdBy')
      expect(data).to.haveOwnProperty('channel')
      expect(data).to.haveOwnProperty('freeProducts')
      expect(data).to.haveOwnProperty('freeProductOptions')
      expect(data).to.haveOwnProperty('vatAmount')
      expect(data).to.haveOwnProperty('discountDetail')
      expect(data).to.haveOwnProperty('assignTo')
      expect(data).to.haveOwnProperty('totalAmountVoid')
      expect(data).to.haveOwnProperty('type')
      expect(data).to.haveOwnProperty('isScanner')
      expect(data).to.haveOwnProperty('cartRuleOnSubtotal')
      expect(data).to.haveOwnProperty('freeProductOptionsSelected')
      expect(data).to.haveOwnProperty('dealsId')
      expect(data).to.haveOwnProperty('itemOrders')
      expect(data).to.haveOwnProperty('total_redemption_point')
      expect(data).to.haveOwnProperty('createdAt')
      expect(data).to.haveOwnProperty('updatedAt')
      expect(data).to.haveOwnProperty('__v')
      items.forEach(function (item) {
        expect(item).to.haveOwnProperty('product')
        expect(item).to.haveOwnProperty('qty')
        expect(item).to.haveOwnProperty('sku')
        expect(item).to.haveOwnProperty('sub_total')
        expect(item).to.haveOwnProperty('notes')
        expect(item).to.haveOwnProperty('ubdDetail')
      })

      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)
      expect(data.createdBy.nik).to.equal(nik_employee)
      expect(data.channel).to.equal('pos')
      expect(data.type).to.equal('redemption')
      expect(data.isScanner).to.equal(true)
      expect(data.payments.method).to.equal('pts')
      expect(data.payments.name).to.equal('Pay with points')

      expect(items).to.have.length(1)
      const pointsArray = []

      for (let i = 0; i < items.length; i++) {
        console.log('Item: ' + items[i].sku)
        if (items[i].sku === sku_redemption_1) {
          expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
            sku_redemption_1
          )
          expect(items[i].qty, 'QTY Produk should be 1').to.equal(1)

          const ubdDetails_length = items[i].ubdDetail.length
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 1`
          ).to.have.length(1)
          for (let j = 0; j < ubdDetails_length; j++) {
            expect(items[i].ubdDetail[j].total).to.equal(1)

            const ubdTest = new Date(ubd_redemption_1)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1

            const ubdResponse = new Date(items[i].ubdDetail[j].ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1

            expect(yearExpiredResponse).to.equal(yearExpiredTest)
            expect(monthExpiredResponse).to.equal(monthExpiredTest)
          }
        }

        const pts_redemption = items[i].product.redemption_catalog.point
        const items_qty = items[i].qty
        const calculate_subtotal_pts = pts_redemption * items_qty
        console.log('Calculate Subtotal: ' + calculate_subtotal_pts)
        pointsArray.push(parseInt(calculate_subtotal_pts, 10)) // Convert to integer
      }

      const calculate_pts = pointsArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      )
      console.log('calculate_pts: ' + calculate_pts)
      expect(
        data.total_redemption_point,
        `Total Redemption Catalog should be ${calculate_pts}`
      ).to.equal(calculate_pts)
    })
  })

  it(`Add product redemption UBD null sku ${sku_redemption_1}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = 1

    cy.api({
      method: 'PATCH',
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        cart_id: cartId,
        sku: sku_redemption_2,
        qty: qtyProduct,
        notes: '',
        requiredUbd: false,
        ubd: ''
      }
    })
      .should((response) => {
        expect(response.status).to.equal(200)
        const body = response.body
        const data = response.body.data
        const items = response.body.data.items

        expect(body.statusCode).to.equal(200)
        expect(data._id).to.equal(cartId)
        expect(items).to.have.length(2)

        const pointsArray = []

        for (let i = 0; i < items.length; i++) {
          console.log('Item: ' + items[i].sku)
          if (items[i].sku === sku_redemption_2) {
            expect(items[i].sku, `SKU should be ${sku_redemption_2}`).to.equal(
              sku_redemption_2
            )
            expect(items[i].qty, 'QTY Produk should be 1').to.equal(1)

            const ubdDetails_length = items[i].ubdDetail.length
            expect(
              items[i].ubdDetail,
              `UBD Detail for ${sku_redemption_2} should be 1`
            ).to.have.length(1)
            for (let j = 0; j < ubdDetails_length; j++) {
              expect(items[i].ubdDetail[j].ubd).to.equal(null)
              expect(items[i].ubdDetail[j].total).to.equal(1)
            }
          } else {
            expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
              sku_redemption_1
            )
            expect(items[i].qty, 'QTY Produk should be 1').to.equal(1)
            expect(
              items[i].ubdDetail,
              `UBD Detail for ${sku_redemption_1} should be 1`
            ).to.have.length(1)
          }

          const pts_redemption = items[i].product.redemption_catalog.point
          const items_qty = items[i].qty
          const calculate_subtotal_pts = pts_redemption * items_qty
          console.log('Calculate Subtotal: ' + calculate_subtotal_pts)
          pointsArray.push(parseInt(calculate_subtotal_pts, 10)) // Convert to integer
        }

        const calculate_pts = pointsArray.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        )
        console.log('calculate_pts: ' + calculate_pts)
        expect(
          data.total_redemption_point,
          `Total Redemption Catalog should be ${calculate_pts}`
        ).to.equal(calculate_pts)
      })
      .then((response) => {
        const data = response.body.data
        Cypress.env('TOTAL_REDEMPTION', data.total_redemption_point)
        cy.log('Total redemption di cart:', data.total_redemption_point)
      })
  })
})

describe('Staff checkout Redemption Order', function () {
  it('Checkout Redemption order', () => {
    const cartId = Cypress.env('CART_ID')
    const total_redemption_cart = Cypress.env('TOTAL_REDEMPTION')

    cy.api({
      method: 'POST',
      url: URL_REDEMPTION_ORDER,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        cart: cartId,
        orderBy: nik_employee,
        notes: ''
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items
      const customer = response.body.data.customer
      const employee = response.body.data.orderBy
      const point = response.body.data.point

      expect(body.statusCode, 'Status Code should be 201').to.equal(201)
      expect(data.cartId).to.equal(cartId)
      expect(data.orderStatus, 'Order status should be PAID').to.equal('PAID')
      expect(customer.firstName).to.equal(Cypress.env('FIRST_NAME'))
      expect(customer.lastName).to.equal(Cypress.env('LAST_NAME'))
      expect(customer.cardNumber).to.equal(card_number)
      expect(employee.nik).to.equal(nik_employee)
      expect(employee.storeCode).to.equal(store_code)
      expect(data.type, 'Order type should be Order Redemption').to.equal(
        'OrderRedemption'
      )
      expect(data.isScanner).to.equal(true)
      expect(items, 'Items length should be 2').to.have.length(2)

      const pointsArray = []

      for (let i = 0; i < items.length; i++) {
        console.log('Item: ' + items[i].sku)
        if (items[i].sku === sku_redemption_1) {
          expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
            sku_redemption_1
          )
          expect(items[i].qty, 'QTY Produk should be 1').to.equal(1)
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 1`
          ).to.have.length(1)
          const ubdDetails_length = items[i].ubdDetail.length
          for (let j = 0; j < ubdDetails_length; j++) {
            const ubdTest = new Date(ubd_redemption_1)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1

            const ubdResponse = new Date(items[i].ubdDetail[j].ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1

            if (
              yearExpiredResponse === yearExpiredTest &&
              monthExpiredResponse === monthExpiredTest
            ) {
              expect(
                items[i].ubdDetail[j].total,
                `Total product ${sku_redemption_1} with UBD ${ubd_redemption_1} should be 1`
              ).to.equal(1)
            }
          }
        } else {
          expect(items[i].sku, `SKU should be ${sku_redemption_2}`).to.equal(
            sku_redemption_2
          )
          expect(items[i].qty, 'QTY Produk should be 1').to.equal(1)
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_2} should be 1`
          ).to.have.length(1)
          const ubdDetails_length = items[i].ubdDetail.length
          for (let j = 0; j < ubdDetails_length; j++) {
            expect(
              items[i].ubdDetail[j].total,
              `Total product ${sku_redemption_2} with UBD ${ubd_redemption_2} should be 1`
            ).to.equal(1)
          }
        }

        const pts_redemption = items[i].redemption_point
        const items_qty = items[i].qty
        const calculate_subtotal_pts = pts_redemption * items_qty
        console.log('Calculate Subtotal: ' + calculate_subtotal_pts)
        expect(
          items[i].subtotal_redemption_point,
          `Subtotal product ${items[i].sku} should be ${calculate_subtotal_pts}`
        ).to.equal(calculate_subtotal_pts)
        pointsArray.push(parseInt(calculate_subtotal_pts, 10)) // Convert to integer
      }

      const calculate_pts = pointsArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      )
      console.log('calculate_pts: ' + calculate_pts)
      expect(
        calculate_pts,
        `Calculate point should be ${total_redemption_cart} the same as in cart`
      ).to.equal(total_redemption_cart)
      expect(
        data.point.redeem,
        `Total Redemption in order should be ${calculate_pts}`
      ).to.equal(calculate_pts)
    })
  })

  //check user point after transaction
  it('Check user point after redemption', () => {
    const url =
      URL_USER + '/employee/detail-member/point' + `?cardNumber=${card_number}`
    const pts_awal = Cypress.env('CURRENT_POINT')
    const redeem_pts_cart = Cypress.env('TOTAL_REDEMPTION')
    const pts_akhir = pts_awal - redeem_pts_cart

    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      const data = response.body.data
      expect(response.status, 'Response code should be 201').to.equal(201)
      expect(
        data.currentPoint,
        `User point should be ${pts_akhir} after transaction`
      ).to.equal(pts_akhir)
    })
  })

  //stock summary
  it(`Get product stock from Stock Summary ${sku_redemption_1} after redemption`, () => {
    const ubd = '2024-10-01'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter =
      url +
      `?sku=${sku_redemption_1}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
    const stock_qty_summary_awal = Cypress.env('stock_summary_qty_112620556')
    const qty_summary_calculate = stock_qty_summary_awal - qty_sku_redemption_1

    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data
      const docs = response.body.data.docs[0]
      expect(response.status, 'Status code should be 200').to.equal(200)
      expect(docs.sku, `SKU should be ${sku_redemption_1}`).to.equal(
        sku_redemption_1
      )
      // expect(docs.ubd, `UBD should be ${ubd_redemption_1}`).to.equal(
      //   ubd_redemption_1
      // )
      expect(docs.storeCode, `Store code should be ${store_code}`).to.equal(
        store_code
      )

      expect(data.totalDocs).to.equal(1)
      expect(
        docs.qty,
        `Qty summary SKU ${sku_redemption_1} should be ${qty_summary_calculate}`
      ).to.equal(qty_summary_calculate)
      //dapetin qty di cart dikurangin sama summary
    })
  })

  it(`Get product stock from Stock Summary ${sku_redemption_2} after redemption`, () => {
    const ubd = 'null'
    const url = URL_PRODUCT + '/admin/stock-summary'
    const urlFilter =
      url +
      `?sku=${sku_redemption_2}&page=1&limit=100&ubd=${ubd}&storeCode=${store_code}`
    const stock_qty_summary_awal = Cypress.env('stock_summary_qty_112780045')
    const qty_summary_calculate = stock_qty_summary_awal - qty_sku_redemption_2

    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data
      const docs = response.body.data.docs[0]
      expect(response.status, 'Status code should be 200').to.equal(200)
      expect(docs.sku, `SKU should be ${sku_redemption_2}`).to.equal(
        sku_redemption_2
      )
      // expect(docs.ubd, `UBD should be ${ubd_redemption_2}`).to.equal(
      //   ubd_redemption_2
      // )
      expect(docs.storeCode, `Store code should be ${store_code}`).to.equal(
        store_code
      )

      expect(data.totalDocs).to.equal(1)
      expect(
        docs.qty,
        `Qty summary SKU ${sku_redemption_2} should be ${qty_summary_calculate}`
      ).to.equal(qty_summary_calculate)
      //dapetin qty di cart dikurangin sama summary
    })
  })

  //stock movement
  it(`Get product stock from Stock Movement ${sku_redemption_1} after redemption`, () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter =
      url +
      `?sku=${sku_redemption_1}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_redemption_1}&from=${store_code}`
    //const sku_redemption_1_data = Cypress.env("sku_redemption_1_DATA")
    //const qty_sku_redemption_1 = sku_redemption_1_data.qty
    const qty_movement_awal = Cypress.env('stock_movement_sku_1')
    const qty_movement_calculate = qty_movement_awal - qty_sku_redemption_1

    cy.log(qty_sku_redemption_1)
    cy.log(qty_movement_awal)
    cy.log(qty_movement_calculate)

    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const docs = response.body.data.docs[0]

      expect(response.status, 'Status code should be 200').to.equal(200)
      expect(docs.sku, `SKU should be ${sku_redemption_1}`).to.equal(
        sku_redemption_1
      )
      // expect(docs.ubd, `UBD should be ${ubd_redemption_1}`).to.equal(
      //   ubd_redemption_1
      // )
      expect(docs.from, `From should be ${store_code}`).to.equal(store_code)
      expect(docs.to, `To should be ${card_number}`).to.equal(card_number)
      expect(docs.event, 'Event should be redemption').to.equal('redemption')

      expect(
        docs.qty,
        `Qty in movement should be ${qty_sku_redemption_1}`
      ).to.equal(qty_sku_redemption_1)
      expect(
        docs.totalStock,
        `Total Stock should be ${qty_movement_calculate}`
      ).to.equal(qty_movement_calculate)
      //qty di cart redemption
      //ambil total stock ambil stock awal
    })
  })

  it(`Get product stock from Stock Movement ${sku_redemption_2} after redemption`, () => {
    const url = URL_PRODUCT + '/admin/stock-movement'
    const urlFilter =
      url +
      `?sku=${sku_redemption_2}&page=1&limit=10&sort=${sort_desc}&ubd=${ubd_redemption_2}&from=${store_code}`
    const qty_movement_awal = Cypress.env('stock_movement_sku_2')
    const qty_movement_calculate = qty_movement_awal - qty_sku_redemption_2

    cy.log(qty_sku_redemption_2)
    cy.log(qty_movement_awal)
    cy.log(qty_movement_calculate)

    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const docs = response.body.data.docs[0]

      expect(response.status, 'Status code should be 200').to.equal(200)
      expect(docs.sku, `SKU should be ${sku_redemption_2}`).to.equal(
        sku_redemption_2
      )
      // expect(docs.ubd, `UBD should be ${ubd_redemption_2}`).to.equal(
      //   ubd_redemption_2
      // )
      expect(docs.from, `From should be ${store_code}`).to.equal(store_code)
      expect(docs.to, `To should be ${card_number}`).to.equal(card_number)
      expect(docs.event, 'Event should be redemption').to.equal('redemption')

      expect(
        docs.qty,
        `Qty in movement should be ${qty_sku_redemption_2}`
      ).to.equal(qty_sku_redemption_2)
      expect(
        docs.totalStock,
        `Total Stock should be ${qty_movement_calculate}`
      ).to.equal(qty_movement_calculate)
      //qty di cart redemption
      //ambil total stock ambil stock awal
    })
  })
})
