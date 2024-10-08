const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const baseUrl = Cypress.config("baseUrlProduct")
const URL_USER = Cypress.config("baseUrlUser")

const url = baseUrl + '/admin/stock-summary'
const headers = { Authorization: tokenAdmin }

describe('General API Test Group', () => {
  it('Successfully login', () => {
    const url = URL_USER + "/admin/login"
    cy.api({
      method: "POST",
      url,
      body: {
        username: "admin-tbs",
        password: "TBSIcms@Desember2022"
      }
    })
    .should(response => {
      expect(response.status).to.equal(201)
      const body = response.body
      expect(body).to.haveOwnProperty("statusCode")
      expect(body).to.haveOwnProperty("message")
      expect(body).to.haveOwnProperty("data")
      expect(body.statusCode).to.equal(201)
      expect(body.message).to.equal("Success")
      const data = body.data
      expect(data).to.haveOwnProperty("accessToken")
    })
    .then(response => {
      const adminToken = response.body.data.accessToken
      Cypress.env("REQUEST_HEADERS", {
        Authorization: "Bearer " + adminToken,
      })
    })
  })

  it('Should be able to access the API with valid token', () => {
    cy.request({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
    })
  })

  it('Should NOT be able to access the API with invalid token', () => {
    const invalidToken = 'Bearer xyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3Mjc5MjI1NzgsImlhdCI6MTcyNzgzNjE3OCwianRpIjoiMzVjNjNmYzAtNzc4OC00NzQ1LWJkZDgtMTM2NjMwZmUyMTgwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZGNlY2UyNzEtZWJkMi00ZjU2LWE2ZmYtYWVlZjFkMDhiODM4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiIwODBmNmZmYy1kZDA2LTRmYTQtOTBhNy1iM2ZjZmEwNTg0NGMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdGJzLWljYXJ1cyIsInN1cGVyX2FkbWluIiwib2ZmbGluZV9hY2Nlc3MiLCJhcHAtYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjA4MGY2ZmZjLWRkMDYtNGZhNC05MGE3LWIzZmNmYTA1ODQ0YyIsInVpZCI6ImRjZWNlMjcxLWViZDItNGY1Ni1hNmZmLWFlZWYxZDA4YjgzOCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkFkbWluIFRCUyIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluLXRicyIsImdpdmVuX25hbWUiOiJBZG1pbiIsImZhbWlseV9uYW1lIjoiVEJTIiwiZW1haWwiOiJhZG1pbi10YnNAdGhlYm9keXNob3AuY28uaWQifQ.jd6JJqHV0BVOCP7-lEWgfY1shgWuclMK-5YAUym4JTNnNtflHFyk4eVTxBe9OcBsqSgFkGaI3GER7Hi--XikKaT-aMYp4OO8oleiD0lPlwYV_c-GBZ1Ig5_SCsSxr46llVuTZb9tVqNZW33vygcz58IKVi4wn45_aL_lJTZnOM49-rUedA2a650jiipuhHXqeA4Q_9k_73SDBJYozQKSkJwd6noEiBbDyalGf_JYZEBKLL-doWqKxH2-B518lKwVIQ9ii4mglGE7Y2dEOAdG6NDIUMpmxF5SNuDbATYxCFvtvdQxQ2J2zLwxQxSYT1zuuecjN5131XYv9uYFtQkTSw'
    cy.request({
      method: "GET",
      url,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(401)
    })
  })

  it('Should NOT be able to access the API without token', () => {
    const invalidToken = ''
    cy.request({
      method: "GET",
      url,
      headers: { Authorization: invalidToken },
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(401)
    })
  })

  it("Should contain correct API response format", () => {
    cy.request({
      method: "GET",
      url,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      expect(body.statusCode).to.equal(200)
      expect(body.message).to.equal("Success")
      expect(body).to.haveOwnProperty("data")
    })
    .should(response => {
      const data = response.body.data
      expect(data).to.haveOwnProperty("totalDocs")
      expect(data).to.haveOwnProperty("docs")
      expect(data).to.haveOwnProperty("totalPages")
      expect(data).to.haveOwnProperty("limit")
      expect(data).to.haveOwnProperty("page")
      expect(data).to.haveOwnProperty("hasPrevPage")
      expect(data).to.haveOwnProperty("hasNextPage")
      expect(data).to.haveOwnProperty("prevPage")
      expect(data).to.haveOwnProperty("nextPage")
      expect(data).to.haveOwnProperty("pagingCounter")
    })
  })
})

describe("Pagination Test Group", () => {
  it("Should be able to apply pagination", () => {
    const [page, limit] = [1, 10]
    const paginationUrl = url + `?page=${page}&limit=${limit}`
    cy.request({
      method: "GET",
      url: paginationUrl,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data
      expect(data).to.haveOwnProperty("totalDocs")
      expect(data).to.haveOwnProperty("totalPages")
      expect(data).to.haveOwnProperty("limit")
      expect(data).to.haveOwnProperty("page")
      expect(data).to.haveOwnProperty("hasPrevPage")
      expect(data).to.haveOwnProperty("hasNextPage")
      expect(data).to.haveOwnProperty("prevPage")
      expect(data).to.haveOwnProperty("nextPage")
    })
    .should(response => {
      const data = response.body.data
      expect(data.page).to.equal(page)
      expect(data.limit).to.eq(limit)
      expect(data.hasPrevPage).to.equal(false)
      expect(data.prevPage).to.equal(null)
    })
  })

  it("The item returned should match the limit set", () => {
    const page1 = 1
    const limit1 = 1
    cy.request({
      method: "GET",
      url: url + `?page=${page1}&limit=${limit1}`,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data
      expect(data.page).to.equal(page1)
      expect(data.limit).to.eq(limit1)
      expect(data.hasPrevPage).to.equal(false)
      expect(data.prevPage).to.equal(null)
      expect(data.docs.length).to.equal(limit1)
    })

    const page2 = 1
    const limit2 = 2
    cy.request({
      method: "GET",
      url: url + `?page=${page2}&limit=${limit2}`,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data
      expect(data.page).to.equal(page2)
      expect(data.limit).to.eq(limit2)
      expect(data.hasPrevPage).to.equal(false)
      expect(data.prevPage).to.equal(null)
      expect(data.docs.length).to.equal(limit2)
    })
  })
})

describe("Filter Test Group", () => {
  it("Should return the correct SKU", () => {
    const sku = '112010666'
    const urlFilter = url + `?sku=${sku}&page=1&limit=100`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data.docs
      expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
    })
  })

  //sans
  it("Should NOT return non exist SKU", () => {
    const sku = '222010773'
    const urlFilter = url + `?sku=${sku}&page=1&limit=100`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const data = response.body.data
      const dataDocs = response.body.data.docs
      expect(dataDocs.docs).to.equal()
      expect(data.totalDocs).to.equal(0)
    })
  })

  it("Should return the correct Store Code", () => {
    const storeCode = '14036'
    const urlFilter = url + `?storeCode=${storeCode}&page=1&limit=10`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data.docs
      expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
    })
  })

  //sans
  it("Should NOT return non exist Store Code", () => {
    const storeCode = '11444'
    const urlFilter = url + `?storeCode=${storeCode}&page=1&limit=10`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data.docs
      //expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
    })
  })

  it("Should return the correct UBD", () => {
    const ubd = '2024-10-01'
    const urlFilter = url + `?ubd=${ubd}&page=1&limit=100`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data.docs
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1

      const matchingFunction = check => {
        const ubdResponse = new Date(check.ubd)
        const yearExpiredResponse = ubdResponse.getFullYear()
        const monthExpiredResponse = ubdResponse.getMonth() + 1

        const yearIsMatch = yearExpiredResponse === yearExpiredTest
        const monthIsMatch = monthExpiredResponse === monthExpiredTest
        return yearIsMatch && monthIsMatch
      }

      expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
    })
  })

  //sans
  it("Should return UBD null", () => {
    const ubd = null
    const urlFilter = url + `?ubd=${ubd}&page=1&limit=100`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS"),
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(200)
      const body = response.body
      const data = response.body.data.docs
      expect(body.statusCode).to.equal(200)
      // const data = response.body.data
      // expect(response.status).to.equal(400)
      expect(Cypress._.every(data, ubd)).to.deep.equal(ubd)
    })
  })

  //sans
  it("Should NOT return the incorrect UBD format", () => {
    const ubd = '20230901'
    const urlFilter = url + `?ubd=${ubd}&page=1&limit=100`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS"),
      failOnStatusCode: false
    })
    .should(response => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body.statusCode).to.equal(400)
      expect(body.message[0]).to.equal("ubd must match /^(1[0-9]{3}|2[0-9]{3})-(0[0-9]|1[0-2])-([0-2][0-9]|3[0-1])$/ regular expression")
    })
  })

  //sans
  it("Should return the correct result filtered by SKU + UBD + Store Code", () => {
    const storeCode = '14036'
    const ubd = '2024-10-02'
    const sku = '112010666'
    const urlFilter = url + `?page=1&limit=10&sku=${sku}&storeCode=${storeCode}&ubd=${ubd}`
    cy.request({
      method: "GET",
      url: urlFilter,
      headers: Cypress.env("REQUEST_HEADERS")
    })
    .should(response => {
      const data = response.body.data.docs
      const ubdTest = new Date(ubd)
      const yearExpiredTest = ubdTest.getFullYear()
      const monthExpiredTest = ubdTest.getMonth() + 1

      const matchingFunction = check => {
        const ubdResponse = new Date(check.ubd)
        const yearExpiredResponse = ubdResponse.getFullYear()
        const monthExpiredResponse = ubdResponse.getMonth() + 1

        const yearIsMatch = yearExpiredResponse === yearExpiredTest
        const monthIsMatch = monthExpiredResponse === monthExpiredTest
        return yearIsMatch && monthIsMatch
      }
      expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true)
      expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true)
      expect(Cypress._.every(data, ["storeCode", sku])).to.deep.equal(true)

    }) //totalDocs 1, isi array 1
  })
})