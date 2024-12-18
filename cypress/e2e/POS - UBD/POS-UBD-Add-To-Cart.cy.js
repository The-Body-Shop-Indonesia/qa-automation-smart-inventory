const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

// describe('Set product to use', function() {
//     it('Successfully login employee', () => {
//         const url = URL_USER + "/employee/login"
//         cy.api({
//             method: "POST",
//             url,
//             body: {
//                 nik: Cypress.env("EMP_NIK"),
//                 storeCode: Cypress.env("EMP_STORECODE"),
//                 pin: Cypress.env("EMP_PIN")
//             }
//         })
//         .should(response => {
//             expect(response.status).to.equal(201)
//             const body = response.body
//             expect(body).to.haveOwnProperty("statusCode")
//             expect(body).to.haveOwnProperty("message")
//             expect(body).to.haveOwnProperty("data")
//             expect(body.statusCode).to.equal(201)
//             expect(body.message).to.equal("Success")
//             const data = body.data
//             expect(data).to.haveOwnProperty("accessToken")
//         })
//         .then(response => {
//             const employeeToken = response.body.data.accessToken
//             Cypress.env("REQUEST_HEADERS", {
//                 Authorization: "Bearer " + employeeToken,
//                 channel: "pos"
//             })
//             Cypress.env("emp_nik", response.body.data.user.nik)
//             Cypress.env("storeCode", response.body.data.user.storeCode)
//         })
//     })

//     it('Should get product list', () => {
//         const url = URL_PRODUCT + "/employee/product?page=1&size=10&sort=name_asc&keyword=shampoo&is_virtual_bundling=false"
//         cy.api({
//             method: "GET",
//             url,
//             headers: Cypress.env("REQUEST_HEADERS")
//         })
//         .should(response => {
//             expect(response.body.data.docs.length).to.be.greaterThan(0)
//             Cypress.env("Product_A", response.body.data.docs[0])
//             Cypress.env("Product_B", response.body.data.docs[1])
//             Cypress.env("Product_C", response.body.data.docs[2])
//             Cypress.env("Product_D", response.body.data.docs[3])
//         })
//     })
// })

describe('Set sku product to use', function () {
  before('Set sku product', () => {
    // Mengambil data dari fixture
    cy.fixture('skus').then((data) => {
      const skus = data.skuProducts
      const selectedSkus = new Set() // Set untuk memastikan SKU unik

      while (selectedSkus.size < 4) {
        const randomIndex = Math.floor(Math.random() * skus.length)
        selectedSkus.add(skus[randomIndex])
      }

      // Mengubah Set ke array
      const [sku1, sku2, sku3, sku4] = Array.from(selectedSkus)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku1}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_A', data)
      })
      //   Cypress.env('Product_A', sku1)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku2}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_B', data)
      })
      //   Cypress.env('Product_B', sku2)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku3}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_C', data)
      })
      //   Cypress.env('Product_C', sku3)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku4}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_D', data)
      })
      //   Cypress.env('Product_D', sku4)
      //   cy.log(
      //     `Used sku product: ${Cypress.env('Product_A')}, ${Cypress.env('Product_B')}, ${Cypress.env('Product_C')}, ${Cypress.env('Product_D')}`
      //   )
    })
  })
  it('Used sku', () => {
    const itemA = Cypress.env('Product_A')
    const itemB = Cypress.env('Product_B')
    const itemC = Cypress.env('Product_C')
    const itemD = Cypress.env('Product_D')
    cy.log(`Item A: ${itemA.sku}, price: ${itemA.price}`)
    cy.log(`Item B: ${itemB.sku}, price: ${itemB.price}`)
    cy.log(`Item C: ${itemC.sku}, price: ${itemC.price}`)
    cy.log(`Item D: ${itemD.sku}, price: ${itemD.price}`)
  })
})

describe('Staff add product to cart customer', function () {
  it('Successfully login', () => {
    const url = URL_USER + '/employee/login'
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: Cypress.env('EMP_NIK'),
        storeCode: Cypress.env('EMP_STORECODE'),
        pin: Cypress.env('EMP_PIN')
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

  // it('Check shift', () => {
  //     //close shift
  //     cy.api({
  //         method: "POST",
  //         url: URL_USER + "/employee/shift/close",
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false
  //     })
  //     //cek shift
  //     const url = URL_USER + "/employee/shift"
  //     cy.api({
  //         method: "GET",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false
  //     })
  //     .then(response => {
  //         const status = response.body.statusCode
  //         expect(status).to.equal(400)
  //         if (status === 400) {
  //             //open shift
  //             cy.api({
  //                 method: "POST",
  //                 url: URL_USER + "/employee/shift/open",
  //                 headers: Cypress.env("REQUEST_HEADERS")
  //             })
  //             .should(response => {
  //                 expect(response.status).to.equal(201)
  //                 expect(response.body.data.status).to.equal("open")
  //             })
  //         } else {

  //         }
  //     })
  // })

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
        firstName: Cypress.env('FIRSTNAME'),
        lastName: Cypress.env('LASTNAME'),
        cardNumber: Cypress.env('CARDNUMBER'),
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
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const name = product.name
    const price = product.price
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
        expect(item[0].product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(item[0].qty, `First item qty should be ${qty}`).to.equal(qty)
        expect(
          item[0].ubdDetail[0].total,
          `First ubd detail total should be ${qty}`
        ).to.equal(qty)
        expect(yearExpiredResponse).to.equal(yearExpiredTest)
        expect(monthExpiredResponse).to.equal(monthExpiredTest)
        const productPrice = item[0].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        Cypress.env(`price_${sku}`, price)
        //sub_total
        expect(item[0].sub_total).to.equal(price)
        expect(response.body.data.totalAmount).to.equal(price)
        expect(response.body.data.paymentAmount).to.equal(price)
      })
  })

  it('Should able to add product quantity to cart', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const name = product.name
    const price = product.price
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
    }).should((response) => {
      const item = response.body.data.items
      const price = Cypress.env(`price_${sku}`) * 2
      Cypress.env('total_price', price)
      item.forEach((it) => {
        if (it.sku === sku) {
          expect(
            it.qty,
            `Product sku ${sku} quantity should be ${qty + 1}`
          ).to.equal(qty + 1)
          expect(
            it.ubdDetail[0].total,
            `First ubd detail total of sku ${sku} should be ${qty + 1}`
          ).to.equal(qty + 1)
          //sub_total
          expect(
            it.sub_total,
            `Subtotal of sku ${sku} should be ${price}`
          ).to.equal(price)
        }
      })
      expect(response.body.data.totalAmount).to.equal(price)
      expect(response.body.data.paymentAmount).to.equal(price)
    })
  })

  it('Should able to add same product with different UBD to cart', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-07'
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
    }).should((response) => {
      const price = Cypress.env(`price_${sku}`) * 3
      Cypress.env('total_price', price)
      const item = response.body.data.items
      item.forEach((it) => {
        if (it.sku === sku) {
          const ubdTest = new Date(ubd)
          const yearExpiredTest = ubdTest.getFullYear()
          const monthExpiredTest = ubdTest.getMonth() + 1
          const responseUbd = it.ubdDetail[1].ubd
          const responseUbdDate = new Date(responseUbd)
          const yearExpiredResponse = responseUbdDate.getFullYear()
          const monthExpiredResponse = responseUbdDate.getMonth() + 1
          //ubd 1
          expect(
            it.qty,
            `Product sku ${sku} quantity should be ${qty + 1 + 1}`
          ).to.equal(qty + 1 + 1)
          expect(
            it.ubdDetail[0].total,
            `First ubd detail total of sku ${sku} should be ${qty + 1}`
          ).to.equal(qty + 1)
          //ubd 2
          expect(yearExpiredResponse).to.equal(yearExpiredTest)
          expect(monthExpiredResponse).to.equal(monthExpiredTest)
          expect(
            it.ubdDetail[1].total,
            `Second ubd detail total of sku ${sku} should be ${qty}`
          ).to.equal(qty)
          //sub_total
          expect(
            it.sub_total,
            `Subtotal of sku ${sku} should be ${price}`
          ).to.equal(price)
        }
      })
      expect(response.body.data.totalAmount).to.equal(price)
      expect(response.body.data.paymentAmount).to.equal(price)
    })
  })

  it('Verify if add product without UBD', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const qty = 1
    const ubd = ''
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: false,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length, `Item ${sku} should be exist`).to.equal(1)
      item.forEach((it) => {
        if (it.sku === sku) {
          expect(it.product.name, `Product name should be ${name}`).to.equal(
            name
          )
          expect(it.qty, `Item ${sku} quantity should be ${qty}`).to.equal(qty)
          expect(
            it.ubdDetail[0].ubd,
            `First ubd detail of item ${sku} should be null`
          ).to.equal(null)
          expect(it.ubdDetail[0].total).to.equal(qty)
          const productPrice = it.product.price
          expect(productPrice, `Product price should be ${price}`).to.equal(
            price
          )
          Cypress.env(`price_${sku}`, price)
          //sub_total
          expect(it.sub_total).to.equal(price)
        }
      })
      const total_price =
        Cypress.env('total_price') + Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })
  })

  it('Check validation if add product without UBD', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const qty = 1
    const ubd = ''
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false,
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status, `Response status should be 400`).to.equal(400)
      expect(response.body.statusCode).to.equal(400)
    })
  })

  it('Should return error 400 if add same product with quantity more than 10', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_C')
    const sku = product.sku
    const qty = 1
    const quantity = 0
    const ubd = '2025-07'
    for (let index = 0; index < 5; index++) {
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
      }).should((response) => {
        const item = response.body.data.items
        item.forEach((it) => {
          if (it.sku === sku) {
            const price = it.product.price
            Cypress.env(`price_${sku}`, price)
            const total_price = Cypress.env('total_price') + price
            Cypress.env('total_price', total_price)
          }
        })
      })
    }
    const ubd2 = '2025-08'
    for (let index = 0; index < 5; index++) {
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
          ubd: ubd2
        }
      }).should((response) => {
        const item = response.body.data.items
        item.forEach((it) => {
          if (it.sku === sku) {
            const price = it.product.price
            Cypress.env(`price_${sku}`, price)
            const total_price = Cypress.env('total_price') + price
            Cypress.env('total_price', total_price)
          }
        })
        expect(response.body.data.totalAmount).to.equal(
          Cypress.env('total_price')
        )
        expect(response.body.data.paymentAmount).to.equal(
          Cypress.env('total_price')
        )
      })
    }
    //input ke 11
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false,
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status, `Response status should 400`).to.equal(400)
      expect(response.body.statusCode).to.equal(400)
    })
  })

  it('Add product by scan barcode', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const product = Cypress.env('Product_D')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const qty = 1
    const ubd = '2026-01'
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
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length, `Item ${sku} should be exist`).to.equal(1)
      item.forEach((it) => {
        if (it.sku === sku) {
          expect(it.product.name, `Product name should be ${name}`).to.equal(
            name
          )
          expect(it.qty, `Item ${sku} quantity should be ${qty}`).to.equal(qty)
          // expect(it.ubdDetail[0].ubd).to.equal(null)
          expect(it.ubdDetail[0].total).to.equal(qty)
          const ubdTest = new Date(ubd)
          const yearExpiredTest = ubdTest.getFullYear()
          const monthExpiredTest = ubdTest.getMonth() + 1
          const responseUbd = it.ubdDetail[0].ubd
          const responseUbdDate = new Date(responseUbd)
          const yearExpiredResponse = responseUbdDate.getFullYear()
          const monthExpiredResponse = responseUbdDate.getMonth() + 1
          expect(yearExpiredResponse).to.equal(yearExpiredTest)
          expect(monthExpiredResponse).to.equal(monthExpiredTest)
          const productPrice = it.product.price
          expect(productPrice, `Product price should be ${price}`).to.equal(
            price
          )
          Cypress.env(`price_${sku}`, price)
          //sub_total
          expect(
            it.sub_total,
            `Subtotal of sku ${sku} should be ${price}`
          ).to.equal(price)
        }
      })
      const total_price =
        Cypress.env('total_price') + Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })
  })

  // it('Verify if add product with invalid UBD format', () => {
  //     // year only
  //     const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
  //     const sku = "101050283"
  //     const qty = 1
  //     const ubd = "2025"
  //     cy.api({
  //         method: "POST",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false,
  //         body: {
  //             sku: sku,
  //             qty: qty,
  //             customPrice: 0,
  //             notes: "",
  //             requiredUbd: true,
  //             ubd: ubd
  //         }
  //     })
  //     .should(response => {
  //         expect(response.status).to.equal(400)
  //         expect(response.body.statusCode).to.equal(400)
  //     })

  //     // year-month-day
  //     const ubd2 = "2025-10-10"
  //     cy.api({
  //         method: "POST",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false,
  //         body: {
  //             sku: sku,
  //             qty: qty,
  //             customPrice: 0,
  //             notes: "",
  //             requiredUbd: true,
  //             ubd: ubd2
  //         }
  //     })
  //     .should(response => {
  //         expect(response.status).to.equal(400)
  //         expect(response.body.statusCode).to.equal(400)
  //     })
  // })
})

describe('Staff update product in cart customer', function () {
  it('Should able to edit note in product ', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/edit'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-05'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: `Menambahkan note di produk ${sku} ubd 2025-05`,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      item.forEach((it) => {
        if (it.sku === sku) {
          // const ubdTest = new Date(ubd)
          // const yearExpiredTest = ubdTest.getFullYear()
          // const monthExpiredTest = ubdTest.getMonth() + 1
          // const responseUbd = it.ubdDetail[0].ubd
          // const responseUbdDate = new Date(responseUbd)
          // const yearExpiredResponse = responseUbdDate.getFullYear()
          // const monthExpiredResponse = responseUbdDate.getMonth() + 1
          //ubd 1
          // expect(it.qty).to.equal(qty+1+1)
          // expect(it.ubdDetail[0].total).to.equal(qty+1)
          //ubd 2
          // expect(yearExpiredResponse).to.equal(yearExpiredTest)
          // expect(monthExpiredResponse).to.equal(monthExpiredTest)
          // expect(it.ubdDetail[1].total).to.equal(qty)
          //notes
          expect(
            it.notes,
            `Notes in sku ${sku} should be Menambahkan note di produk ${sku} ubd 2025-05`
          ).to.equal(`Menambahkan note di produk ${sku} ubd 2025-05`)
        }
      })
      expect(response.body.data.totalAmount).to.equal(
        Cypress.env('total_price')
      )
      expect(response.body.data.paymentAmount).to.equal(
        Cypress.env('total_price')
      )
    })
  })

  it('Edit note should not add quantity in product ', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/edit'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-05'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: 5,
        customPrice: 0,
        notes: `Menambahkan note di produk ${sku} ubd 2025-05, pastikan qty tidak bertambah`,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      item.forEach((it) => {
        if (it.sku === sku) {
          const ubdTest = new Date(ubd)
          const yearExpiredTest = ubdTest.getFullYear()
          const monthExpiredTest = ubdTest.getMonth() + 1
          const responseUbd = it.ubdDetail[0].ubd
          const responseUbdDate = new Date(responseUbd)
          const yearExpiredResponse = responseUbdDate.getFullYear()
          const monthExpiredResponse = responseUbdDate.getMonth() + 1
          //ubd 1
          expect(it.qty).to.equal(qty + 1 + 1)
          expect(it.ubdDetail[0].total).to.equal(qty + 1)
          //ubd 2
          expect(yearExpiredResponse).to.equal(yearExpiredTest)
          expect(monthExpiredResponse).to.equal(monthExpiredTest)
          expect(it.ubdDetail[1].total).to.equal(qty)
          //notes
          expect(it.notes).to.equal(
            `Menambahkan note di produk ${sku} ubd 2025-05, pastikan qty tidak bertambah`
          )
        }
      })
      expect(response.body.data.totalAmount).to.equal(
        Cypress.env('total_price')
      )
      expect(response.body.data.paymentAmount).to.equal(
        Cypress.env('total_price')
      )
    })
  })

  it('Verify if edit custom price product that has not config is_customPrice=true in cart', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/edit'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-05'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: 5,
        customPrice: 10000,
        notes: 'Pastikan customPrice tetap 0',
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      item.forEach((it) => {
        if (it.sku === sku) {
          //notes
          expect(it.notes).to.equal('Pastikan customPrice tetap 0')
          expect(it.customPrice).to.equal(0)
        }
      })
      expect(response.body.data.totalAmount).to.equal(
        Cypress.env('total_price')
      )
      expect(response.body.data.paymentAmount).to.equal(
        Cypress.env('total_price')
      )
    })
  })
})

describe('Staff remove product in cart customer', function () {
  it('Decrease quantity product', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/remove'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const ubd = '2025-05'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length).to.equal(1)
      item.forEach((it) => {
        if (it.sku === sku) {
          expect(it.qty).to.equal(2)
          expect(it.ubdDetail[0].total).to.equal(1)
          expect(it.sub_total).to.equal(Cypress.env(`price_${sku}`) * 2)
        }
      })
      const total_price =
        Cypress.env('total_price') - Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })

    const ubd2 = '2025-07'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd2
      }
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length).to.equal(1)
      item.forEach((it) => {
        if (it.sku === sku) {
          expect(it.qty).to.equal(1)
          const ubdTest = new Date(ubd2)
          const yearExpiredTest = ubdTest.getFullYear()
          const monthExpiredTest = ubdTest.getMonth() + 1
          const ubdData = []
          it.ubdDetail.forEach((dataUbd) => {
            const ubd3 = dataUbd.ubd
            const ubdRes = new Date(ubd3)
            const yearExpiredRes = ubdRes.getFullYear()
            const monthExpiredRes = ubdRes.getMonth() + 1
            if (
              yearExpiredTest === yearExpiredRes &&
              monthExpiredTest === monthExpiredRes
            ) {
              ubdData.push(ubd3)
            }
          })
          expect(ubdData.length).to.equal(0)
          expect(it.sub_total).to.equal(Cypress.env(`price_${sku}`))
        }
      })
      const total_price =
        Cypress.env('total_price') - Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })
  })

  it('Delete product from cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/remove'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const ubd = '2025-05'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length).to.equal(0)
      const total_price =
        Cypress.env('total_price') - Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })
  })

  it('Delete product by scan barcode', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/remove'
    const product = Cypress.env('Product_D')
    const sku = product.sku
    const ubd = '2026-01'
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      const item = response.body.data.items
      const jmlItem = []
      item.forEach((it) => {
        if (it.sku === sku) {
          jmlItem.push(it.sku)
        }
      })
      expect(jmlItem.length, `Product ${sku} should not exist`).to.equal(0)
      const total_price =
        Cypress.env('total_price') - Cypress.env(`price_${sku}`)
      Cypress.env('total_price', total_price)
      expect(response.body.data.totalAmount).to.equal(total_price)
      expect(response.body.data.paymentAmount).to.equal(total_price)
    })
  })

  // it('Verify remove product if invalid ubd format', () => {
  //     // year
  //     const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/remove"
  //     const sku = "155060173"
  //     const ubd = "2025"
  //     cy.api({
  //         method: "PATCH",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false,
  //         body: {
  //             sku: sku,
  //             requiredUbd: true,
  //             ubd: ubd
  //         }
  //     })
  //     .should(response => {
  //         expect(response.status).to.equal(400)
  //         expect(response.body.statusCode).to.equal(400)
  //     })
  //     // year-month-day
  //     const ubd2 = "2025-07-01"
  //     cy.api({
  //         method: "PATCH",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false,
  //         body: {
  //             sku: sku,
  //             requiredUbd: true,
  //             ubd: ubd2
  //         }
  //     })
  //     .should(response => {
  //         expect(response.status).to.equal(400)
  //         expect(response.body.statusCode).to.equal(400)
  //     })
  // })

  it('Delete cart', () => {
    const url = URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId')
    cy.api({
      method: 'DELETE',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(response.body.data).to.equal('Cart deleted')
    })
  })
})
