const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const baseUrl = Cypress.config("baseUrlProduct")
const url = baseUrl + '/stock-summary'
const baseUrlUser = Cypress.config("baseUrlUser")
const urlUser = baseUrlUser + '/admin/login'
var ids = null

describe('General API Test Group', () => {
    it('Login admin', () => {
        cy.api({
            method: "POST",
            url: urlUser,
            // headers,
            body: {
                username: "admin-tbs",
                password: "TBSIcms@Desember2022"
            }
        })
        .then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.statusCode).to.equal(201)
            expect(response.body.data.accessToken).to.not.be.empty
            const tokenAdmin = response.body.data.accessToken
            // const employeeToken = response.body.data.accessToken
            Cypress.env("REQUEST_HEADERS", {
                Authorization: "Bearer " + tokenAdmin
            })
        })

    })

    it('Should be able to access the API with valid token', () => {
        
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
            
        })
        .should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.statusCode).to.equal(200)
            // expect(response.body.data.docs[0]._id).to.equal('66fbbb7b016f96dead2784f8')
            ids = response.body.data.docs[0]._id
            Cypress.env("stockSummaryId", ids)
        })

    })

    it('Should NOT be able to access the API with invalid token', () => {
        const invalidToken = 'Bearer xyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJadF9fZHV4a2daTC01Q01lZTFqSjhFS2tWczJRSDJVdE1QNGZ5OENqM1pFIn0.eyJleHAiOjE3Mjc5MjI1NzgsImlhdCI6MTcyNzgzNjE3OCwianRpIjoiMzVjNjNmYzAtNzc4OC00NzQ1LWJkZDgtMTM2NjMwZmUyMTgwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zaXQudGJzZ3JvdXAuY28uaWQvcmVhbG1zL3Ricy1pY2FydXMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZGNlY2UyNzEtZWJkMi00ZjU2LWE2ZmYtYWVlZjFkMDhiODM4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidGJzLWFwcCIsInNlc3Npb25fc3RhdGUiOiIwODBmNmZmYy1kZDA2LTRmYTQtOTBhNy1iM2ZjZmEwNTg0NGMiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtdGJzLWljYXJ1cyIsInN1cGVyX2FkbWluIiwib2ZmbGluZV9hY2Nlc3MiLCJhcHAtYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjA4MGY2ZmZjLWRkMDYtNGZhNC05MGE3LWIzZmNmYTA1ODQ0YyIsInVpZCI6ImRjZWNlMjcxLWViZDItNGY1Ni1hNmZmLWFlZWYxZDA4YjgzOCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkFkbWluIFRCUyIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluLXRicyIsImdpdmVuX25hbWUiOiJBZG1pbiIsImZhbWlseV9uYW1lIjoiVEJTIiwiZW1haWwiOiJhZG1pbi10YnNAdGhlYm9keXNob3AuY28uaWQifQ.jd6JJqHV0BVOCP7-lEWgfY1shgWuclMK-5YAUym4JTNnNtflHFyk4eVTxBe9OcBsqSgFkGaI3GER7Hi--XikKaT-aMYp4OO8oleiD0lPlwYV_c-GBZ1Ig5_SCsSxr46llVuTZb9tVqNZW33vygcz58IKVi4wn45_aL_lJTZnOM49-rUedA2a650jiipuhHXqeA4Q_9k_73SDBJYozQKSkJwd6noEiBbDyalGf_JYZEBKLL-doWqKxH2-B518lKwVIQ9ii4mglGE7Y2dEOAdG6NDIUMpmxF5SNuDbATYxCFvtvdQxQ2J2zLwxQxSYT1zuuecjN5131XYv9uYFtQkTSw'
        cy.api({
            method: "GET",
            url: url + '/'+Cypress.env('stockSummaryId'),
            headers: { Authorization: invalidToken },
            failOnStatusCode: false
        })
        .should(response => {
            expect(response.status).to.equal(401)
        })
    })

    it('Should NOT be able to access the API without token', () => {
        const invalidToken = ''
        cy.api({
            method: "GET",
            url: url + '/'+Cypress.env('stockSummaryId'),
            // headers: { Authorization: invalidToken },
            failOnStatusCode: false
        })
        .should(response => {
            expect(response.status).to.equal(401)
        })
    })

    it('Should get stock summary details', () => {
        cy.api({
            method: "GET",
            url: url + '/'+Cypress.env('stockSummaryId'),
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
            
        })
        .should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.statusCode).to.equal(200)
            expect(response.body.data._id).to.equal(Cypress.env('stockSummaryId'))
        })
        .should(response => {
            const data = response.body.data
            expect(data).to.haveOwnProperty("_id")
            expect(data).to.haveOwnProperty("sku")
            expect(data).to.haveOwnProperty("name")
            expect(data).to.haveOwnProperty("ubd")
            expect(data).to.haveOwnProperty("qty")
            expect(data).to.haveOwnProperty("pending")
            expect(data).to.haveOwnProperty("damaged")
            expect(data).to.haveOwnProperty("storeCode")
            expect(data).to.haveOwnProperty("siteDescription")
            expect(data).to.haveOwnProperty("createdAt")
            expect(data).to.haveOwnProperty("updatedAt")
        })
    })

    it("Should not get data if id is invalid", () => {
        const invalidId = '66fbbb7b016f96dead2784f15'
        cy.api({
            method: "GET",
            url: url + '/'+invalidId,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
            
        })
        .should(response => {
            expect(response.status).to.equal(400)
            expect(response.body.statusCode).to.equal(400)
        })
    })

    it("Should not get data if id is undefined", () => {
        const undefinedId = 'undefined'
        cy.api({
            method: "GET",
            url: url + '/'+undefinedId,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
            
        })
        .should(response => {
            expect(response.status).to.equal(400)
            expect(response.body.statusCode).to.equal(400)
        })
    })

})