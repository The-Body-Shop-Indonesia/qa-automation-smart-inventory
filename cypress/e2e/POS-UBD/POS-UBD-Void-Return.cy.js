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
      // Cypress.env("Product_A", sku1)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku2}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_B', data)
      })
      // Cypress.env("Product_B", sku2)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku3}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_C', data)
      })
      // Cypress.env("Product_C", sku3)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku4}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_D', data)
      })
      // Cypress.env("Product_D", sku4)
      // cy.log(`Used sku product: ${Cypress.env("Product_A")}, ${Cypress.env("Product_B")}, ${Cypress.env("Product_C")}, ${Cypress.env("Product_D")}`)
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

describe('Staff add void item to cart customer', function () {
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
  //         // expect(status).to.equal(200)
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
        const item = response.body.data.items
        const ubdTest = new Date(ubd)
        const yearExpiredTest = ubdTest.getFullYear()
        const monthExpiredTest = ubdTest.getMonth() + 1
        // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
        const responseUbd = item[0].ubdDetail[0].ubd
        const responseUbdDate = new Date(responseUbd)
        const yearExpiredResponse = responseUbdDate.getFullYear()
        const monthExpiredResponse = responseUbdDate.getMonth() + 1
        expect(item[0].sku).to.equal(sku)
        expect(item[0].product.name).to.equal(name)
        expect(item[0].qty).to.equal(qty)
        expect(item[0].ubdDetail[0].total).to.equal(qty)
        expect(yearExpiredResponse).to.equal(yearExpiredTest)
        expect(monthExpiredResponse).to.equal(monthExpiredTest)
        const productPrice = item[0].product.price
        expect(productPrice).to.equal(price)
        Cypress.env(`price_${sku}`, price)
        Cypress.env(`totalAmount`, price)
        //sub_total
        expect(item[0].sub_total).to.equal(price)
        expect(response.body.data.totalAmount).to.equal(price)
        expect(response.body.data.paymentAmount).to.equal(price)
      })
  })

  it('Should able to add void item to cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const qty = 1
    const ubd = '2025-02'
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
      expect(response.status).to.equal(201)
      const item = response.body.data.void_items
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1
      // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
      const responseUbd = item[0].ubd
      const responseUbdDate = new Date(responseUbd)
      const yearExpiredResponse = responseUbdDate.getFullYear()
      const monthExpiredResponse = responseUbdDate.getMonth() + 1
      expect(item[0].sku).to.equal(sku)
      expect(item[0].product.name).to.equal(name)
      expect(item[0].qty).to.equal(qty)
      expect(yearExpiredResponse).to.equal(yearExpiredTest)
      expect(monthExpiredResponse).to.equal(monthExpiredTest)
      const productPrice = item[0].product.price
      expect(productPrice).to.equal(price)
      Cypress.env(`price_${sku}`, price)
      //sub_total
      expect(item[0].sub_total).to.equal(price)
      const totalAmount = Cypress.env(`totalAmount`)
      const paymentAmount = Cypress.env(`totalAmount`) - price
      Cypress.env('paymentAmount', paymentAmount)
      expect(response.body.data.totalAmount).to.equal(totalAmount)
      expect(response.body.data.paymentAmount).to.equal(paymentAmount)
    })
  })

  it('Should able to add same void item to cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const qty = 1
    const ubd = '2025-03'
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
      expect(response.status).to.equal(201)
      const item = response.body.data.void_items
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1
      // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
      const responseUbd = item[1].ubd
      const responseUbdDate = new Date(responseUbd)
      const yearExpiredResponse = responseUbdDate.getFullYear()
      const monthExpiredResponse = responseUbdDate.getMonth() + 1
      expect(item.length).to.equal(2)
      expect(item[1].sku).to.equal(sku)
      expect(item[1].qty).to.equal(qty)
      expect(yearExpiredResponse).to.equal(yearExpiredTest)
      expect(monthExpiredResponse).to.equal(monthExpiredTest)
      const productPrice = item[1].product.price
      expect(productPrice).to.equal(price)
      Cypress.env(`price_${sku}`, price)
      //sub_total
      expect(item[0].sub_total).to.equal(price)
      const totalAmount = Cypress.env(`totalAmount`)
      const paymentAmount = Cypress.env(`paymentAmount`) - price
      Cypress.env('paymentAmount', paymentAmount)
      expect(response.body.data.totalAmount).to.equal(totalAmount)
      expect(response.body.data.paymentAmount).to.equal(paymentAmount)
    })
  })

  it('Should able to add other void item to cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const product = Cypress.env('Product_C')
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
      expect(response.status).to.equal(201)
      const item = response.body.data.void_items
      expect(item.length).to.equal(3)
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1
      // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
      item.forEach((it) => {
        if (it.sku === sku) {
          const responseUbd = it.ubd
          const responseUbdDate = new Date(responseUbd)
          const yearExpiredResponse = responseUbdDate.getFullYear()
          const monthExpiredResponse = responseUbdDate.getMonth() + 1
          expect(it.sku).to.equal(sku)
          expect(it.product.name).to.equal(name)
          expect(it.qty).to.equal(qty)
          expect(yearExpiredResponse).to.equal(yearExpiredTest)
          expect(monthExpiredResponse).to.equal(monthExpiredTest)
          const productPrice = it.product.price
          expect(productPrice).to.equal(price)
          Cypress.env(`price_${sku}`, price)
          //sub_total
          expect(it.sub_total).to.equal(price)
        }
      })
      const totalAmount = Cypress.env(`totalAmount`)
      const paymentAmount =
        Cypress.env('paymentAmount') - Cypress.env(`price_${sku}`)
      Cypress.env('paymentAmount', paymentAmount)
      expect(response.body.data.totalAmount).to.equal(totalAmount)
      expect(response.body.data.paymentAmount).to.equal(paymentAmount)
    })
  })

  it('Verify if add void item with invalid sku to cart', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const invalid_sku = '19025221'
    const qty = 1
    const ubd = '2026-01'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false,
      body: {
        sku: invalid_sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Product not found.')
    })
  })

  it('Verify if add void item without ubd to cart', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const product = Cypress.env('Product_C')
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
      expect(response.status).to.equal(201)
      const item = response.body.data.void_items
      expect(item.length).to.equal(4)
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1
      const jml = []
      item.forEach((it) => {
        if (it.sku === sku && it.ubd === null) {
          expect(it.qty).to.equal(qty)
          jml.push(it.sku)
          const productPrice = it.product.price
          expect(productPrice).to.equal(price)
          Cypress.env(`price_${sku}`, price)
          //sub_total
          expect(it.sub_total).to.equal(price)
        }
      })
      expect(jml.length, `Sku ${sku} should exist`).to.equal(1)
      const totalAmount = Cypress.env('totalAmount')
      const paymentAmount =
        Cypress.env('paymentAmount') - Cypress.env(`price_${sku}`)
      Cypress.env('paymentAmount', paymentAmount)
      expect(response.body.data.totalAmount).to.equal(totalAmount)
      expect(response.body.data.paymentAmount).to.equal(paymentAmount)
    })
  })

  it('Check validation if add void item without UBD', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void'
    const product = Cypress.env('Product_C')
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
      expect(response.status).to.equal(400)
    })
  })

  // it('Verify if add void item with invalid UBD format', () => {
  //     const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
  //     const invalid_sku = "190252218"
  //     const qty = 1
  //     const ubd = "2025"
  //     cy.api({
  //         method: "POST",
  //         url,
  //         headers: Cypress.env("REQUEST_HEADERS"),
  //         failOnStatusCode: false,
  //         body: {
  //             sku: invalid_sku,
  //             qty: qty,
  //             customPrice: 0,
  //             notes: "",
  //             requiredUbd: true,
  //             ubd: ubd
  //         }
  //     })
  //     .should(response => {
  //         expect(response.status).to.equal(400)
  //     })
  // })
})

describe('Staff remove void item from cart customer', function () {
  it('Should able to remove void item in cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void/remove'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-02'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      const item = response.body.data.void_items
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1
      const jml = []
      item.forEach((it) => {
        if (it.sku === sku) {
          const responseUbd = it.ubd
          const responseUbdDate = new Date(responseUbd)
          const yearExpiredResponse = responseUbdDate.getFullYear()
          const monthExpiredResponse = responseUbdDate.getMonth() + 1
          if (
            yearExpiredResponse === yearExpiredTest &&
            monthExpiredResponse === monthExpiredTest
          ) {
            jml.push(it.sku)
          }
        }
      })
      const totalAmount = Cypress.env('totalAmount')
      const paymentAmount =
        Cypress.env('paymentAmount') + Cypress.env(`price_${sku}`)
      Cypress.env('paymentAmount', paymentAmount)
      // expect(response.body.data.totalAmount).to.equal(totalAmount)
      // expect(response.body.data.paymentAmount).to.equal(paymentAmount)
      expect(jml.length, `SKU ${sku} should not exist`).to.equal(0)
    })
  })

  it('Verify remove void item in cart if ubd doesnt match', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void/remove'
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const qty = 1
    const ubd = '2025-10'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false,
      body: {
        sku: sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Product not found on cart')
    })
  })

  it('Verify if remove void item with invalid sku', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/void/remove'
    const invalid_sku = '10108054'
    const qty = 1
    const ubd = '2025-10'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false,
      body: {
        sku: invalid_sku,
        requiredUbd: true,
        ubd: ubd
      }
    }).should((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Product not found on cart')
    })
  })

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
