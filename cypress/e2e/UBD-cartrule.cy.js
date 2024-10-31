const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('Check cart rule', function () {
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

  it('Check cart rule', () => {
    const promo_id = '671a123857e46bf7dbea5de8'
    const url = URL_PRODUCT + `/cart-rule/get/${promo_id}`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        expect(response.status).to.equal(200)
      })
      .then((response) => {
        const data = response.body.data
        Cypress.env('CARTRULE_DATA', data)
        cy.log(Cypress.env('CARTRULE_DATA').terms)
      })
  })
})

describe('Staff add product to cart customer', function () {
  it('Successfully login', () => {
    const url = URL_USER + '/employee/login'
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: Cypress.env('NIK_BXC'),
        storeCode: Cypress.env('STORE_CODE_BXC'),
        pin: Cypress.env('PIN_BXC')
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
          expect(response.status).to.equal(201)
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
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
    } else {
      cy.log('shift sedang berjalan')
    }
  })

  it('Should able to create cart', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        isGuest: false,
        firstName: Cypress.env('FIRST_NAME'),
        lastName: Cypress.env('LAST_NAME'),
        cardNumber: Cypress.env('CARD_NUMBER'),
        nik: '',
        FamilyNumber: '',
        isFamily: false,
        customerGroup: 'STARTER',
        image:
          'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg',
        isScanner: true,
        isLapsed: false,
        isReactivated: false,
        isIcarusAppUser: false,
        autoEnroll: false,
        autoEnrollFrom: ''
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.data).to.haveOwnProperty('_id')
      expect(response.body.data.customer).to.haveOwnProperty('_id')
      const cartId = response.body.data._id
      Cypress.env('cartId', cartId)
      const customerId = response.body.data.customer._id
      Cypress.env('customerId', customerId)
    })
  })

  it('Should able to add product to cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const sku = '101031176'
    // const name = product.name
    const price = 579000
    const qty = 1
    const ubd = '2025-05'

    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: ubd
      }
    })
      .should((response) => {
        expect(response.status).to.equal(201)
        const data = response.body.data
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
        expect(data).to.haveOwnProperty('store_dispatcher')
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
        expect(data).to.haveOwnProperty('createdAt')
        expect(data).to.haveOwnProperty('updatedAt')
        expect(data).to.haveOwnProperty('__v')
        expect(data).to.haveOwnProperty('productCategoriesInternal')
        expect(data).to.haveOwnProperty('cashVoucher')
        data.items.forEach(function (item) {
          expect(item).to.haveOwnProperty('product')
          expect(item).to.haveOwnProperty('qty')
          expect(item).to.haveOwnProperty('sub_total')
          expect(item).to.haveOwnProperty('sku')
          expect(item).to.haveOwnProperty('grandTotal')
          expect(item).to.haveOwnProperty('ubdDetail')
        })
      })
      .should((response) => {
        const item = response.body.data.items
        const ubdTest = new Date(ubd)
        const yearExpiredTest = ubdTest.getFullYear()
        const monthExpiredTest = ubdTest.getMonth() + 1
        // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
        const responseUbd = item[0].ubdDetail[0].ubd
        const responseUbdDate = new Date(responseUbd)
        const yearExpiredResponse = responseUbdDate.getFullYear()
        const monthExpiredResponse = responseUbdDate.getMonth() + 1
        expect(item[0].sku, `First item sku should be ${sku}`).to.equal(sku)
        // expect(item[0].product.name, `Product name should be ${name}`).to.equal(
        //   name
        // )
        expect(item[0].qty, `First item qty should be ${qty}`).to.equal(qty)
        expect(
          item[0].ubdDetail[0].total,
          `First ubd detail total should be ${qty}`
        ).to.equal(qty)
        expect(yearExpiredResponse).to.equal(yearExpiredTest)
        expect(monthExpiredResponse).to.equal(monthExpiredTest)
        // const productPrice = item[0].product.price
        // expect(productPrice, `Product price should be ${price}`).to.equal(price)
        // Cypress.env(`price_${sku}`, price)
        // //sub_total
        // expect(item[0].sub_total).to.equal(price)
        // expect(response.body.data.totalAmount).to.equal(price)
        // expect(response.body.data.paymentAmount).to.equal(price)
        //CART RULE CHECK
        const cartrule_data = Cypress.env('CARTRULE_DATA')
        let term_data = cartrule_data.term

        //const temp = term_data.match(/\d+/g)
        const temp = term_data.split('&&')

        // const totalValue_term = parseInt(temp[0], 10)
        // const storeCode_term = parseInt(temp[1], 10)

        const totalValue_term = parts[0].split(',') // ['total_value', '>=', '500000']
        const storeCode_term = parts[1].split(',') // ['store_code', '==', '14160']

        const storeCode_response = items.product.storeCode

        expect(storeCode_response).to.equal(storeCode_term)
      })
    //   .then((response) => {
    //     const promo = response.body.data.items[0].promoBreakdown[0]
    //     Cypress.env('PROMO_ID', promo.id)
    //     cy.log('Promo ID: ', promo.id)
    //   })
  })
})
