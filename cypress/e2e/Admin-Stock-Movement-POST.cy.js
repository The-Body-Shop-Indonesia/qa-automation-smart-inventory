const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

const url = URL_PRODUCT + '/admin/stock-movement'
const headers = { Authorization: tokenAdmin }

describe('API Test - Stock Movement', () => {
    it('Successfully login', () => {
        const url = URL_USER + "/admin/login"
        cy.api({
            method: "POST",
            url,
            body: {
            "username": "admin-tbs",
            "password": "TBSIcms@Desember2022"
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
            // channel: "cms"
            })
        })
                    })
    
    it('Should NOT be able to access the API with invalid token', () => {
        // const url = URL_USER + "/admin/login"
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
    // const url = URL_USER + "/admin/login"
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


    it('Should return the correct API', () => {
        // const url = URL_PRODUCT + "/admin/stock-movement"
        cy.api({
        method: 'POST',
        url,
        headers: Cypress.env("REQUEST_HEADERS"),

        body:   {
            "sku": "126000992",
            "name": "White Musk Perfume Oil 8.5ml",
            "ubd": "2024-11-04",
            "qty": 3,
            "from": "14036",
            "to": "PUBLIC",
            "by": "14036",
            "notes": "testing",
            "event": "transit",
            "orderNumber": "14036QA24",
            "siteDescription": "string"
              }
    }).then((response) => {
      // Validasi respons API
      expect(response.status).to.eq(201); // Pastikan status kode 201 (Created)

      // Validasi struktur respons yang benar
      const body = response.body;
      expect(body).to.have.property('statusCode'); // Sesuaikan dengan struktur yang benar
      expect(body).to.have.property('message');
      expect(body).to.have.property('data');

      // Validasi properti 'data' lebih detail jika diperlukan
      const data = body.data;
      expect(data).to.have.property('sku', '126000992');
      expect(data).to.have.property('name', 'White Musk Perfume Oil 8.5ml');
    //   expect(data).to.have.property('qty', 2);
    //   expect(data).to.have.property('event', 'transit');
            });
        });
});