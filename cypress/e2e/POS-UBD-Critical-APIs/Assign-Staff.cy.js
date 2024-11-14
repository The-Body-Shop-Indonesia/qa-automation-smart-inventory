const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const nik_employee = Cypress.env('NIK_BXC')

describe('Create cart', function () {
  before(() => {
    const url = URL_USER + '/employee/login'
    const pin_emp = Cypress.env('PIN_BXC')
    const store_code = Cypress.env('STORE_CODE_BXC')

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

  it('Should success make public cart', () => {
    const { request: mockRequest } =
      require('../../fixtures/generators').createPublicCartPayload_14160()
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      body: mockRequest,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        expect(response.status).to.equal(201)
        const data = response.body.data
        expect(data.assignTo).to.equal(null)
      })
      .then((response) => {
        const customer_id = response.body.data.customer.id
        Cypress.env('CUSTOMER_ID', customer_id)
        cy.log(Cypress.env('CUSTOMER_ID'))
      })
  })
})

describe('General API Test Assign Staff to cart', function () {
  it('Should return error if request invalid token', () => {
    const invalidToken =
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3MzE2MzkxNjgsImlhdCI6MTczMTU1Mjc2OCwianRpIjoiM2Y3ZGY4ODQtNzg0ZC00MzQ0LWI5MGYtYzczYmU4YTFlMzRjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNWIyOWM0NmUtOTMzNC00MGU2LTljOTQtZTlkOGEyYTUzMDgxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiI5NzgwNzQ2Ni02NzZkLTRjMzgtOTQzZi1lZGUwYzdkZDZmMmEiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImFwcC1zdG9yZS1zdGFmZiIsImFwcC1tYW5hZ2VyIiwiZGVmYXVsdC1yb2xlcy10YnMtaWNhcnVzIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6Ijk3ODA3NDY2LTY3NmQtNGMzOC05NDNmLWVkZTBjN2RkNmYyYSIsInVpZCI6IjViMjljNDZlLTkzMzQtNDBlNi05Yzk0LWU5ZDhhMmE1MzA4MSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlhYWFhYWFhYcml5YW50aSBYWFhYWFhYWHJpeWFudGkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwNTU5MyIsImdpdmVuX25hbWUiOiJYWFhYWFhYWHJpeWFudGkiLCJmYW1pbHlfbmFtZSI6IlhYWFhYWFhYcml5YW50aSJ9.p2bofeI8qjnOLPnWT4P29dVz2XuIcXYTWoAifirAVXeBXbHl8_kspbbl5PKKvW5iirGtupfsZ9WeSOSZcn8wteFGyGpY8Rp7CRvHcL4hjMCD2DgtFkyA_dXRLRBcRmFcYmCdDbaPk_6uXaQnItlvNQhhWa68fHpYoFHXc6cSqphxEtGXGR5i_BE0PjVHLN70HGq-p8FBF1m9fZifGL3jSAxpi657r4zQit8ZoH1t4iVDpl-E1w_OHV83wIEz_qCrAhA1_ILS-OypATskbIRubAt_SNXQTdHnNldop_jeXLQyQZYD6LKsTmeRMPf6I5XCWJWLYiU2RM13dhvmDPU_BC'
    const cust_id = Cypress.env('CUSTOMER_ID')
    const url = URL_PRODUCT + `/employee/cart/${cust_id}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee
      },
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

  it('Should return error if request without token', () => {
    const invalidToken = ''
    const cust_id = Cypress.env('CUSTOMER_ID')
    const url = URL_PRODUCT + `/employee/cart/${cust_id}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee
      },
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
})

describe('API Test Group Assign Staff to cart', function () {
  it('Should return error if customer ID invalid', () => {
    const invalidCustID = '6735bca5fb1b4f6a5c6645e1'
    const url = URL_PRODUCT + `/employee/cart/${invalidCustID}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 404').to.equal(404)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 404').to.equal(404)
      expect(body.message, 'Message should be Customer not found').to.equal(
        'Customer not found'
      )
    })
  })

  it('Should return error if customer ID is empty', () => {
    const invalidCustID = ''
    const url = URL_PRODUCT + `/employee/cart/${invalidCustID}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 404').to.equal(404)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode, 'Response code should be 404').to.equal(404)
      expect(body.error, 'Error should be Not found').to.equal('Not Found')
    })
  })

  it('Should return error if NIK is invalid', () => {
    const cust_id = Cypress.env('CUSTOMER_ID')
    const invalidNIK = '12345'
    const url = URL_PRODUCT + `/employee/cart/${cust_id}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: invalidNIK
      },
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 400').to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode, 'Response code should be 400').to.equal(400)
      expect(body.message, 'Error should be Failed to get employee').to.equal(
        'Failed to get employee'
      )
    })
  })

  //karena crosstore bisa
  //   it('Should return error if NIK is from another store', () => {
  //     const cust_id = Cypress.env('CUSTOMER_ID')
  //     const invalidNIK = '00012'
  //     const url = URL_PRODUCT + `/employee/cart/${cust_id}/assign-to`
  //     cy.api({
  //       method: 'POST',
  //       url,
  //       body: {
  //         nik: invalidNIK
  //       },
  //       headers: Cypress.env('REQUEST_HEADERS'),
  //       failOnStatusCode: false
  //     }).should((response) => {
  //       expect(response.status, 'Response status should be 400').to.equal(400)
  //       const body = response.body
  //       expect(body).to.haveOwnProperty('statusCode')
  //       expect(body).to.haveOwnProperty('message')
  //       expect(body.statusCode, 'Response code should be 400').to.equal(400)
  //       expect(body.message, 'Error should be Failed to get employee').to.equal(
  //         'Failed to get employee'
  //       )
  //     })
  //   })

  it('Should be able to access the API with valid token', () => {
    const cust_id = Cypress.env('CUSTOMER_ID')
    const url = URL_PRODUCT + `/employee/cart/${cust_id}/assign-to`
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee
      },
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status, 'Response status should be 201').to.equal(201)
      const body = response.body
      expect(body.statusCode, 'Response code should be 201').to.equal(201)
    })
  })

  after(() => {
    const url = URL_PRODUCT + `/employee/cart/${Cypress.env('CUSTOMER_ID')}`
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
  /*
     2. NIK store lain
     3. NIK kosong
     */
})
