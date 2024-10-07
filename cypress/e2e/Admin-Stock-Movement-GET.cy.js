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
    it("Should contain correct API response format", () => {
            cy.request({
                method: "GET",
                url,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
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
            expect(data).to.haveOwnProperty("limit")
            expect(data).to.haveOwnProperty("totalPages")
            expect(data).to.haveOwnProperty("page")
            expect(data).to.haveOwnProperty("hasPrevPage")
            expect(data).to.haveOwnProperty("hasNextPage")
            expect(data).to.haveOwnProperty("prevPage")
            expect(data).to.haveOwnProperty("nextPage")
        })
        })
        })

        describe("Pagination Test Group", () => {
    it("Should be able to apply pagination", () => {
                const [page, limit] = [1, 10]
                const paginationUrl = url + `?page=${page}&limit=${limit}`
                cy.api({
                method: "GET",
                url: paginationUrl,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
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
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
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
            cy.api({
                method: "GET",
                url: url + `?page=${page2}&limit=${limit2}`,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
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
        headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
        failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
    })
        .should(response => {
            const data = response.body.data.docs
            expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
            })
        })
        
    it("Should return the correct from store", () => {
    const fromstore = '14036'
    const urlFilter = url + `?from=${fromstore}&page=1&limit=100`
    cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
            })
            .should(response => {
            const data = response.body.data.docs
            expect(Cypress._.every(data, ["from", fromstore])).to.deep.equal(true);
            })
        })
        
    it("Should return the correct to store", () => {
        const to_store = 'PUBLIC'
        const urlFilter = url + `?to=${to_store}&page=1&limit=100`
        cy.api({
                method: "GET",
                url: urlFilter,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
                })
                .should(response => {
                const data = response.body.data.docs
                expect(Cypress._.every(data, ["to", to_store])).to.deep.equal(true);
                })
                })
        
    it("Should return the correct by", () => {
        const by_store = '14036'
        const urlFilter = url + `?by=${by_store}&page=1&limit=100`
        cy.api({
                method: "GET",
                url: urlFilter,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
                })
                .should(response => {
                const data = response.body.data.docs
                expect(Cypress._.every(data, ["by", by_store])).to.deep.equal(true);
                })
                })

    it("Should return the correct event", () => {
        const event = 'sales'
        const urlFilter = url + `?event=${event}&page=1&limit=100`
        cy.api({
                method: "GET",
                url: urlFilter,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
                })
                .should(response => {
                const data = response.body.data.docs
                expect(Cypress._.every(data, ["event", event])).to.deep.equal(true);
                })
                })

    it("Should return the correct orderNumber", () => {
        const orderNumber = '140363120240213095'
        const urlFilter = url + `?orderNumber=${orderNumber}&page=1&limit=100`
        cy.api({
                method: "GET",
                url: urlFilter,
                headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
                failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
                })
                .should(response => {
                const data = response.body.data.docs
                expect(Cypress._.every(data, ["orderNumber", orderNumber])).to.deep.equal(true);
                })
            })
            
    it("Should return the correct ubd", () => {
        const ubd = '2024-10';
        const urlFilter = url + `?ubd=${ubd}&page=1&limit=100`;
        
        cy.api({
          method: "GET",
          url: urlFilter,
          headers: Cypress.env("REQUEST_HEADERS"),
          failOnStatusCode: false
        })
        .should(response => {
          const data = response.body.data.docs;
          
          // Pengecekan apakah bulan dan tahun dari setiap 'ubd' di data sesuai dengan yang diharapkan
          expect(Cypress._.every(data, (doc) => {
            const ubdValue = doc.ubd ? doc.ubd.slice(0, 7) : '';
            return ubdValue === ubd;
          })).to.deep.equal(true);
        })
    })
             })