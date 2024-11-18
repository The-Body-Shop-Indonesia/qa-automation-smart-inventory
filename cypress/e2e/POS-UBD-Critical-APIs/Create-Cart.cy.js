const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('General API Test Group Create Cart', function () {
  before(() => {
    const url = URL_USER + '/employee/login'
    const pin_emp = Cypress.env('PIN_BXC')
    const store_code = Cypress.env('STORE_CODE_BXC')
    const nik_employee = Cypress.env('NIK_BXC')

    cy.request({
      method: 'POST',
      url,
      body: {
        nik: nik_employee,
        storeCode: store_code,
        pin: pin_emp
      }
    })
      .should((response) => {
        expect(response.status, 'Response status should be 201').to.equal(201)
        const body = response.body
        expect(body).to.haveOwnProperty('statusCode')
        expect(body).to.haveOwnProperty('message')
        expect(body).to.haveOwnProperty('data')
        expect(body.statusCode, 'Status Code should be 201').to.equal(201)
        expect(body.message, 'Message should be Success').to.equal('Success')
        const data = body.data
        expect(data).to.haveOwnProperty('accessToken')
      })
      .then((response) => {
        const employeeToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + employeeToken,
          channel: 'pos'
        })
        Cypress.env('EMP_TOKEN', employeeToken)
      })
  })

  before(() => {
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

  before(() => {
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

  before(() => {
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

  it('Should return error if request invalid token', () => {
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const invalidToken =
      'Bearer xyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3Mjc5MjI1NzgsImlhdCI6MTcyNzgzNjE3OCwianRpIjoiMzVjNjNmYzAtNzc4OC00NzQ1LWJkZDgtMTM2NjMwZmUyMTgwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZGNlY2UyNzEtZWJkMi00ZjU2LWE2ZmYtYWVlZjFkMDhiODM4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiIwODBmNmZmYy1kZDA2LTRmYTQtOTBhNy1iM2ZjZmEwNTg0NGMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdGJzLWljYXJ1cyIsInN1cGVyX2FkbWluIiwib2ZmbGluZV9hY2Nlc3MiLCJhcHAtYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjA4MGY2ZmZjLWRkMDYtNGZhNC05MGE3LWIzZmNmYTA1ODQ0YyIsInVpZCI6ImRjZWNlMjcxLWViZDItNGY1Ni1hNmZmLWFlZWYxZDA4YjgzOCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkFkbWluIFRCUyIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluLXRicyIsImdpdmVuX25hbWUiOiJBZG1pbiIsImZhbWlseV9uYW1lIjoiVEJTIiwiZW1haWwiOiJhZG1pbi10YnNAdGhlYm9keXNob3AuY28uaWQifQ.jd6JJqHV0BVOCP7-lEWgfY1shgWuclMK-5YAUym4JTNnNtflHFyk4eVTxBe9OcBsqSgFkGaI3GER7Hi--XikKaT-aMYp4OO8oleiD0lPlwYV_c-GBZ1Ig5_SCsSxr46llVuTZb9tVqNZW33vygcz58IKVi4wn45_aL_lJTZnOM49-rUedA2a650jiipuhHXqeA4Q_9k_73SDBJYozQKSkJwd6noEiBbDyalGf_JYZEBKLL-doWqKxH2-B518lKwVIQ9ii4mglGE7Y2dEOAdG6NDIUMpmxF5SNuDbATYxCFvtvdQxQ2J2zLwxQxSYT1zuuecjN5131XYv9uYFtQkTSw'
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 401').to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if request token is empty', () => {
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const invalidToken = ''
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 401').to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if request token is undefined', () => {
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const invalidToken = undefined
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 401').to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if request token is null', () => {
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const invalidToken = null
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 401').to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if channel is empty', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    const invalidChannel = ""
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: Cypress.env('EMP_TOKEN') ,channel: invalidChannel },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if channel is null', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    const invalidChannel = null
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: Cypress.env('EMP_TOKEN') ,channel: invalidChannel },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })

  it('Should return error if channel is undefined', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    const invalidChannel = undefined
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: { Authorization: Cypress.env('EMP_TOKEN') ,channel: invalidChannel },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 401').to.equal(401)
      expect(body.message, 'Message should be Unauthorized').to.equal(
        'Unauthorized'
      )
    })
  })
})

describe('API Create Cart PUBLIC section', function () {
  it('Should return error if name is empty', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: {
        isGuest: true,
        firstName: '',
        lastName: '',
        cardNumber: '',
        nik: '',
        familyNumber: '',
        isFamily: false,
        customerGroup: '',
        image: '',
        isScanner: false,
        isLapsed: true,
        isReactivated: true,
        isIcarusAppUser: true,
        autoEnroll: true,
        autoEnrollFrom: 'string'
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode, 'Status code should be 400').to.equal(400)
      expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
    })
  })
  
  it('Should return error if name is undefined', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    const first_name = undefined
    cy.api({
      method: 'POST',
      url,
      body: {
        isGuest: true,
        firstName: first_name,
        lastName: '',
        cardNumber: '',
        nik: '',
        familyNumber: '',
        isFamily: false,
        customerGroup: '',
        image: '',
        isScanner: false,
        isLapsed: true,
        isReactivated: true,
        isIcarusAppUser: true,
        autoEnroll: true,
        autoEnrollFrom: 'string'
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode, 'Status code should be 400').to.equal(400)
      expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
    })
  })

  it('Should return error if name is null', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    const first_name = undefined
    cy.api({
      method: 'POST',
      url,
      body: {
        isGuest: true,
        firstName: null,
        lastName: '',
        cardNumber: '',
        nik: '',
        familyNumber: '',
        isFamily: false,
        customerGroup: '',
        image: '',
        isScanner: false,
        isLapsed: true,
        isReactivated: true,
        isIcarusAppUser: true,
        autoEnroll: true,
        autoEnrollFrom: 'string'
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode, 'Status code should be 400').to.equal(400)
      expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
    })
  })

  it('Should success make public cart', () => {
    const { request: mockRequest, response: mockResponse } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status, 'Response code should be 201').to.equal(201)
      const data = response.body.data
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
      //expect(data).to.haveOwnProperty('total_redemption_point')
      expect(data).to.haveOwnProperty('createdAt')
      expect(data).to.haveOwnProperty('updatedAt')
      expect(data).to.haveOwnProperty('__v')

      const customer_id = response.body.data.customer.id
      Cypress.env('CUSTOMER_PUBLIC_ID', customer_id)

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
    })
  })

  after(() => {
    const url =
      URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_PUBLIC_ID')}`
    cy.api({
      method: 'DELETE',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      expect(body.statusCode, 'Response code should be 200').to.equal(200)
      expect(body.message, 'Message should be Success').to.equal('Success')
      expect(body.data, 'Data should be Cart deleted').to.equal('Cart deleted')
    })
  })
})

describe('API Create Cart MEMBER section', function () {
  it('Should return error if name and cardNumber are empty', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: {
        isGuest: false,
        firstName: '',
        lastName: '',
        cardNumber: '',
        nik: '',
        familyNumber: '',
        isFamily: false,
        customerGroup: '',
        image: '',
        isScanner: false,
        isLapsed: true,
        isReactivated: true,
        isIcarusAppUser: true,
        autoEnroll: true,
        autoEnrollFrom: 'string'
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 400').to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode, 'Status code should be 400').to.equal(400)
      expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
    })
  })
  
  // berhasil walopun pake card number asal (?)
  // it('Should return error if cardNumber invalid', () => {
  //   const card_number = Cypress.env('CARD_NUMBER')
  //   const invalidCardNumber = '50000238191000000'
  //   const url_cus =
  //     URL_USER + '/employee/detail-member?cardNumber=' + card_number
  //   const url = URL_PRODUCT + '/employee/cart/create'

  //   cy.api({
  //     method: 'POST',
  //     url: url_cus,
  //     headers: Cypress.env('REQUEST_HEADERS')
  //   }).then((cust_response) => {
  //     const first_name = cust_response.body.data.firstName
  //     const last_name = cust_response.body.data.lastName
  //     const currentTier = cust_response.body.data.currentTier.code
  //     const currentTierImg = cust_response.body.data.currentTier.image

  //     Cypress.env('FIRST_NAME', first_name)
  //     Cypress.env('LAST_NAME', last_name)
  //     Cypress.env('CUST_TIER', currentTier)
  //     Cypress.env('CUST_IMG', currentTierImg)

  //     cy.api({
  //       method: 'POST',
  //       url,
  //       headers: Cypress.env('REQUEST_HEADERS'),
  //       body: {
  //         isGuest: false,
  //         firstName: Cypress.env('FIRST_NAME'),
  //         lastName: Cypress.env('LAST_NAME'),
  //         cardNumber: invalidCardNumber,
  //         nik: '',
  //         familyNumber: '',
  //         isFamily: false,
  //         customerGroup: Cypress.env('CUST_TIER'),
  //         image: Cypress.env('CUST_IMG'),
  //         isScanner: false,
  //         isLapsed: true,
  //         isReactivated: true,
  //         isIcarusAppUser: true,
  //         autoEnroll: true,
  //         autoEnrollFrom: 'string'
  //       }
  //     })
  //       .should((response) => {
  //         expect(response.status, 'Response code should be 201').to.equal(201)
  //         const data = response.body.data
  //       })
  //   })
  // })

  it('Should return error if cardNumber is null', () => {
    const card_number = Cypress.env('CARD_NUMBER')
    const invalidCardNumber = null
    const url_cus =
      URL_USER + '/employee/detail-member?cardNumber=' + card_number
    const url = URL_PRODUCT + '/employee/cart/create'

    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((cust_response) => {
      const first_name = cust_response.body.data.firstName
      const last_name = cust_response.body.data.lastName
      const currentTier = cust_response.body.data.currentTier.code
      const currentTierImg = cust_response.body.data.currentTier.image

      Cypress.env('FIRST_NAME', first_name)
      Cypress.env('LAST_NAME', last_name)
      Cypress.env('CUST_TIER', currentTier)
      Cypress.env('CUST_IMG', currentTierImg)

      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        body: {
          isGuest: false,
          firstName: Cypress.env('FIRST_NAME'),
          lastName: Cypress.env('LAST_NAME'),
          cardNumber: invalidCardNumber,
          nik: '',
          familyNumber: '',
          isFamily: false,
          customerGroup: Cypress.env('CUST_TIER'),
          image: Cypress.env('CUST_IMG'),
          isScanner: false,
          isLapsed: true,
          isReactivated: true,
          isIcarusAppUser: true,
          autoEnroll: true,
          autoEnrollFrom: 'string'
        },
        failOnStatusCode: false
      })
        .should((response) => {
          expect(response.status, 'Response code should be 400').to.equal(400)
          const body = response.body
          expect(body).to.haveOwnProperty('statusCode')
          expect(body).to.haveOwnProperty('message')
          expect(body).to.haveOwnProperty('error')
          expect(body.statusCode, 'Status code should be 400').to.equal(400)
          expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
        })
    })
  })

  it('Should return error if cardNumber is undefined', () => {
    const card_number = Cypress.env('CARD_NUMBER')
    const invalidCardNumber = undefined
    const url_cus =
      URL_USER + '/employee/detail-member?cardNumber=' + card_number
    const url = URL_PRODUCT + '/employee/cart/create'

    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((cust_response) => {
      const first_name = cust_response.body.data.firstName
      const last_name = cust_response.body.data.lastName
      const currentTier = cust_response.body.data.currentTier.code
      const currentTierImg = cust_response.body.data.currentTier.image

      Cypress.env('FIRST_NAME', first_name)
      Cypress.env('LAST_NAME', last_name)
      Cypress.env('CUST_TIER', currentTier)
      Cypress.env('CUST_IMG', currentTierImg)

      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        body: {
          isGuest: false,
          firstName: Cypress.env('FIRST_NAME'),
          lastName: Cypress.env('LAST_NAME'),
          cardNumber: invalidCardNumber,
          nik: '',
          familyNumber: '',
          isFamily: false,
          customerGroup: Cypress.env('CUST_TIER'),
          image: Cypress.env('CUST_IMG'),
          isScanner: false,
          isLapsed: true,
          isReactivated: true,
          isIcarusAppUser: true,
          autoEnroll: true,
          autoEnrollFrom: 'string'
        },
        failOnStatusCode: false
      })
        .should((response) => {
          expect(response.status, 'Response code should be 400').to.equal(400)
          const body = response.body
          expect(body).to.haveOwnProperty('statusCode')
          expect(body).to.haveOwnProperty('message')
          expect(body).to.haveOwnProperty('error')
          expect(body.statusCode, 'Status code should be 400').to.equal(400)
          expect(body.error, 'Error message should be Bad Request').to.equal('Bad Request')
        })
    })
  })

  it('Should success make member cart', () => {
    const card_number = Cypress.env('CARD_NUMBER')
    const url_cus =
      URL_USER + '/employee/detail-member?cardNumber=' + card_number
    const url = URL_PRODUCT + '/employee/cart/create'

    cy.api({
      method: 'POST',
      url: url_cus,
      headers: Cypress.env('REQUEST_HEADERS')
    }).then((cust_response) => {
      const first_name = cust_response.body.data.firstName
      const last_name = cust_response.body.data.lastName
      const currentTier = cust_response.body.data.currentTier.code
      const currentTierImg = cust_response.body.data.currentTier.image

      Cypress.env('FIRST_NAME', first_name)
      Cypress.env('LAST_NAME', last_name)
      Cypress.env('CUST_TIER', currentTier)
      Cypress.env('CUST_IMG', currentTierImg)

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
          image: Cypress.env('CUST_IMG'),
          isScanner: false,
          isLapsed: true,
          isReactivated: true,
          isIcarusAppUser: true,
          autoEnroll: true,
          autoEnrollFrom: 'string'
        }
      })
        .should((response) => {
          expect(response.status, 'Response code should be 201').to.equal(201)
          const data = response.body.data

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
          //expect(data).to.haveOwnProperty('total_redemption_point')
          expect(data).to.haveOwnProperty('createdAt')
          expect(data).to.haveOwnProperty('updatedAt')
          expect(data).to.haveOwnProperty('__v')

          expect(
            data.customer.firstName,
            `First name should be ${Cypress.env('FIRST_NAME')}`
          ).to.equal(Cypress.env('FIRST_NAME'))
          expect(
            data.customer.lastName,
            `Last name should be ${Cypress.env('LAST_NAME')}`
          ).to.equal(Cypress.env('LAST_NAME'))
          expect(data.customer.isGuest, 'isGuest should be false').to.equal(
            false
          )
          expect(
            data.customer.cardNumber,
            `Card number should be ${card_number}`
          ).to.equal(card_number)
          expect(
            data.customer.customerGroup,
            `Customer tier should be ${Cypress.env('CUST_TIER')}`
          ).to.equal(Cypress.env('CUST_TIER'))
        })
        .then((response) => {
          Cypress.env('CUST_MEMBER_ID', response.body.data.customer._id)
        })
    })
  })

  after(() => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env('CUST_MEMBER_ID')}`
    cy.api({
      method: 'DELETE',
      url,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      expect(body.statusCode, 'Response code should be 200').to.equal(200)
      expect(body.message, 'Message should be Success').to.equal('Success')
      expect(body.data, 'Data should be Cart deleted').to.equal('Cart deleted')
    })
  })
})

/*

*/
