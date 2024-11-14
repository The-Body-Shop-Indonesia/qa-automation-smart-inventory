const URL_USER = Cypress.config('baseUrlUser')
const pin_emp = Cypress.env('PIN_BXC')
const store_code = Cypress.env('STORE_CODE_BXC')
const nik_employee = Cypress.env('NIK_BXC')

describe('API Test Group Staff List', function () {
  before(() => {
    const url = URL_USER + '/employee/login'
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
        const store_name = response.body.data.user.storeName
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + employeeToken,
          channel: 'pos'
        })
        Cypress.env('STORE_NAME', store_name)
      })
  })

  it('Should return error if request invalid token', () => {
    const invalidToken =
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3MzE2MzkxNjgsImlhdCI6MTczMTU1Mjc2OCwianRpIjoiM2Y3ZGY4ODQtNzg0ZC00MzQ0LWI5MGYtYzczYmU4YTFlMzRjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNWIyOWM0NmUtOTMzNC00MGU2LTljOTQtZTlkOGEyYTUzMDgxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiI5NzgwNzQ2Ni02NzZkLTRjMzgtOTQzZi1lZGUwYzdkZDZmMmEiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImFwcC1zdG9yZS1zdGFmZiIsImFwcC1tYW5hZ2VyIiwiZGVmYXVsdC1yb2xlcy10YnMtaWNhcnVzIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6Ijk3ODA3NDY2LTY3NmQtNGMzOC05NDNmLWVkZTBjN2RkNmYyYSIsInVpZCI6IjViMjljNDZlLTkzMzQtNDBlNi05Yzk0LWU5ZDhhMmE1MzA4MSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlhYWFhYWFhYcml5YW50aSBYWFhYWFhYWHJpeWFudGkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwNTU5MyIsImdpdmVuX25hbWUiOiJYWFhYWFhYWHJpeWFudGkiLCJmYW1pbHlfbmFtZSI6IlhYWFhYWFhYcml5YW50aSJ9.p2bofeI8qjnOLPnWT4P29dVz2XuIcXYTWoAifirAVXeBXbHl8_kspbbl5PKKvW5iirGtupfsZ9WeSOSZcn8wteFGyGpY8Rp7CRvHcL4hjMCD2DgtFkyA_dXRLRBcRmFcYmCdDbaPk_6uXaQnItlvNQhhWa68fHpYoFHXc6cSqphxEtGXGR5i_BE0PjVHLN70HGq-p8FBF1m9fZifGL3jSAxpi657r4zQit8ZoH1t4iVDpl-E1w_OHV83wIEz_qCrAhA1_ILS-OypATskbIRubAt_SNXQTdHnNldop_jeXLQyQZYD6LKsTmeRMPf6I5XCWJWLYiU2RM13dhvmDPU_BC'
    const url = URL_USER + '/employee'
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

  it('Should return error if request without token', () => {
    const invalidToken = ''
    const url = URL_USER + '/employee'
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

  it(`Should be able to show staff list on store ${store_code}`, () => {
    const url = URL_USER + '/employee'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status, 'Response status should be 200').to.equal(200)
      const body = response.body
      const data = body.data
      expect(body).to.haveOwnProperty('statusCode')
      expect(body.statusCode, 'Response code should be 200').to.equal(200)
      expect(body.message, 'Message should be Success').to.equal('Success')
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('storeCode')),
        'All data has storeCode property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('storeName')),
        'All data has storeName property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('name')),
        'All data has name property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('nik')),
        'All data has nik property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('role')),
        'All data has role property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, (data) => data.hasOwnProperty('status')),
        'All data has status property'
      ).to.equal(true)
      expect(
        Cypress._.every(data, ['storeCode', store_code]),
        `All data has storeCode ${store_code}`
      ).to.deep.equal(true)
      expect(
        Cypress._.every(data, ['storeName', Cypress.env('STORE_NAME')]),
        `All data has storeCode ${Cypress.env('STORE_NAME')}`
      ).to.deep.equal(true)
    })
  })
})
