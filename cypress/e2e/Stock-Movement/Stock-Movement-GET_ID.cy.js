const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const baseUrl = Cypress.config('baseUrlProduct')
const URL_USER = Cypress.config('baseUrlUser')

const url = baseUrl + '/admin/stock-movement'
const headers = { Authorization: tokenAdmin }

describe('General API Test Group', () => {
  it('Successfully login', () => {
    const url = URL_USER + '/admin/login'
    cy.api({
      method: 'POST',
      url,
      body: {
        username: Cypress.env('ADMIN_USERNAME'),
        password: Cypress.env('ADMIN_PASSWORD')
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
        const adminToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + adminToken
        })
      })
  })

  it('Get data ID', () => {
    const sku = '112010666'
    const urlFilter = url + `?sku=${sku}&page=1&limit=100`
    cy.api({
      method: 'GET',
      url: urlFilter,
      headers: Cypress.env('REQUEST_HEADERS')
    })
      .should((response) => {
        expect(response.status).to.equal(200)
      })
      .then((response) => {
        const ids = response.body.data.docs[0]._id
        Cypress.env('stockMovementID', ids)
      })
  })

  it('Should be able to access the API with valid token', () => {
    const dataId = Cypress.env('stockMovementID')
    const urlStockMovmntID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockMovmntID,
      headers: Cypress.env('REQUEST_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
    })
  })

  it('Should NOT be able to access the API with invalid token', () => {
    const invalidToken =
      'Bearer xyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3Mjc5MjI1NzgsImlhdCI6MTcyNzgzNjE3OCwianRpIjoiMzVjNjNmYzAtNzc4OC00NzQ1LWJkZDgtMTM2NjMwZmUyMTgwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZGNlY2UyNzEtZWJkMi00ZjU2LWE2ZmYtYWVlZjFkMDhiODM4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiIwODBmNmZmYy1kZDA2LTRmYTQtOTBhNy1iM2ZjZmEwNTg0NGMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdGJzLWljYXJ1cyIsInN1cGVyX2FkbWluIiwib2ZmbGluZV9hY2Nlc3MiLCJhcHAtYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjA4MGY2ZmZjLWRkMDYtNGZhNC05MGE3LWIzZmNmYTA1ODQ0YyIsInVpZCI6ImRjZWNlMjcxLWViZDItNGY1Ni1hNmZmLWFlZWYxZDA4YjgzOCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkFkbWluIFRCUyIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluLXRicyIsImdpdmVuX25hbWUiOiJBZG1pbiIsImZhbWlseV9uYW1lIjoiVEJTIiwiZW1haWwiOiJhZG1pbi10YnNAdGhlYm9keXNob3AuY28uaWQifQ.jd6JJqHV0BVOCP7-lEWgfY1shgWuclMK-5YAUym4JTNnNtflHFyk4eVTxBe9OcBsqSgFkGaI3GER7Hi--XikKaT-aMYp4OO8oleiD0lPlwYV_c-GBZ1Ig5_SCsSxr46llVuTZb9tVqNZW33vygcz58IKVi4wn45_aL_lJTZnOM49-rUedA2a650jiipuhHXqeA4Q_9k_73SDBJYozQKSkJwd6noEiBbDyalGf_JYZEBKLL-doWqKxH2-B518lKwVIQ9ii4mglGE7Y2dEOAdG6NDIUMpmxF5SNuDbATYxCFvtvdQxQ2J2zLwxQxSYT1zuuecjN5131XYv9uYFtQkTSw'
    const dataId = Cypress.env('stockMovementID')
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  it('Should NOT be able to access the API without token', () => {
    const invalidToken = ''
    const dataId = Cypress.env('stockMovementID')
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  it('Should contain correct API response format', () => {
    const dataId = Cypress.env('stockMovementID')
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: Cypress.env('REQUEST_HEADERS'),
      qs: {
        limit: 50,
        sort: '-updatedAt',
        sku: '112010666',
        from: 'DC',
        ubd: '2024-12'
      }
    })
      .should((response) => {
        expect(response.status).to.equal(200)
        const body = response.body
        expect(body.statusCode).to.equal(200)
        expect(body.message).to.equal('Success')
        expect(body).to.haveOwnProperty('data')
      })
      .should((response) => {
        const data = response.body.data
        expect(data).to.haveOwnProperty('_id')
        expect(data).to.haveOwnProperty('sku')
        expect(data).to.haveOwnProperty('name')
        expect(data).to.haveOwnProperty('ubd')
        expect(data).to.haveOwnProperty('qty')
        expect(data).to.haveOwnProperty('totalStock')
        expect(data).to.haveOwnProperty('from')
        expect(data).to.haveOwnProperty('to')
        expect(data).to.haveOwnProperty('by')
        expect(data).to.haveOwnProperty('notes')
        expect(data).to.haveOwnProperty('siteDescription')
        expect(data).to.haveOwnProperty('event')
        expect(data).to.haveOwnProperty('orderNumber')
        expect(data).to.haveOwnProperty('createdAt')
        expect(data).to.haveOwnProperty('updatedAt')
      })
  })
})

describe('ID test', () => {
  it('Should show data from ID', () => {
    const dataId = Cypress.env('stockMovementID')
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        id: dataId
      }
    }).should((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      expect(body.statusCode).to.equal(200)
      const data = response.body.data
      expect(data._id).to.equal(dataId)
    })
  })

  it('Should NOT show data from empty ID', () => {
    const dataId = ''
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + dataId
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        id: dataId
      }
    }).should((response) => {
      expect(response.status).to.equal(200)
      const data = response.body.data
      //expect(data._id).to.equal(dataId) should show all data???
    })
  })

  it('Should NOT return non exist ID', () => {
    const id = '66fsss7b016f96leaf2784f4'
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + id
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      const body = response.body
      expect(body.statusCode).to.equal(400)
    })
  })

  it('Should NOT return undefined ID', () => {
    const id = 'undefined'
    const urlStockSumID = baseUrl + '/admin/stock-movement/' + id
    cy.api({
      method: 'GET',
      url: urlStockSumID,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    }).should((response) => {
      const body = response.body
      expect(body.statusCode).to.equal(400)
    })
  })
})
