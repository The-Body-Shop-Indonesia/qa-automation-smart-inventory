const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PAYMENT = Cypress.config('baseUrlPayment')

// describe('Set product to use', function() {
//   it('Successfully login employee', () => {
//       const url = URL_USER + "/employee/login"
//       cy.api({
//           method: "POST",
//           url,
//           body: {
//               nik: Cypress.env("EMP_NIK"),
//               storeCode: Cypress.env("EMP_STORECODE"),
//               pin: Cypress.env("EMP_PIN")
//           }
//       })
//       .should(response => {
//           expect(response.status).to.equal(201)
//           const body = response.body
//           expect(body).to.haveOwnProperty("statusCode")
//           expect(body).to.haveOwnProperty("message")
//           expect(body).to.haveOwnProperty("data")
//           expect(body.statusCode).to.equal(201)
//           expect(body.message).to.equal("Success")
//           const data = body.data
//           expect(data).to.haveOwnProperty("accessToken")
//       })
//       .then(response => {
//           const employeeToken = response.body.data.accessToken
//           Cypress.env("REQUEST_HEADERS", {
//               Authorization: "Bearer " + employeeToken,
//               channel: "pos"
//           })
//           Cypress.env("emp_nik", response.body.data.user.nik)
//           Cypress.env("storeCode", response.body.data.user.storeCode)
//       })
//   })

//   it('Should get product list', () => {
//       const url = URL_PRODUCT + "/employee/product?page=1&size=10&sort=name_asc&keyword=shampoo&is_virtual_bundling=false"
//       cy.api({
//           method: "GET",
//           url,
//           headers: Cypress.env("REQUEST_HEADERS")
//       })
//       .should(response => {
//           expect(response.body.data.docs.length).to.be.greaterThan(0)
//           Cypress.env("Product_A", response.body.data.docs[0])
//           Cypress.env("Product_B", response.body.data.docs[1])
//           Cypress.env("Product_C", response.body.data.docs[2])
//       })
//   })
// })

describe('Check current tier and purchase total before transaction', function () {
  before('Login customer', () => {
    const identifier = Cypress.env('IDENTIFIER_SDC')
    const otp = Cypress.env('OTP_SDC')
    const url = `${URL_USER}/otp/validate`
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        identifier: Cypress.env('IDENTIFIER_SDC'),
        otp: Cypress.env('OTP_SDC'),
        pageType: 'Login'
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenUser = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_USER', {
        Authorization: 'Bearer ' + tokenUser
      })
    })
  })
  it('Should get total purchase', () => {
    const url = `${URL_USER}/membership/card/info`
    cy.api({
      method: 'GET',
      url: url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      const totalPurchase = response.body.data.currentAmount
      Cypress.env('totalPurchase', totalPurchase)
      cy.log(`Total purchase before transaction is ${totalPurchase}`)
    })
  })
})

describe('Set sku product to use', function () {
  before('Cek Stok untuk Semua SKU', () => {
    // Muat data dari fixture
    cy.fixture('skus').then((data) => {
      const amount = 100 // jumlah stok yang ingin ditambahkan

      // Iterasi setiap SKU dalam array skuProducts
      data.skuProducts.forEach((sku) => {
        const key = `stock:${sku}-14216-stock` // Buat key dengan SKU yang diambil

        // Menjalankan cy.task untuk mengatur stok pada setiap SKU
        cy.task('addStock', { key, amount }, { timeout: 30000 }).should('exist')
      })
      // Iterasi setiap SKU dalam array skuVoids
      data.skuVoids.forEach((sku) => {
        const key = `stock:${sku}-14216-stock` // Buat key dengan SKU yang diambil

        // Menjalankan cy.task untuk mengatur stok pada setiap SKU
        cy.task('addStock', { key, amount }, { timeout: 30000 }).should('exist')
      })
      // Iterasi setiap SKU dalam array skuProducts
      data.skuProducts.forEach((sku) => {
        const key = `stock:${sku}-34999-stock` // Buat key dengan SKU yang diambil

        // Menjalankan cy.task untuk mengatur stok pada setiap SKU
        cy.task('addStock', { key, amount }, { timeout: 30000 }).should('exist')
      })
    })
  })
  before('Set sku product', () => {
    // Mengambil data dari fixture
    cy.fixture('skus').then((data) => {
      const skus = data.skuProducts
      const selectedSkus = new Set() // Set untuk memastikan SKU unik

      while (selectedSkus.size < 2) {
        const randomIndex = Math.floor(Math.random() * skus.length)
        selectedSkus.add(skus[randomIndex])
      }

      // Mengubah Set ke array
      const [sku1, sku2] = Array.from(selectedSkus)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku1}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_A', data)
      })
      // Cypress.env('Product_A', sku1)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku2}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_B', data)
      })
      // Cypress.env('Product_B', sku2)
      // cy.log(
      //   `Used sku product: ${Cypress.env('Product_A')}, ${Cypress.env('Product_B')}`
      // )
    })
  })
  before('Set 1 sku void', () => {
    // Mengambil data dari fixture
    cy.fixture('skus').then((data) => {
      const skus = data.skuVoids
      const selectedSkus = new Set() // Set untuk memastikan SKU unik

      while (selectedSkus.size < 1) {
        const randomIndex = Math.floor(Math.random() * skus.length)
        selectedSkus.add(skus[randomIndex])
      }

      // Mengubah Set ke array
      const [sku1] = Array.from(selectedSkus)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku1}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_C', data)
      })
      // Cypress.env('Product_B', sku1)
      // cy.log(`Used sku void: ${Cypress.env('Product_B')}`)
    })
  })
  it('Used sku', () => {
    const itemA = Cypress.env('Product_A')
    const itemB = Cypress.env('Product_B')
    const itemC = Cypress.env('Product_C')
    cy.log(`Item A: ${itemA.sku}, price: ${itemA.price}`)
    cy.log(`Item B: ${itemB.sku}, price: ${itemB.price}`)
    cy.log(`Item C: ${itemC.sku}, price: ${itemC.price}`)
  })
})

describe('Admin check stock product before transaction', function () {
  it('Login admin', () => {
    const url = URL_USER + '/admin/login'
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        username: Cypress.env('ADMIN_USERNAME'),
        password: Cypress.env('ADMIN_PASSWORD')
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenAdmin = response.body.data.accessToken
      // const employeeToken = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_ADMIN', {
        Authorization: 'Bearer ' + tokenAdmin
      })
    })
  })

  it('Should return the correct SKU, Store Code, and UBD', () => {
    // check stock summary sku 112010666
    const url = URL_PRODUCT + '/admin/stock-summary'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const storeCode = Cypress.env('EMP_STORECODE')
    const ubd = null
    const urlFilter =
      url + `?sku=${sku}&storeCode=${storeCode}&ubd=${ubd}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).then((response) => {
      const data = response.body.data.docs
      expect(Cypress._.every(data, ['sku', sku])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      // const qty_awal = 0
      if (data.length === 0) {
        const qty_awal = 0
        Cypress.env(`qty_awal_${sku}`, qty_awal)
        cy.log('Quantity ' + sku + ' before trx: ', qty_awal)
      } else {
        const qty_awal = data[0].qty
        Cypress.env(`qty_awal_${sku}`, qty_awal)
        cy.log('Quantity ' + sku + ' before trx: ', qty_awal)
      }
      // Cypress.env("qty_awal_112010666", qty_awal)
    })

    // check stock untuk sku 126490005
    const product2 = Cypress.env('Product_B')
    const sku2 = product2.sku
    const ubd2 = null
    const urlFilter2 =
      url + `?sku=${sku2}&storeCode=${storeCode}&ubd=${ubd2}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter2,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).then((response) => {
      const data = response.body.data.docs
      // expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
      expect(Cypress._.every(data, ['sku', sku2])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd2])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      // const qty_awal = 0
      if (data.length === 0) {
        const qty_awal = 0
        Cypress.env(`qty_awal_${sku2}`, qty_awal)
        cy.log('Quantity ' + sku2 + ' before trx: ', qty_awal)
      } else {
        const qty_awal = data[0].qty
        Cypress.env(`qty_awal_${sku2}`, qty_awal)
        cy.log('Quantity ' + sku2 + ' before trx: ', qty_awal)
      }
      // Cypress.env("qty_awal_126490005", qty_awal)
    })

    const product3 = Cypress.env('Product_C')
    const sku3 = product3.sku
    const ubd3 = null
    const urlFilter3 =
      url + `?sku=${sku3}&storeCode=${storeCode}&ubd=${ubd3}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter3,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).then((response) => {
      const data = response.body.data.docs
      // expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
      expect(Cypress._.every(data, ['sku', sku3])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd3])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      // const qty_awal = 0
      if (data.length === 0) {
        const qty_awal = 0
        Cypress.env(`qty_awal_${sku3}`, qty_awal)
        cy.log('Quantity ' + sku3 + ' before trx: ', qty_awal)
      } else {
        const qty_awal = data[0].qty
        Cypress.env(`qty_awal_${sku3}`, qty_awal)
        cy.log('Quantity ' + sku3 + ' before trx: ', qty_awal)
      }
      // Cypress.env("qty_awal_126490005", qty_awal)
    })
  })
})

describe('Staff Create Order for Member Customer', function () {
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
        Cypress.env('emp_nik', response.body.data.user.nik)
        Cypress.env('storeCode', response.body.data.user.storeCode)
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

  it('Shows all cart list', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
    })
  })

  it('Creates a member cart', () => {
    const url_cus =
      URL_USER +
      '/employee/detail-member?cardNumber=' +
      Cypress.env('CARDNUMBER')
    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      const currentTier = response.body.data.currentTier.code
      Cypress.env('currentTier', currentTier)
      cy.log(`currentTier = ${Cypress.env('currentTier')}`)
      const image = response.body.data.currentTier.image
      Cypress.env('customerImage', image)
      cy.log(`customerImage = ${image}`)
      const currentPoint = response.body.data.currentPoint
      Cypress.env('currentPoint', currentPoint)
      cy.log(`current point = ${currentPoint}`)
      // dimasukkan kesini
      const { response: mockResponse } =
        require('../../fixtures/cart-member-generators').createCartPayload_14216()
      const url = URL_PRODUCT + '/employee/cart/create'
      cy.api({
        method: 'POST',
        url,
        body: {
          isGuest: false,
          firstName: Cypress.env('FIRSTNAME'),
          lastName: Cypress.env('LASTNAME'),
          cardNumber: Cypress.env('CARDNUMBER'),
          nik: '',
          FamilyNumber: '',
          isFamily: false,
          customerGroup: Cypress.env('currentTier'),
          image:
            'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg',
          isScanner: true,
          isLapsed: false,
          isReactivated: false,
          isIcarusAppUser: false,
          autoEnroll: false,
          autoEnrollFrom: ''
        },
        headers: Cypress.env('REQUEST_HEADERS')
      })
        .should((response) => {
          expect(response.status).to.equal(201)
          expect(response.body.data).to.haveOwnProperty('_id')
          expect(response.body.data.customer).to.haveOwnProperty('_id')
          const cartId = response.body.data._id
          Cypress.env('cartId', cartId)
          const customerId = response.body.data.customer._id
          Cypress.env('customerId', customerId)
          const cardNumber = response.body.data.customer.cardNumber
          Cypress.env('cus_cardNumber', cardNumber)
          const data = response.body.data
          expect(data.customer.isGuest).to.equal(false)
          expect(data.customer.firstName).to.equal(Cypress.env('FIRSTNAME'))
          expect(data.customer.lastName).to.equal(Cypress.env('LASTNAME'))
          expect(data.customer.cardNumber).to.equal(Cypress.env('CARDNUMBER'))
          expect(data.customer.customerGroup).to.equal(
            Cypress.env('currentTier')
          )
        })
        .should((response) => {
          const data = response.body.data
          delete data.user
          delete data.customer._id
          delete data.customer.firstName
          delete data.customer.lastName
          delete data.customer.cardNumber
          delete data.customer.customerGroup
          delete data.customer.image
          delete data.customer.id
          delete data.createdBy.updatedAt
          delete data.createdBy.lastLogin
          delete data.createdBy.shiftAttendanceId
          delete data.createdBy.shiftCode
          delete data._id
          delete data.updatedAt
          delete data.createdAt
          expect(data).to.deep.equal(mockResponse)
        })
    })
  })

  it('Shows recently created member cart on the first list', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      const data = response.body.data
      const firstItem = data.docs[0]
      Cypress.env('CUSTOMER_ID', firstItem.customer_id)
      delete firstItem._id
      delete firstItem.customer_id
      delete firstItem.customer_tier
      const firstname = Cypress.env('FIRSTNAME')
      const cardNumber = Cypress.env('CARDNUMBER')
      const expected =
        require('../../fixtures/cart-member-generators').newlyCreatedMemberCart(
          firstname,
          cardNumber
        )
      expect(firstItem).to.deep.equal(expected)
    })
  })

  it('Shows empty cart details', () => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.data.items.length).to.equal(0)
      expect(response.body.data.totalAmount).to.equal(0)
      expect(response.body.data.totalWeight).to.equal(0)
      expect(response.body.data.paymentAmount).to.equal(0)
      expect(response.body.data.currentPayment).to.equal(0)
      Cypress.env('CART', response.body.data)
    })
  })

  it('Sucessfully assign sales name', () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/assign-to`
    const nik = Cypress.env('emp_nik')
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: { nik }
    }).should((response) => {
      const actualData = response.body.data.assignTo
      expect(actualData.nik, 'Employee NIK should ' + nik).to.equal(nik)
      Cypress.env('CART', response.body.data)
    })
  })

  it('Successfully add 1 new item', () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/item/add`
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const payload = {
      sku: sku,
      qty: 1,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    })
      .should((response) => {
        const data = response.body.data
        expect(data.items.length).to.equal(1)
        expect(data.void_items.length).to.equal(0)

        const item = data.items[0]
        expect(item.sku, 'SKU should ' + payload.sku).to.equal(payload.sku)
        expect(item.product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(
          item.qty,
          'Quantity of product ' + payload.sku + ' should ' + payload.qty
        ).to.equal(payload.qty)
        expect(item.customPrice).to.equal(payload.customPrice)
        expect(item.ubd, 'UBD should null').to.equal(null)

        const ubdDetail = item.ubdDetail[0]
        expect(ubdDetail.ubd).to.equal(null)
        expect(ubdDetail.total, 'ubdDetail.total should 1').to.equal(1)
      })
      .should((response) => {
        const data = response.body.data
        const productPrice = data.items[0].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        const itemPrice = data.items[0].sub_total
        expect(itemPrice, `Subtotal of sku ${sku} should be ${price}`).to.equal(
          price
        )
        expect(data.totalAmount, 'totalAmount should ' + itemPrice).to.equal(
          itemPrice
        )
        expect(
          data.paymentAmount,
          'paymentAmount should ' + itemPrice
        ).to.equal(itemPrice)

        const paymentDetails = data.paymentDetails
        expect(
          paymentDetails[0].total,
          'paymentDetails.Subtotal should ' + itemPrice
        ).to.equal(itemPrice)
        expect(
          paymentDetails[12].total,
          'paymentDetails.Total should ' + itemPrice
        ).to.equal(itemPrice)

        Cypress.env('CART', data)
      })
  })

  it("Successfully increasing item's quantity to 2", () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/item/add`
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const payload = {
      sku: sku,
      qty: 1,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    })
      .should((response) => {
        const data = response.body.data
        expect(data.items.length, `Item should still 1`).to.equal(1)
        expect(data.void_items.length).to.equal(0)

        const item = data.items[0]
        expect(item.sku, 'SKU should ' + payload.sku).to.equal(payload.sku)
        expect(item.product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(
          item.qty,
          'Quantity of product ' + payload.sku + ' should 2'
        ).to.equal(2)
        expect(item.customPrice).to.equal(payload.customPrice)
        expect(item.ubd, 'UBD should null').to.equal(null)

        const ubdDetail = item.ubdDetail[0]
        expect(ubdDetail.ubd).to.equal(null)
        expect(ubdDetail.total, 'ubdDetail.total should 2').to.equal(2)
      })
      .should((response) => {
        const data = response.body.data
        const productPrice = data.items[0].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        const itemPrice = data.items[0].sub_total
        expect(
          itemPrice,
          `Subtotal of sku ${sku} should be ${price * 2}`
        ).to.equal(price * 2)
        expect(data.totalAmount, 'totalAmount should ' + itemPrice).to.equal(
          itemPrice
        )
        expect(
          data.paymentAmount,
          'paymentAmount should ' + itemPrice
        ).to.equal(itemPrice)

        const paymentDetails = data.paymentDetails
        expect(
          paymentDetails[0].total,
          'paymentDetails.Subtotal should ' + itemPrice
        ).to.equal(itemPrice)
        expect(
          paymentDetails[12].total,
          'paymentDetails.Total should ' + itemPrice
        ).to.equal(itemPrice)

        Cypress.env('CART', data)
      })
  })

  it('Error when searched sku is not in the database', () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/item/add`
    const payload = {
      sku: '1234567891',
      qty: 1,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload,
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal('Product not found.')
    })
  })

  it('Successfully add 1 more new item', () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/item/add`
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const payload = {
      sku: sku,
      qty: 1,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    })
      .should((response) => {
        const data = response.body.data
        expect(data.items.length, `Items should 2`).to.equal(2)
        expect(data.void_items.length).to.equal(0)

        const item = data.items[1]
        expect(item.sku, 'SKU should ' + payload.sku).to.equal(payload.sku)
        expect(item.product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(
          item.qty,
          'Quantity of product ' + payload.sku + ' should ' + payload.qty
        ).to.equal(payload.qty)
        expect(item.customPrice).to.equal(payload.customPrice)
        expect(item.ubd, 'UBD should null').to.equal(null)

        const ubdDetail = item.ubdDetail[0]
        expect(ubdDetail.ubd).to.equal(null)
        expect(ubdDetail.total, 'ubdDetail.total should 1').to.equal(1)
      })
      .should((response) => {
        const data = response.body.data
        const productPrice = data.items[1].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        const itemPrice = data.items[1].sub_total
        expect(itemPrice, `Subtotal of sku ${sku} should be ${price}`).to.equal(
          price
        )
        const itemsSubtotal = data.items.reduce(
          (total, { sub_total }) => total + sub_total,
          0
        )
        Cypress.env('totalAmount', itemsSubtotal)
        Cypress.env('paymentAmount', itemsSubtotal)
        expect(
          data.totalAmount,
          'totalAmount should ' + itemsSubtotal
        ).to.equal(itemsSubtotal)
        expect(
          data.paymentAmount,
          'paymentAmount should ' + itemsSubtotal
        ).to.equal(itemsSubtotal)

        const paymentDetails = data.paymentDetails
        expect(
          paymentDetails[0].total,
          'paymentDetails.Subtotal should ' + itemsSubtotal
        ).to.equal(itemsSubtotal)
        expect(
          paymentDetails[12].total,
          'paymentDetails.Total should ' + itemsSubtotal
        ).to.equal(itemsSubtotal)
        Cypress.env('CART', data)
      })
  })

  it('Successfully add 1 void item', () => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}/item/void`
    const product = Cypress.env('Product_C')
    const sku = product.sku
    const name = product.name
    const price = product.price
    const payload = {
      sku: sku,
      qty: 1,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    })
      .should((response) => {
        const data = response.body.data
        expect(data.items.length, `Items should 2`).to.equal(2)
        expect(data.void_items.length, `Item void should 1`).to.equal(1)

        const item = data.void_items[0]
        expect(item.sku, 'SKU void should ' + payload.sku).to.equal(payload.sku)
        expect(item.product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(
          item.qty,
          'Quantity of product ' + payload.sku + ' should ' + payload.qty
        ).to.equal(payload.qty)
        expect(item.customPrice).to.equal(payload.customPrice)
        expect(item.ubd, 'UBD should null').to.equal(null)
      })
      .should((response) => {
        const data = response.body.data
        const productPrice = data.void_items[0].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        const itemPrice = data.void_items[0].sub_total
        expect(itemPrice, `Subtotal of sku ${sku} should be ${price}`).to.equal(
          price
        )
        const totalAmount = Cypress.env('totalAmount')
        const paymentAmount = totalAmount - price
        Cypress.env('paymentAmount', paymentAmount)
        expect(data.totalAmount, 'totalAmount should ' + totalAmount).to.equal(
          totalAmount
        )
        expect(
          data.paymentAmount,
          'paymentAmount should ' + paymentAmount
        ).to.equal(paymentAmount)

        const paymentDetails = data.paymentDetails
        expect(
          paymentDetails[0].total,
          'paymentDetails.Subtotal should ' + paymentAmount
        ).to.equal(paymentAmount)
        expect(
          paymentDetails[12].total,
          'paymentDetails.Total should ' + paymentAmount
        ).to.equal(paymentAmount)
        Cypress.env('CART', data)
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
    const cart = Cypress.env('CART')
    const mockPayload = {
      method: '18',
      isInstallment: false,
      token: '',
      installmentTenor: 0,
      isOvo: false,
      ovoNumber: '',
      ovoRetryCount: 0,
      bin_number: '',
      approvalCode: 'AUT123',
      value: cart.paymentAmount
    }

    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('CUSTOMER_ID')}/update-payment-v2`
    cy.api({
      url,
      method: 'PATCH',
      headers: Cypress.env('REQUEST_HEADERS'),
      body: mockPayload
    }).should((response) => {
      expect(response.status).to.equal(200)

      const body = response.body.data
      // validate payment field
      const { info, name, changeDue, ...paymentObjResponse } = body.payments
      expect(paymentObjResponse).to.deep.equal(mockPayload)

      // validate multipayment
      expect(body.multiPayments).to.be.an('array')
      expect(body.multiPayments.length).to.be.greaterThan(0)

      Cypress.env('CART', response.body.data)
    })
  })

  it('Successfully validates pre-order informations', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('CUSTOMER_ID')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
    })
  })

  it('Successfully create order', () => {
    const cart = Cypress.env('CART')

    // expect(cart.omni_trx_type).to.equal("WALK_IN")
    // expect(cart.is_omni).to.equal(false)

    const payload = {
      cart: cart._id,
      approvalCode: cart.payments.approvalCode,
      notes: ''
    }

    const url = URL_PRODUCT + `/order/create-v2`
    cy.api({
      url,
      method: 'POST',
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    }).should((response) => {
      expect(response.status).to.equal(201)
      const body = response.body.data

      expect(body).to.haveOwnProperty('orderNumber')
      Cypress.env('orderNumber', response.body.data.orderNumber)
      expect(body.cartId).to.equal(cart._id)

      expect(body.items).to.be.an('array')
      expect(body.items.length).to.be.greaterThan(0)
      let totalItemPrice = 0
      body.items.forEach((item) => {
        totalItemPrice += item.grandTotal
        const qty = item.qty
        const totalQtyFromUbdDetail = item.ubdDetail.reduce((total, ubd) => {
          total += ubd.total
          return total
        }, 0)
        expect(qty).to.equal(totalQtyFromUbdDetail)
      })

      expect(body.totalAmount).to.equal(Cypress.env('totalAmount'))
      expect(body.paymentAmount).to.equal(Cypress.env('paymentAmount'))
      expect(
        body.payments.paymentStatus,
        'payment.paymentStatus should Paid'
      ).to.equal('Paid')
      expect(body.paymentStatus, 'paymentStatus should Paid').to.equal('Paid')
      expect(body.orderStatus, 'orderStatus should PAID').to.equal('PAID')
    })
  })
})
describe('Check point after transaction', function () {
  it('Should get correct point amount', () => {
    const url_cus =
      URL_USER +
      '/employee/detail-member?cardNumber=' +
      Cypress.env('CARDNUMBER')
    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      const paymentAmount = Cypress.env('paymentAmount')
      const tierBefore = Cypress.env('currentTier')
      const pointBefore = Cypress.env('currentPoint')
      const pointAfter = response.body.data.currentPoint
      if (tierBefore === 'STARTER') {
        const pointEarn = Math.floor(paymentAmount / 45000)
        cy.log(`Point received: ${pointEarn}`)
        expect(
          pointAfter,
          'After purchase, point customer should be '
        ).to.equal(pointBefore + pointEarn)
      } else if (tierBefore === 'CLUB') {
        const pointEarn = Math.floor(paymentAmount / 35000)
        cy.log(`Point received: ${pointEarn}`)
        expect(
          pointAfter,
          'After purchase, point customer should be '
        ).to.equal(pointBefore + pointEarn)
      } else if (tierBefore === 'FAN') {
        const pointEarn = Math.floor(paymentAmount / 25000)
        cy.log(`Point received: ${pointEarn}`)
        expect(
          pointAfter,
          'After purchase, point customer should be '
        ).to.equal(pointBefore + pointEarn)
      }
      // cy.log(`cuurent point = ${currentPoint}`)
      // cek kenaikan tier (PR)
    })
  })
})

describe('Check tier and purchase total after transaction', function () {
  it('Should get tier and total purchase', () => {
    const url = `${URL_USER}/membership/card/info`
    cy.api({
      method: 'GET',
      url: url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      const tierBefore = Cypress.env('currentTier')
      const tierAfter = response.body.data.currentTier.code
      const totalPurchaseBefore = Cypress.env('totalPurchase')
      const paymentAmount = Cypress.env('paymentAmount')
      const currentPurchaseAmount = response.body.data.currentAmount
      const currentAmount = totalPurchaseBefore + paymentAmount
      expect(
        currentPurchaseAmount,
        `Purchase total after transaction should ${currentAmount}`
      ).to.eql(currentAmount)
      if (currentAmount >= 0 && currentAmount <= 250000) {
        const tier = 'STARTER'
      } else if (currentAmount >= 0 && currentAmount <= 3000000) {
        const tier = 'CLUB'
      } else {
        const tier = 'FAN'
      }
      expect(
        tierAfter,
        `After purchase, tier customer should be ${tier}`
      ).to.equal(tier)
      // cy.log(`Total purchase before transaction is ${totalPurchase}`)
    })
  })
})

describe('Admin check stock product after transaction', function () {
  it('Should get stock movement data', () => {
    // check stock movement sku 112010666
    const url = URL_PRODUCT + '/stock-movement'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    // const sku = '112010666'
    const ubd = null
    const urlFilter =
      url +
      `?sku=${sku}&from=${Cypress.env('storeCode')}&event=sales&orderNumber=${Cypress.env('orderNumber')}&ubd=${ubd}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.be.greaterThan(0)
      expect(data.length).to.equal(1)
      expect(data).to.be.an('array')
      const movement = data[0]
      expect(movement.sku).to.equal(sku)
      expect(movement.from).to.equal(Cypress.env('storeCode'))
      expect(movement.orderNumber).to.equal(Cypress.env('orderNumber'))
      expect(
        movement.qty,
        'Stock movement for sales product ' + sku + ' should 2'
      ).to.equal(2)
      Cypress.env(`qty_movement_${sku}`, movement.qty)
    })

    // check stock untuk sku 126490005
    const product2 = Cypress.env('Product_B')
    const sku2 = product2.sku
    // const sku2 = '126490005'
    const ubd2 = null
    const urlFilter2 =
      url +
      `?sku=${sku2}&from=${Cypress.env('storeCode')}&event=sales&orderNumber=${Cypress.env('orderNumber')}&ubd=${ubd2}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter2,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.be.greaterThan(0)
      expect(data.length).to.equal(1)
      expect(data).to.be.an('array')
      const movement = data[0]
      Cypress.env(`qty_movement_${sku2}`, movement.qty)
      expect(movement.sku).to.equal(sku2)
      expect(movement.from).to.equal(Cypress.env('storeCode'))
      expect(movement.orderNumber).to.equal(Cypress.env('orderNumber'))
      expect(
        movement.qty,
        'Stock movement for sales product ' + sku2 + ' should 1'
      ).to.equal(1)
    })

    // void
    const product3 = Cypress.env('Product_C')
    const sku3 = product3.sku
    // const sku2 = '126490005'
    const ubd3 = null
    const urlFilter3 =
      url +
      `?sku=${sku3}&from=${Cypress.env('storeCode')}&event=sales&orderNumber=${Cypress.env('orderNumber')}&ubd=${ubd3}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter3,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.be.greaterThan(0)
      expect(data.length).to.equal(1)
      expect(data).to.be.an('array')
      const movement = data[0]
      Cypress.env(`qty_movement_${sku3}`, -1)
      expect(movement.sku).to.equal(sku3)
      expect(movement.from).to.equal(Cypress.env('storeCode'))
      expect(movement.orderNumber).to.equal(Cypress.env('orderNumber'))
      expect(
        movement.qty,
        'Stock movement for sales void product ' + sku3 + ' should -1'
      ).to.equal(-1)
      // cy.log(`Quantity movement ${sku3} after trx: `, movement.qty)
    })
  })

  it('Should return the correct SKU, Store Code, and UBD', () => {
    // check stock summary sku 112010666
    const url = URL_PRODUCT + '/admin/stock-summary'
    const product = Cypress.env('Product_A')
    const sku = product.sku
    // const sku = '112010666'
    const storeCode = Cypress.env('storeCode')
    const ubd = null
    const urlFilter =
      url + `?sku=${sku}&storeCode=${storeCode}&ubd=${ubd}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.equal(1)
      expect(Cypress._.every(data, ['sku', sku])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      const qty_awal = Cypress.env(`qty_awal_${sku}`)
      const qty_after = qty_awal - Cypress.env(`qty_movement_${sku}`)
      expect(
        data[0].qty,
        'Quantity stock ' + sku + ' after trx should ' + qty_after
      ).to.equal(qty_after)
    })

    // check stock untuk sku 126490005
    const product2 = Cypress.env('Product_B')
    const sku2 = product2.sku
    // const sku2 = '126490005'
    const ubd2 = null
    const urlFilter2 =
      url + `?sku=${sku2}&storeCode=${storeCode}&ubd=${ubd2}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter2,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.equal(1)
      expect(Cypress._.every(data, ['sku', sku2])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      console.log(
        Cypress.env(`qty_awal_${sku2}`),
        Cypress.env(`qty_movement_${sku2}`)
      )

      const qty_awal = Cypress.env(`qty_awal_${sku2}`)
      const qty_after = qty_awal - Cypress.env(`qty_movement_${sku2}`)
      expect(
        data[0].qty,
        'Quantity stock ' + sku2 + ' after trx should ' + qty_after
      ).to.equal(qty_after)
    })

    const product3 = Cypress.env('Product_C')
    const sku3 = product3.sku
    // const sku2 = '126490005'
    const ubd3 = null
    const urlFilter3 =
      url + `?sku=${sku3}&storeCode=${storeCode}&ubd=${ubd3}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter3,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).should((response) => {
      const data = response.body.data.docs
      expect(data.length).to.equal(1)
      expect(Cypress._.every(data, ['sku', sku3])).to.deep.equal(true)
      expect(Cypress._.every(data, ['storeCode', storeCode])).to.deep.equal(
        true
      )
      expect(Cypress._.every(data, ['ubd', ubd])).to.deep.equal(true)
      // expect(data.length).to.equal(1);
      console.log(
        Cypress.env(`qty_awal_${sku3}`),
        Cypress.env(`qty_movement_${sku3}`)
      )

      const qty_awal = Cypress.env(`qty_awal_${sku3}`)
      const qty_after = qty_awal - Cypress.env(`qty_movement_${sku3}`)
      expect(
        data[0].qty,
        'Quantity stock ' + sku3 + ' after trx should ' + qty_after
      ).to.equal(qty_after)
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

//test sdc
