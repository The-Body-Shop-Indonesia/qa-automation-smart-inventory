///employee/cart/list/all-v2

const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const url = URL_PRODUCT + '/employee/cart/list/all-v2'

describe('General API Test Cart List', function () {
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

    it('Should be able to access the API with valid token', () => {
        cy.api({
          method: 'GET',
          url,
          headers: Cypress.env('REQUEST_HEADERS'),
          failOnStatusCode: false
        }).should((response) => {
          expect(response.status, 'Response status should be 200').to.equal(200)
          const body = response.body
          expect(body.statusCode, 'Response code should be 200').to.equal(200)
        })
    })

    it('Should return error if request token invalid', () => {
        const invalidToken =
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3MzE2MzkxNjgsImlhdCI6MTczMTU1Mjc2OCwianRpIjoiM2Y3ZGY4ODQtNzg0ZC00MzQ0LWI5MGYtYzczYmU4YTFlMzRjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNWIyOWM0NmUtOTMzNC00MGU2LTljOTQtZTlkOGEyYTUzMDgxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiI5NzgwNzQ2Ni02NzZkLTRjMzgtOTQzZi1lZGUwYzdkZDZmMmEiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImFwcC1zdG9yZS1zdGFmZiIsImFwcC1tYW5hZ2VyIiwiZGVmYXVsdC1yb2xlcy10YnMtaWNhcnVzIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6Ijk3ODA3NDY2LTY3NmQtNGMzOC05NDNmLWVkZTBjN2RkNmYyYSIsInVpZCI6IjViMjljNDZlLTkzMzQtNDBlNi05Yzk0LWU5ZDhhMmE1MzA4MSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlhYWFhYWFhYcml5YW50aSBYWFhYWFhYWHJpeWFudGkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwNTU5MyIsImdpdmVuX25hbWUiOiJYWFhYWFhYWHJpeWFudGkiLCJmYW1pbHlfbmFtZSI6IlhYWFhYWFhYcml5YW50aSJ9.p2bofeI8qjnOLPnWT4P29dVz2XuIcXYTWoAifirAVXeBXbHl8_kspbbl5PKKvW5iirGtupfsZ9WeSOSZcn8wteFGyGpY8Rp7CRvHcL4hjMCD2DgtFkyA_dXRLRBcRmFcYmCdDbaPk_6uXaQnItlvNQhhWa68fHpYoFHXc6cSqphxEtGXGR5i_BE0PjVHLN70HGq-p8FBF1m9fZifGL3jSAxpi657r4zQit8ZoH1t4iVDpl-E1w_OHV83wIEz_qCrAhA1_ILS-OypATskbIRubAt_SNXQTdHnNldop_jeXLQyQZYD6LKsTmeRMPf6I5XCWJWLYiU2RM13dhvmDPU_BC'
        cy.api({
          method: 'GET',
          url,
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
        const invalidToken =
          ''
        cy.api({
          method: 'GET',
          url,
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
        const invalidToken = undefined
        cy.api({
          method: 'GET',
          url,
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
        const invalidToken = null
        cy.api({
          method: 'GET',
          url,
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

    it('Should return error if request channel is null', () => {
        const invalidChannel = null
        cy.api({
          method: 'GET',
          url,
          headers: { Authorization: Cypress.env('EMP_TOKEN'), channel: invalidChannel },
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

    it('Should return error if request channel is empty', () => {
        const invalidChannel = ''
        cy.api({
          method: 'GET',
          url,
          headers: { Authorization: Cypress.env('EMP_TOKEN'), channel: invalidChannel },
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

    it('Should return error if request channel is undefined', () => {
        const invalidChannel = undefined
        cy.api({
          method: 'GET',
          url,
          headers: { Authorization: Cypress.env('EMP_TOKEN'), channel: invalidChannel },
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

    it('Should contain correct API response format', () => {
        cy.api({
          method: 'GET',
          url,
          headers: Cypress.env('REQUEST_HEADERS')
        }).should((response) => {
            expect(response.status).to.equal(200)
            const body = response.body
            expect(body.statusCode).to.equal(200)
            expect(body.message).to.equal('Success')
            expect(body).to.haveOwnProperty('data')
        })
        .should((response) => {
            const data = response.body.data
            expect(data).to.haveOwnProperty('totalDocs')
            expect(data).to.haveOwnProperty('docs')
            expect(data).to.haveOwnProperty('totalPages')
            expect(data).to.haveOwnProperty('limit')
            expect(data).to.haveOwnProperty('page')
            expect(data).to.haveOwnProperty('hasPrevPage')
            expect(data).to.haveOwnProperty('hasNextPage')
            expect(data).to.haveOwnProperty('prevPage')
            expect(data).to.haveOwnProperty('nextPage')
            expect(data).to.haveOwnProperty('pagingCounter')

            const docs = response.body.data.docs
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('_id')),'All data has _id property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('items_count')),'All docs has items_count property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('total_price')),'All docs has total_price property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('customer_name')),'All docs has customer_name property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('customer_nik')),'All docs has customer_nik property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('customer_id')),'All docs has customer_id property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('card_number')),'All docs has card_number property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('cart_type')),'All docs has cart_type property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('isFamily')),'All docs has isFamily property').to.equal(true)
            expect(Cypress._.every(docs, (docs) => docs.hasOwnProperty('isScanner')),'All docs has isScanner property').to.equal(true)
        })
    })
})

describe('Pagination Test Group', () => {
    it('Should be able to apply pagination', () => {
      const [page, limit] = [1, 10]
      const paginationUrl = url + `?page=${page}&size=${limit}`
      cy.request({
        method: 'GET',
        url: paginationUrl,
        headers: Cypress.env('REQUEST_HEADERS')
      })
        .should((response) => {
          const data = response.body.data
          expect(data.docs.length, `Docs length data should be ${limit}`).to.equal(limit)
          expect(data.page).to.equal(page)
          expect(data.limit).to.eq(limit)
          expect(data.hasPrevPage).to.equal(false)
          expect(data.prevPage).to.equal(null)
        })
    })
  
    it('The item returned should match the limit set', () => {
      const page1 = 1
      const limit1 = 1
      cy.request({
        method: 'GET',
        url: url + `?page=${page1}&size=${limit1}`,
        headers: Cypress.env('REQUEST_HEADERS')
      }).should((response) => {
        const data = response.body.data
        expect(data.docs.length, `Docs length data should be ${limit1}`).to.equal(limit1)
        expect(data.page).to.equal(page1)
        expect(data.limit).to.eq(limit1)
        expect(data.hasPrevPage).to.equal(false)
        expect(data.prevPage).to.equal(null)
      })
  
      const page2 = 1
      const limit2 = 2
      cy.api({
        method: 'GET',
        url: url + `?page=${page2}&size=${limit2}`,
        headers: Cypress.env('REQUEST_HEADERS')
      }).should((response) => {
        const data = response.body.data
        expect(data.docs.length, `Docs length data should be ${limit2}`).to.equal(limit2)
        expect(data.page).to.equal(page2)
        expect(data.limit).to.eq(limit2)
        expect(data.hasPrevPage).to.equal(false)
        expect(data.prevPage).to.equal(null)
      }).then((response) => {
        const data = response.body.data
        Cypress.env('TOTAL_DOCS', data.totalDocs)
      })
    })
})

describe('Filter Test Group skipcart', () => {
  //employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=113
  it('Should be able to show only redemption cart', () => {
    const skip_cart = Cypress.env('TOTAL_DOCS')
    const skip_redemption = 0
    const [page, limit] = [1, 3]
    const paginationUrl = url + `?page=${page}&size=${limit}&skipCart=${skip_cart}&skipRedemption=${skip_redemption}`
    cy.api({
      method: 'GET',
      url: paginationUrl,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        const data = response.body.data
        expect(data.docs.length, `Docs length data should be ${limit}`).to.equal(limit)
        expect(data.page).to.equal(page)
        expect(data.limit).to.eq(limit)
        expect(data.hasPrevPage).to.equal(false)
        expect(data.prevPage).to.equal(null)
        expect(
          Cypress._.every(data.docs, ['cart_type', 'redemption']),
          'All data has cart_type redemption'
        ).to.deep.equal(true)
      })
  })

  it('Should be able to show only normal cart', () => {
    const skip_cart = 0
    const skip_redemption = Cypress.env('TOTAL_DOCS')
    const [page, limit] = [1, 3]
    const paginationUrl = url + `?page=${page}&size=${limit}&skipCart=${skip_cart}&skipRedemption=${skip_redemption}`
    cy.api({
      method: 'GET',
      url: paginationUrl,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        const data = response.body.data
        expect(data.docs.length, `Docs length data should be ${limit}`).to.equal(limit)
        expect(data.page).to.equal(page)
        expect(data.limit).to.eq(limit)
        expect(data.hasPrevPage).to.equal(false)
        expect(data.prevPage).to.equal(null)
        expect(
          Cypress._.every(data.docs, ['cart_type', 'normal']),
          'All data has cart_type normal'
        ).to.deep.equal(true)
      })
  })
})