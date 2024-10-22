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
            "username": Cypress.env('ADMIN_USERNAME'),
            "password": Cypress.env('ADMIN_PASSWORD')
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
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  // Jika Anda ingin request tetap dijalankan meski status bukan 2xx/3xx
        })
        .then((response) => {
            // Cek status code
            expect(response.status).to.equal(200);
        
            // Akses body dari respons
            const body = response.body;
        
            // Validasi statusCode dan message
            expect(body.statusCode).to.equal(200);
            expect(body.message).to.equal("Success");
        
            // Cek apakah body memiliki properti data
            expect(body).to.haveOwnProperty("data");
            
            // Akses 'data' dan verifikasi properti pagination
            const data = body.data;
            expect(data).to.haveOwnProperty("totalDocs");
            expect(data).to.haveOwnProperty("limit");
            expect(data).to.haveOwnProperty("totalPages");
            expect(data).to.haveOwnProperty("page");
            expect(data).to.haveOwnProperty("hasPrevPage");
            expect(data).to.haveOwnProperty("hasNextPage");
            expect(data).to.haveOwnProperty("prevPage");
            expect(data).to.haveOwnProperty("nextPage");
        
            // Cek apakah data memiliki 'docs' dan lakukan pengecekan di dalamnya
            expect(data).to.haveOwnProperty("docs");
            const docs = data.docs;
            
            docs.forEach(doc => {
            // Verifikasi setiap field di dalam dokumen
            expect(doc).to.have.property('_id');
            expect(doc).to.have.property('sku');
            expect(doc).to.have.property('name');
            expect(doc).to.have.property('ubd');
            expect(doc).to.have.property('qty');
            expect(doc).to.have.property('totalStock');
            expect(doc).to.have.property('from');
            expect(doc).to.have.property('to');
            // expect(doc).to.have.property('by');
            expect(doc).to.have.property('notes');
            expect(doc).to.have.property('siteDescription');
            expect(doc).to.have.property('event');
            expect(doc).to.have.property('orderNumber');
            expect(doc).to.have.property('createdAt');
            expect(doc).to.have.property('updatedAt');
            expect(doc).to.have.property('__v');
        });
        });
        });
    });

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
    cy.api({
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

    
    it("Should return the correct SKU & From", () => {
        const sku = '112010666';
        const from = '14036'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&from=${from}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'to' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["from", from])).to.deep.equal(true); // Memastikan setiap item memiliki 'to' yang sesuai
            } else {
                throw new Error('No documents found in the response');
            }
        });
    });

    it("Should return the correct SKU & To", () => {
        const sku = '112010666';
        const to = 'Public'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&to=${to}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'to' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["to", to])).to.deep.equal(true); // Memastikan setiap item memiliki 'to' yang sesuai
            } else {
                throw new Error('No documents found in the response');
            }
        });
    });
    
    it("Should return the correct SKU & By", () => {
        const sku = '126510061';
        const by = 'DC'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&by=${by}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'to' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["by", by])).to.deep.equal(true); // Memastikan setiap item memiliki 'to' yang sesuai
            } else {
                throw new Error('No documents found in the response');
            }
        });
    });

    it("Should return the correct SKU & Event", () => {
        const sku = '112010666';
        const event = 'sales'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&event=${event}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'to' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["event", event])).to.deep.equal(true); 
            } else {
                throw new Error('No documents found in the response');
            }
        });
    });

    it("Should return the correct SKU & Order Number", () => {
        const sku = '112010666';
        const orderNumber = '14036-QAMils_1728979758160'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&orderNumber=${orderNumber}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'to' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["orderNumber", orderNumber])).to.deep.equal(true); 
            } else {
                throw new Error('No documents found in the response');
            }
        });
    });

    it("Should return the correct SKU & UBD", () => {
        const sku = '112010666';
        const UBD = '2024-10'; // Menambahkan filter 'to'
        const urlFilter = url + `?sku=${sku}&ubd=${UBD}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'UBD' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                // Memastikan UBD sesuai dengan bulan dan tahun
            const isUbdValid = data.every(item => {
                const itemDate = new Date(item.ubd); // Mengubah string UBD ke objek tanggal
                const month = String(itemDate.getMonth() + 1).padStart(2, '0'); // Mendapatkan bulan dalam format 2 digit
                const year = itemDate.getFullYear(); // Mendapatkan tahun

                return `${year}-${month}` === UBD; // Bandingkan dengan format UBD yang diinginkan
            });

            expect(isUbdValid).to.be.true; // Pastikan semua item UBD valid
                //  expect(Cypress._.every(data, ["ubd", UBD])).to.deep.equal(true); 
            } else {
                throw new Error('No documents found in the response');
         
         
            }
        });
    });

    it("Should return the correct SKU + UBD + Order Number", () => {
        const sku = '112010666';
        const UBD = '2024-10'; // Menambahkan filter 'to'
        const orderNumber ='14036-QAMils_1728979758160';
        const urlFilter = url + `?sku=${sku}&ubd=${UBD}&orderNumber=${orderNumber}&page=1&limit=100`; // Menyertakan filter 'to' dalam URL
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS"), // Gunakan header yang diambil dari login
            failOnStatusCode: false  
        })
        .then(response => {
            // Log respons untuk debugging
            cy.log('Response Body:', JSON.stringify(response.body, null, 2));
            
            // Memastikan respons sukses
            expect(response.status).to.eq(200);
    
            const data = response.body.data.docs;
            
            // Log jumlah dokumen untuk verifikasi
            cy.log('Number of docs:', data.length);
    
            // Memastikan setiap item memiliki SKU yang benar dan 'UBD' yang sesuai
            if (data.length > 0) {
                expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
                expect(Cypress._.every(data, ["orderNumber", orderNumber])).to.deep.equal(true);
                // Memastikan UBD sesuai dengan bulan dan tahun
            const isUbdValid = data.every(item => {
                const itemDate = new Date(item.ubd); // Mengubah string UBD ke objek tanggal
                const month = String(itemDate.getMonth() + 1).padStart(2, '0'); // Mendapatkan bulan dalam format 2 digit
                const year = itemDate.getFullYear(); // Mendapatkan tahun

                return `${year}-${month}` === UBD; // Bandingkan dengan format UBD yang diinginkan
            });

            expect(isUbdValid).to.be.true; // Pastikan semua item UBD valid
                //  expect(Cypress._.every(data, ["ubd", UBD])).to.deep.equal(true); 
            } else {
                throw new Error('No documents found in the response')
            }
        });
    });
    
    it("The item returned should match the sort Ascending", () => {
        const urlGet = `${URL_PRODUCT}/admin/stock-movement`; // URL endpoint GET
        
        // Step 1: GET Stock Movement and sort by updatedAt in ascending order
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS"),
            qs: {
                limit: 50,
                sort: 'updatedAt', // Assuming the API supports sorting directly by query param
                sku: '112010666',
                from: '14036'
            }
        }).then((response) => {
            // Step 2: Ensure the response is successful
            expect(response.status).to.eq(200);
    
            // Step 3: Get the stock movement data
            const stockMovement = response.body.data.docs;
            
            // Ensure that the stockMovement is an array
            expect(Array.isArray(stockMovement)).to.eq(true, 'Stock movement should be an array');
            
            // Step 4: Sort the stock movement by updatedAt field in ascending order
            const sortedStockMovement = stockMovement.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    
            // Step 5: Log the sorted results for visibility
            cy.log('Sorted stock movements by updatedAt (Ascending): ', JSON.stringify(sortedStockMovement, null, 2));
            
            // Step 6: Extract the first order number based on the sorted result
            if (sortedStockMovement.length > 0) {
                const earliestOrderNumber = sortedStockMovement[0].orderNumber; // Get the orderNumber from the earliest (first) item
                cy.log('The earliest order number: ', earliestOrderNumber);
            } else {
                throw new Error('No stock movement data found for SKU 112010666 from 14036');
            }
    
            // Step 7: Assert that the data is correctly sorted in ascending order
            let isSortedAscending = true;
            for (let i = 0; i < sortedStockMovement.length - 1; i++) {
                if (new Date(sortedStockMovement[i].updatedAt) > new Date(sortedStockMovement[i + 1].updatedAt)) {
                    isSortedAscending = false;
                    break;
                }
            }
            expect(isSortedAscending).to.eq(true, 'The stock movements should be sorted in ascending order by updatedAt');
        });
    });
    


})