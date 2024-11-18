const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PAYMENT = Cypress.config('baseUrlPayment')

describe('General API Test Group', function () {
  before('Set 1 sku product', () => {
    // Mengambil data dari fixture
    cy.fixture('skus').then((data) => {
      const skus = data.skuProducts
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
        Cypress.env('Product_A', data)
      })
    })
  })

  before('Login admin', () => {
    const url = URL_USER + '/admin/login'
    cy.request({
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

  before('Successfully login staff', () => {
    const url = URL_USER + '/employee/login'
    cy.request({
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
        Cypress.env('emp_token', 'Bearer ' + employeeToken)
        Cypress.env('emp_nik', response.body.data.user.nik)
        Cypress.env('storeCode', response.body.data.user.storeCode)
      })
  })

  before('Check shift', () => {
    const url = URL_USER + '/employee/shift'
    cy.request({
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

  before('Close shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 200 && body.data.shift.status === 'expired') {
      const url = URL_USER + '/employee/shift/close'
      cy.request({
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

  before('Open shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 201) {
      const url = URL_USER + '/employee/shift/open'
      cy.request({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 400) {
      const url = URL_USER + '/employee/shift/open'
      cy.request({
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

  before('Creates a public cart', () => {
    const { request: mockRequest, response: mockResponse } =
      require('../../fixtures/generators').createPublicCartPayload_14216()
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.request({
      method: 'POST',
      url,
      body: mockRequest,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
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
      console.log(mockResponse)
      Cypress.env('PUBLIC_CUSTOMER_FIRSTNAME', mockRequest.firstName)
    })
  })

  before('Shows recently created public cart on the first list', () => {
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
      Cypress.env('customerId', firstItem.customer_id)
      delete firstItem._id
      delete firstItem.customer_id

      const firstname = Cypress.env('PUBLIC_CUSTOMER_FIRSTNAME')
      const expected =
        require('../../fixtures/generators').newlyCreatedPublicCart(firstname)
      expect(firstItem).to.deep.equal(expected)
    })
  })

  before('Should get customer id', () => {
    const customerId = Cypress.env('customerId')
    cy.log(`Customer id: ${customerId}`)
  })

  before('Should able to assign employee', () => {
    const url =
      URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId') + '/assign-to'
    const nik = Cypress.env('emp_nik')
    cy.request({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        nik: nik
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      const data = response.body.data
      expect(data.assignTo.nik, 'Employee NIK should ' + nik).to.equal(nik)
      Cypress.env('CART', response.body.data)
    })
  })

  before('Should able to add 1 product to cart by scan QR', () => {
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
    cy.request({
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
        const data = response.body.data
        expect(data.items.length).to.equal(1)
        expect(data.void_items.length).to.equal(0)
        Cypress.env('CART', data)
      })
      .should((response) => {
        const item = response.body.data.items
        expect(item.length).to.equal(1)
        const ubdTest = new Date(ubd)
        const yearExpiredTest = ubdTest.getFullYear()
        const monthExpiredTest = ubdTest.getMonth() + 1
        // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
        const responseUbd = item[0].ubdDetail[0].ubd
        const responseUbdDate = new Date(responseUbd)
        const yearExpiredResponse = responseUbdDate.getFullYear()
        const monthExpiredResponse = responseUbdDate.getMonth() + 1
        expect(item[0].sku, 'SKU should ' + sku).to.equal(sku)
        expect(item[0].product.name, `Product name should be ${name}`).to.equal(
          name
        )
        expect(
          item[0].qty,
          'Quantity of product ' + sku + ' should ' + qty
        ).to.equal(qty)
        expect(
          item[0].ubdDetail[0].total,
          'Total of product ' + sku + ' and UBD ' + ubd + ' should ' + qty
        ).to.equal(qty)
        expect(yearExpiredResponse).to.equal(yearExpiredTest)
        expect(monthExpiredResponse).to.equal(monthExpiredTest)
        const productPrice = item[0].product.price
        expect(productPrice, `Product price should be ${price}`).to.equal(price)
        Cypress.env(`price_${sku}`, price)
        Cypress.env('totalAmount', price)
        Cypress.env('paymentAmount', price)
        //sub_total
        expect(
          item[0].sub_total,
          'sub_total of product ' + sku + ' should ' + price
        ).to.equal(price)
        expect(
          response.body.data.totalAmount,
          'totalAmount should ' + Cypress.env('totalAmount')
        ).to.equal(Cypress.env('totalAmount'))
        expect(
          response.body.data.paymentAmount,
          'paymentAmount should ' + Cypress.env('paymentAmount')
        ).to.equal(Cypress.env('paymentAmount'))
        const paymentDetails = response.body.data.paymentDetails
        expect(
          paymentDetails[0].total,
          'paymentDetails.Subtotal should ' + Cypress.env('paymentAmount')
        ).to.equal(Cypress.env('paymentAmount'))
        expect(
          paymentDetails[12].total,
          'paymentDetails.Total should ' + Cypress.env('paymentAmount')
        ).to.equal(Cypress.env('paymentAmount'))
      })
  })

  before('Should able to get available payment method', () => {
    const url =
      URL_PAYMENT +
      '/payment-method?amount=' +
      Cypress.env('paymentAmount') +
      '&store=' +
      Cypress.env('storeCode')
    cy.request({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((response) => {
      expect(response.status).to.equal(200)
      const paymentMethodsResponse = response.body.data
      const paymentMethods = paymentMethodsResponse[0].paymentMethods
      expect(paymentMethodsResponse).to.be.an('array')
      expect(paymentMethodsResponse.length).to.be.greaterThan(0)

      const payments = paymentMethodsResponse[0]
      expect(payments).to.haveOwnProperty('paymentMethods')
      expect(payments.paymentMethods).to.be.an('array')
      expect(payments.paymentMethods.length).to.be.greaterThan(0)
    })
  })

  before(`Successfully select "Tunai" as payment method`, () => {
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
      approvalCode: '',
      value: Cypress.env('paymentAmount')
    }
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/update-payment-v2`
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
      expect(
        body.multiPayments[0].name,
        'Payment method selected should Tunai'
      ).to.equal('Tunai')
      Cypress.env('CART', response.body.data)
    })
    // remove payment method
    const urlRemove =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/remove-payment-v2?paymentMethod=18`
    cy.request({
      method: 'PATCH',
      url: urlRemove,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
    })
  })
  // EMPLOYEE TOKEN
  it('Should return error 401 if employee token is not exist', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        channel: 'pos'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 401`).to.equal(401)
    })
  })

  it('Should return error 401 if employee token is invalid', () => {
    const invalidToken =
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2t'
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: invalidToken,
        channel: 'pos'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 401`).to.equal(401)
    })
  })

  it('Should return error 401 if employee token is empty', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: '',
        channel: 'pos'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 401`).to.equal(401)
    })
  })

  it('Should return error 401 if employee token is null', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: null,
        channel: 'pos'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 401`).to.equal(401)
    })
  })

  it('Should return error 401 if employee token is undefined', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: undefined,
        channel: 'pos'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 401`).to.equal(401)
    })
  })
  // CHANNEL
  it('Should return error 403 if channel is not exist', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: Cypress.env('emp_token')
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 403`).to.equal(403)
    })
  })

  it('Should return error 403 if channel is empty', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: Cypress.env('emp_token'),
        channel: ''
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 403`).to.equal(403)
    })
  })

  it('Should return error 403 if channel is null', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: Cypress.env('emp_token'),
        channel: null
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 403`).to.equal(403)
    })
  })

  it('Should return error 403 if channel is undefined', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: {
        Authorization: Cypress.env('emp_token'),
        channel: undefined
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 403`).to.equal(403)
    })
  })
  // CUSTOMER ID
  it(`Should return error 400 if customer ID is not mongoID`, () => {
    const customerId = '123456'
    const url = URL_PRODUCT + `/employee/cart/${customerId}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 400`).to.equal(400)
    })
  })

  it(`Should return error 404 if customer ID is not exist`, () => {
    const url = URL_PRODUCT + `/employee/cart/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 404`).to.equal(404)
    })
  })

  it(`Should return error 400 if customer ID is empty`, () => {
    const customerId = ''
    const url = URL_PRODUCT + `/employee/cart/${customerId}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 400`).to.equal(400)
    })
  })

  it(`Should return error 400 if customer ID is invalid`, () => {
    const customerId = 'aaaaaaaaaaaaaaaaaaa'
    const url = URL_PRODUCT + `/employee/cart/${customerId}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 400`).to.equal(400)
    })
  })

  it(`Should return error 400 if customer ID is null`, () => {
    const customerId = null
    const url = URL_PRODUCT + `/employee/cart/${customerId}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 400`).to.equal(400)
    })
  })

  it(`Should return error 400 if customer ID is undefined`, () => {
    const customerId = undefined
    const url = URL_PRODUCT + `/employee/cart/${customerId}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, `status should be 400`).to.equal(400)
    })
  })
})

describe('Validate Purchase', () => {
  it('Successfully validates pre-order informations', () => {
    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
    })
  })

  after('Delete cart', () => {
    const url = URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId')
    cy.request({
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
