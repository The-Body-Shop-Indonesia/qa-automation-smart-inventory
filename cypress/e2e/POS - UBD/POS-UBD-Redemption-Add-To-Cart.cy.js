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

const sku_redemption_3 = '126510082'

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
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        isGuest: false,
        firstName: first_name,
        lastName: last_name,
        cardNumber: card_number,
        nik: '',
        familyNumber: '',
        isFamily: false,
        customerGroup: 'STARTER',
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
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(201)
        const body = response.body
        const data = response.body.data
        expect(body.statusCode, 'Status code should be 200').to.equal(201)
        expect(
          data.customer.firstName,
          'First name should be ' + `${first_name}`
        ).to.equal(first_name)
        expect(
          data.customer.lastName,
          'Last name should be ' + `${last_name}`
        ).to.equal(last_name)
        expect(data.customer.isGuest, 'isGuest should be false').to.equal(false)
        expect(
          data.customer.cardNumber,
          'Card number should be ' + `${card_number}`
        ).to.equal(card_number)
        expect(data.customer.customerGroup).to.equal('STARTER')
      })
      .then((response) => {
        Cypress.env('CART_ID', response.body.data._id)
        //cy.log(Cypress.env("CART_ID"))
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

  it(`Add product quantity with the same SKU ${sku_redemption_1} and UBD ${ubd_redemption_1} `, () => {
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

      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)

      expect(items).to.have.length(1)
      const pointsArray = []

      for (let i = 0; i < items.length; i++) {
        console.log('Item: ' + items[i].sku)
        if (items[i].sku === sku_redemption_1) {
          expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
            sku_redemption_1
          )
          expect(items[i].qty, 'QTY Produk should be 2').to.equal(2)

          const ubdDetails_length = items[i].ubdDetail.length
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 1`
          ).to.have.length(1)
          for (let j = 0; j < ubdDetails_length; j++) {
            expect(items[i].ubdDetail[j].total).to.equal(2)
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

  it(`Add same product with different UBD ${different_UBD} for SKU ${sku_redemption_1}`, () => {
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
        ubd: different_UBD
      }
    }).should((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data
      const items = response.body.data.items

      expect(body.statusCode).to.equal(200)
      expect(data._id).to.equal(cartId)

      expect(items).to.have.length(1)
      const pointsArray = []

      for (let i = 0; i < items.length; i++) {
        console.log('Item: ' + items[i].sku)
        if (items[i].sku === sku_redemption_1) {
          expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
            sku_redemption_1
          )
          expect(items[i].qty, 'QTY Produk should be 3').to.equal(3)

          const ubdDetails_length = items[i].ubdDetail.length
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 2`
          ).to.have.length(2)
          for (let j = 0; j < ubdDetails_length; j++) {
            const ubdTest = new Date(different_UBD)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1

            const ubdResponse = new Date(items[i].ubdDetail[j].ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1

            if (
              yearExpiredResponse === yearExpiredTest &&
              monthExpiredResponse === monthExpiredTest
            ) {
              expect(yearExpiredResponse).to.equal(yearExpiredTest)
              expect(monthExpiredResponse).to.equal(monthExpiredTest)

              expect(items[i].ubdDetail[j].total).to.equal(1)
            } else {
              expect(items[i].ubdDetail[j].total).to.equal(2)
            }
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

  it(`Add product redemption UBD null SKU ${sku_redemption_2}`, () => {
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
    }).should((response) => {
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
          expect(items[i].qty, 'QTY Produk should be 3').to.equal(3)
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 2`
          ).to.have.length(2)
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

  it(`Should return error message if add normal product SKU ${sku_redemption_3}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = 1

    cy.api({
      method: 'PATCH',
      url: URL_PRODUCT_REDEMPTION,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        cart_id: cartId,
        sku: sku_redemption_3,
        qty: qtyProduct,
        notes: '',
        requiredUbd: false,
        ubd: ''
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body.statusCode).to.equal(400)
      expect(body.message).to.equal('Product is not in redemption catalog')
    })
  })
})

describe('Reduce qty and remove product Redemption test group', function () {
  it(`Reduce product quantity SKU ${sku_redemption_1} UBD ${ubd_redemption_1}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = -1

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
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_2} should be 1`
          ).to.have.length(1)
        } else {
          expect(items[i].sku, `SKU should be ${sku_redemption_1}`).to.equal(
            sku_redemption_1
          )
          expect(items[i].qty, 'QTY Produk should be 2').to.equal(2)
          expect(
            items[i].ubdDetail,
            `UBD Detail for ${sku_redemption_1} should be 2`
          ).to.have.length(2)
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
            } else {
              expect(
                items[i].ubdDetail[j].total,
                `Total product ${sku_redemption_1} with UBD ${different_UBD} should be 1`
              ).to.equal(1)
            }
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

  it(`Remove product from cart SKU ${sku_redemption_1} with different UBD ${different_UBD}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = -1

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
        ubd: different_UBD
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
            expect(
              items[i].ubdDetail,
              `UBD Detail for ${sku_redemption_2} should be 1`
            ).to.have.length(1)
          } else {
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

  // //kena error 400 "sku 112780045 with Invalid Date ubd is not in cart"
  it(`Delete product UBD null SKU ${sku_redemption_1}`, () => {
    const cartId = Cypress.env('CART_ID')
    const qtyProduct = -1

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
        expect(items, 'Items length should be 1').to.have.length(1)

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

describe('Delete cart redemp', function () {
  it('Delete cart redemption', () => {
    const cartId = Cypress.env('CART_ID')
    const url = URL_PRODUCT + `/employee/cart-redemption/${cartId}`
    const qtyProduct = -1

    cy.api({
      method: 'DELETE',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
    })
  })
})
