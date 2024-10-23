const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

const url = URL_PRODUCT + '/admin/stock-movement'
const url2 = URL_PRODUCT + '/admin/stock-summary'
const headers = { Authorization: tokenAdmin }

const sku_sales = '112010666'
const store_code_sales ='14036'
const store_code_adjustment ='14160'
const ubd1 = '2025-10'
const ubd2 = '2026-11'
const sku_adjustment='101050222'
describe(' Stock Movement - Sales', () => {
    it('Successfully login ', () => {
        const url = URL_USER + "/admin/login"
        cy.api({
            method: "POST",
            url,
            body: {
                username: Cypress.env('ADMIN_USERNAME'),
                password: Cypress.env('ADMIN_PASSWORD')
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

        let requestBodySales; // Menyimpan body request POST 
        let postDataSales; // Menyimpan body request POST 
        let Before_latestStock_Movement;
        let Before_latestStock_Summary;
    it('Should return the correct API and Verify correct Stock Movement - Sales', () => {
        const urlGet = `${URL_PRODUCT}/admin/stock-summary`; 
        const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`; 
        const urlPost = `${URL_PRODUCT}/admin/stock-movement`;
    //Before Stock Movement Condition
        cy.api({
                    method: 'GET',
                    url: urlGet2,
                    headers: Cypress.env("REQUEST_HEADERS"),
                    qs: {
                        limit: 10,
                        sort: '-updatedAt',
                        sku: sku_sales,
                        from: store_code_sales,
                        ubd: ubd1
                    }
            }).then((response) => {
                // Pastikan respons sukses
                expect(response.status).to.eq(200);

            // Ambil initialQty dari data respons terbaru
            const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');
        

                // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
            const latestStock = stockMovement
            .filter(item => 
                item.sku === sku_sales && 
                item.from === store_code_sales &&
                new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                new Date(item.ubd).getMonth() + 1 === 10 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
            Before_latestStock_Movement = 0;  // Sekarang Before_latestStock_Summary di-set di sini
            cy.log(`SKU 134070359 at from store 14160 - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: 0`);
            } else {
            Before_latestStock_Movement = latestStock.totalStock;  // Simpan nilai ini di variabel luar
            }

// condition before stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS"),
            qs: {
                limit: 50,
                sku: sku_sales,
                storeCode: store_code_sales,
                ubd: ubd1
            }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);
            // Ambil initialQty dari data respons terbaru
            const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data
    
            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
            // Verifikasi bahwa jumlah dokumen tidak boleh lebih dari 1
            expect(stockSummary.length).to.be.lte(1, 'Jumlah dokumen dalam stock summary tidak boleh lebih dari 1');
    
            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockSummary
        .filter(item => 
            item.sku === sku_sales && 
            item.storeCode === store_code_sales &&
            new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 10 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

            // Jika data tidak ditemukan, log semua stok yang ada
            if (!latestStock) {
                Before_latestStock_Summary = 0;  // Sekarang Before_latestStock_Summary di-set di sini
                cy.log(`SKU ${sku_sales} at from store ${store_code_sales} - Previous totalStock: ${Before_latestStock_Summary}, Current totalStock: 0`);
                } else {
                Before_latestStock_Summary = latestStock.qty;  // Simpan nilai ini di variabel luar
                }

            // Step 2:POST - StockMovement (Create)
            const inputQty = 1;   // Nilai input dari body request
            const dynamicOrderNumber = `14036-QAMils_${Date.now()}`;  // Menggunakan timestamp untuk membuat orderNumber unik
        
            requestBodySales = {
                "sku": sku_sales,  
                "name": "SHEA BODY BUTTER 200ML",  
                "ubd": ubd1,  
                "qty": inputQty, 
                "from": store_code_sales,  
                "to": "Public", 
                "by": store_code_sales,  
                "notes": "testing_Mils",  
                "event": "sales",  
                "orderNumber": dynamicOrderNumber, 
                "siteDescription": "string" 
            };
            cy.api({
            method: 'POST',
            url: urlPost,  // URL untuk POST request
            headers: Cypress.env("REQUEST_HEADERS"),
            body: requestBodySales
        }).then((response) => {
            // Validasi respons API
            expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

            // Validasi struktur respons yang benar
            const body = response.body;
            expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
            expect(body).to.have.property('message');
            expect(body).to.have.property('data');

            // Simpan data POST ke variabel postData
            postDataSales = body.data;

            // Validasi properti 'data' lebih detail jika diperlukan
            expect(postDataSales).to.have.property('sku', sku_sales);
            expect(postDataSales).to.have.property('name', 'SHEA BODY BUTTER 200ML');

            // Step 4: Calculate expectedQty
            const expectedQty = Before_latestStock_Summary - inputQty;  // Mengurangi inputQty dari initialQty

            // expect(data).to.have.property('qty', expectedQty);
            expect(postDataSales).to.have.property('qty', expectedQty);

            
        //condition after stock movement
    cy.api({
        method: 'GET',
        url: urlGet2,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 10,
            sort:'-updatedAt',
            sku: sku_sales,
            from: store_code_sales,
            ubd: ubd1
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);

    // Ambil initialQty dari data respons terbaru
    const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

    // Pastikan stockSummary adalah array
    expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');

        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockMovement
    .filter(item => 
        item.sku === sku_sales && 
        item.from === store_code_sales &&
        new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
        new Date(item.ubd).getMonth() + 1 === 10 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
    cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
    throw new Error (`No stock data found for ${sku_sales} at from store ${store_code_sales} with UBD ${ubd1}`);
    }
  // Validasi data GET dengan data POST
  expect(latestStock.sku, 'SKU').to.eq(requestBodySales.sku);  // Mengambil dari requestBody
  expect(latestStock.name, 'Name SKU').to.eq(requestBodySales.name);  // Mengambil dari requestBody
  // Ambil bulan dan tahun dari latestStock.ubd
  const latestStockDate = new Date(latestStock.ubd);
  const latestStockMovement = `${latestStockDate.getFullYear()}-${String(latestStockDate.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
  expect(latestStockMovement, 'UBD').to.eq(requestBodySales.ubd); 
  expect(latestStock.qty, 'QTY').to.eq(requestBodySales.qty);  
  expect(latestStock.from, 'FROM').to.eq(requestBodySales.from);  
  expect(latestStock.event, 'Event').to.eq(requestBodySales.event);  
  expect(latestStock.orderNumber, 'OrderNumber').to.eq(requestBodySales.orderNumber); 
    
    const After_latestStock_Movement = latestStock.totalStock;  // Ambil nilai qty dari stock movement produk terbaru
            //condition after stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS"),
            qs: {
                limit: 50,
                sku: sku_sales,
                storeCode: store_code_sales,
                ubd: ubd1
            }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);

            // Ambil initialQty dari data respons terbaru
            const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data

            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
            
            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockSummary
        .filter(item => 
            item.sku === sku_sales && 
            item.storeCode === store_code_sales &&
            new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 10 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
            cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
            throw new Error(`No stock data found for ${sku_sales} at ${store_code_sales} with ${ubd1}`);
        }

        const After_latestStock_Summary = latestStock.qty;  // Ambil nilai qty dari sttock summary produk terbaru

        // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
        cy.log('lates totalStock  in stock movement condition before: ', Before_latestStock_Movement);
        cy.log('lates QuantityStock in Summary before stock movement: ', Before_latestStock_Summary);
        cy.log('Input Quantity: ', inputQty);
        cy.log('Expected Quantity: ', expectedQty);
        cy.log('Total Stock Movement [Kondisi setelah Movement]: ', After_latestStock_Movement);
        cy.log('Qty Stock Summary [Kondisi setelah Movement]: ', After_latestStock_Summary);
        // // Step 6: Compare the values
        expect(After_latestStock_Movement).to.eq(Before_latestStock_Summary, 'StockMovement condition after = stok summary condition before');
        expect(After_latestStock_Summary).to.eq(expectedQty, 'StockSummary condition after = expectedQty');

    }); 
        });  
            });
        });
    });
});


describe(' Stock Movement - Adjument In & Out', () => {
let requestBodyAdjustmen_IN; // Menyimpan body request POST 
let postDataAdjustment_IN; // Menyimpan body request POST
it('Should return the correct API and Verify correct Stock Movement - Adjustment-IN', () => {
    const urlGet = `${URL_PRODUCT}/admin/stock-summary`;  // URL endpoint GET
    const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint GET
    const urlPost = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint POST
//Before Stock Movement Condition
    cy.api({
                method: 'GET',
                url: urlGet2,
                headers: Cypress.env("REQUEST_HEADERS"),
                qs: {
                    limit: 50,
                    sort: '-updatedAt',
                    sku: sku_adjustment,
                    from: 'DC',
                    ubd: ubd2
                }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);

        // Ambil initialQty dari data respons terbaru
        const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');
    

            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockMovement
        .filter(item => 
            item.sku === sku_adjustment && 
            item.from === 'DC' &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
        Before_latestStock_Movement = 0;  
        cy.log(`SKU ${sku_adjustment} at from store${store_code_adjustment} - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: 0`);
        } else {
        Before_latestStock_Movement = latestStock.totalStock;  // Simpan nilai ini di variabel luar
        }

// condition before stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 50,
            sku: sku_adjustment,
            storeCode: store_code_adjustment,
            ubd: ubd2
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);
        // Ambil initialQty dari data respons terbaru
        const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
        expect(stockSummary.length).to.be.lte(1, 'Jumlah dokumen dalam stock summary tidak boleh lebih dari 1'); // Verifikasi bahwa jumlah dokumen tidak boleh lebih dari 1
        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockSummary
        .filter(item => 
            item.sku === sku_adjustment && 
            item.storeCode === store_code_adjustment &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        // // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
            Before_latestStock_Summary = 0;  // Sekarang Before_latestStock_Summary di-set di sini
            cy.log(`SKU ${sku_adjustment} at from store ${store_code_adjustment} - Previous totalStock: ${Before_latestStock_Summary}, Current totalStock: 0`);
            } else {
            Before_latestStock_Summary = latestStock.qty;  // Simpan nilai ini di variabel luar
            }
    
        // Step 2:POST - StockMovement (Create)
        const inputQty = 1;   // Nilai input dari body request
        const dynamicOrderNumber = `14036-Adj_IN_${Date.now()}`;  // Menggunakan timestamp untuk membuat orderNumber unik
    
        requestBodyAdjustmen_IN = {
                        "sku": sku_adjustment,  
                        "name": "Camomile Cleansing Butter 20ml", 
                        "ubd": ubd2,  
                        "qty": inputQty,  
                        "from": "DC",  
                        "to": store_code_adjustment,  
                        "by": store_code_adjustment,  
                        "notes": "testing_Mils",  
                        "event": "adjustment-in", 
                        "orderNumber": dynamicOrderNumber,  
                        "siteDescription": "adjustment-in DC test"
                    };
        
        cy.api({
        method: 'POST',
        url: urlPost,  // URL untuk POST request
        headers: Cypress.env("REQUEST_HEADERS"),
        body:  requestBodyAdjustmen_IN
    }).then((response) => {
        // Validasi respons API
        expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

        // Validasi struktur respons yang benar
        const body = response.body;
        expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
        expect(body).to.have.property('message');
        expect(body).to.have.property('data');

        // Simpan data POST ke variabel postData
        postDataAdjustment_IN = body.data;

        // Validasi properti 'data' lebih detail jika diperlukan
        expect(postDataAdjustment_IN).to.have.property('sku', `${sku_adjustment}`);
        expect(postDataAdjustment_IN).to.have.property('name', 'Camomile Cleansing Butter 20ml');

        // Step 4: Calculate expectedQty
        const expectedQty = Before_latestStock_Summary + inputQty;  // Mengurangi inputQty dari initialQty
        expect(postDataAdjustment_IN).to.have.property('qty', expectedQty);

        
    //condition after stock movement
cy.api({
    method: 'GET',
    url: urlGet2,
    headers: Cypress.env("REQUEST_HEADERS"),
    qs: {
        limit: 10,
        sort:'-updatedAt',
        sku: sku_adjustment,
        from: 'DC',
        ubd: ubd2
    }
}).then((response) => {
    // Pastikan respons sukses
    expect(response.status).to.eq(200);

// Ambil initialQty dari data respons terbaru
const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

// Pastikan stockSummary adalah array
expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');

    // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
const latestStock = stockMovement
.filter(item => 
    item.sku === sku_adjustment && 
    item.from === 'DC' &&
    new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
    new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
)
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

// Jika data tidak ditemukan, log semua stok yang ada
if (!latestStock) {
cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
throw new Error(`No stock movement data found for SKU ${sku_adjustment} at from store ${store_code_adjustment} with UBD ${ubd2}`);
}
// Validasi data GET dengan data POST
expect(latestStock.sku, 'SKU').to.eq(requestBodyAdjustmen_IN.sku);  // Mengambil dari requestBody
expect(latestStock.name, 'Name SKU').to.eq(requestBodyAdjustmen_IN.name);  // Mengambil dari requestBody
// Ambil bulan dan tahun dari latestStock.ubd
const latestStockDate = new Date(latestStock.ubd);
const latestStockMovement = `${latestStockDate.getFullYear()}-${String(latestStockDate.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
expect(latestStockMovement, 'UBD').to.eq(requestBodyAdjustmen_IN.ubd); 
expect(latestStock.qty, 'QTY').to.eq(requestBodyAdjustmen_IN.qty);  
expect(latestStock.from, 'FROM').to.eq(requestBodyAdjustmen_IN.from);  
expect(latestStock.event, 'Event').to.eq(requestBodyAdjustmen_IN.event);  
expect(latestStock.orderNumber, 'OrderNumber').to.eq(requestBodyAdjustmen_IN.orderNumber); 

const After_latestStock_Movement = latestStock.totalStock;  // Ambil nilai qty dari stock movement produk terbaru
//         // cy.log('Stock Movement Before Condition: ', After_latestStock_Movement);

        //condition after stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 50,
            sku: sku_adjustment,
            storeCode: store_code_adjustment,
            ubd: ubd2
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);

        // Ambil initialQty dari data respons terbaru
        const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
        
        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockSummary
    .filter(item => 
        item.sku === sku_adjustment && 
        item.storeCode === store_code_adjustment &&
        new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
        new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
    )
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
        cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
        throw new Error(`No stock summary data found for SKU ${sku_adjustment} at store ${store_code_adjustment} with UBD ${ubd2}`);
    }

    const After_latestStock_Summary = latestStock.qty;  // Ambil nilai qty dari sttock summary produk terbaru

    // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
    cy.log('lates totalStock  in stock movement condition before: ', Before_latestStock_Movement);
    cy.log('lates QuantityStock in Summary before stock movement: ', Before_latestStock_Summary);
    cy.log('Input Quantity: ', inputQty);
    cy.log('Expected Quantity: ', expectedQty);
    cy.log('lates totalStock  in stock movement condition after: ', After_latestStock_Movement);
    cy.log('lates QuantityStock in Summary after stock movement: ', After_latestStock_Summary);
    // // Step 6: Compare the values
    expect(After_latestStock_Movement).to.eq(Before_latestStock_Summary, 'StockMovement condition after = stok summary condition before');
    expect(After_latestStock_Summary).to.eq(expectedQty, 'StockSummary condition after = expectedQty');

}); 
    });  
        });
    });
});
});

let requestBodyAdjustmen_out; // Menyimpan body request POST 
let postDataAdjustment_out; // Menyimpan body request POST 
it('Should return the correct API and Verify correct Stock Movement - Adjustment-Out', () => {
    const urlGet = `${URL_PRODUCT}/admin/stock-summary`;  // URL endpoint GET
    const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint GET
    const urlPost = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint POST
//Before Stock Movement Condition
    cy.api({
                method: 'GET',
                url: urlGet2,
                headers: Cypress.env("REQUEST_HEADERS"),
                qs: {
                    limit: 50,
                    sort: '-updatedAt',
                    sku: sku_adjustment,
                    from: 'DC',
                    ubd: ubd2
                }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);

        // Ambil initialQty dari data respons terbaru
        const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');
    

            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockMovement
        .filter(item => 
            item.sku === sku_adjustment && 
            item.from === 'DC' &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
        Before_latestStock_Movement = 0;  
        cy.log(`SKU ${sku_adjustment} at from store${store_code_adjustment} - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: 0`);
        } else {
        Before_latestStock_Movement = latestStock.totalStock;  // Simpan nilai ini di variabel luar
        }

// condition before stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 50,
            sku: sku_adjustment,
            storeCode: store_code_adjustment,
            ubd: ubd2
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);
        // Ambil initialQty dari data respons terbaru
        const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
        expect(stockSummary.length).to.be.lte(1, 'Jumlah dokumen dalam stock summary tidak boleh lebih dari 1'); // Verifikasi bahwa jumlah dokumen tidak boleh lebih dari 1

        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockSummary
    .filter(item => 
        item.sku === sku_adjustment && 
        item.storeCode === store_code_adjustment &&
        new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
        new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
        Before_latestStock_Summary = 0;  // Sekarang Before_latestStock_Summary di-set di sini
        cy.log(`SKU ${sku_adjustment} at from store ${store_code_adjustment} - Previous totalStock: ${Before_latestStock_Summary}, Current totalStock: 0`);
        } else {
        Before_latestStock_Summary = latestStock.qty;  // Simpan nilai ini di variabel luar
        }

        // Step 2:POST - StockMovement (Create)
        const inputQty = 1;   // Nilai input dari body request
        const dynamicOrderNumber = `14036-Adj_Out_${Date.now()}`;  // Menggunakan timestamp untuk membuat orderNumber unik
    
        requestBodyAdjustmen_out = {
                        "sku": sku_adjustment,  
                        "name": "Camomile Cleansing Butter 20ml",  
                        "ubd": ubd2,  
                        "qty": inputQty,  
                        "from": "DC", 
                        "to": store_code_adjustment,  
                        "by": store_code_adjustment,
                        "notes": "testing_Mils",
                        "event": "adjustment-out",
                        "orderNumber": dynamicOrderNumber,  
                        "siteDescription": "adjustment-out DC test" 
                    };
        
        cy.api({
        method: 'POST',
        url: urlPost,  // URL untuk POST request
        headers: Cypress.env("REQUEST_HEADERS"),
        body:  requestBodyAdjustmen_out
    }).then((response) => {
        // Validasi respons API
        expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

        // Validasi struktur respons yang benar
        const body = response.body;
        expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
        expect(body).to.have.property('message');
        expect(body).to.have.property('data');

        // Simpan data POST ke variabel postData
        postDataAdjustment_out = body.data;

        // Validasi properti 'data' lebih detail jika diperlukan
        expect(postDataAdjustment_IN).to.have.property('sku', `${sku_adjustment}`);
        expect(postDataAdjustment_IN).to.have.property('name', 'Camomile Cleansing Butter 20ml');
        // expect(postDataAdjustment_out).to.have.property('sku', '101050222');
        // expect(postDataAdjustment_out).to.have.property('name', 'CAMOMILE CLEANSING BUTTER 20ML');

        // Step 4: Calculate expectedQty
        const expectedQty = Before_latestStock_Summary - inputQty;  // Mengurangi inputQty dari initialQty

        // expect(data).to.have.property('qty', expectedQty);
        expect(postDataAdjustment_out).to.have.property('qty', expectedQty);

        
    //condition after stock movement
cy.api({
    method: 'GET',
    url: urlGet2,
    headers: Cypress.env("REQUEST_HEADERS"),
    qs: {
        limit: 10,
        sort:'-updatedAt',
        sku: sku_adjustment,
        from: 'DC',
        ubd: ubd2
    }
}).then((response) => {
    // Pastikan respons sukses
    expect(response.status).to.eq(200);

// Ambil initialQty dari data respons terbaru
const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

// Pastikan stockSummary adalah array
expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');

    // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
const latestStock = stockMovement
.filter(item => 
    item.sku === sku_adjustment && 
    item.from === 'DC' &&
    new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
    new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
)
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

// Jika data tidak ditemukan, log semua stok yang ada
if (!latestStock) {
cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
throw new Error(`No stock movement data found for SKU ${sku_adjustment} at from store ${store_code_adjustment} with UBD ${ubd2}`);
}
// Validasi data GET dengan data POST
expect(latestStock.sku, 'SKU').to.eq(requestBodyAdjustmen_out.sku);  // Mengambil dari requestBody
expect(latestStock.name, 'Name SKU').to.eq(requestBodyAdjustmen_out.name);  // Mengambil dari requestBody
// Ambil bulan dan tahun dari latestStock.ubd
const latestStockDate = new Date(latestStock.ubd);
const latestStockMovementUBD = `${latestStockDate.getFullYear()}-${String(latestStockDate.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
expect(latestStockMovementUBD, 'UBD').to.eq(requestBodyAdjustmen_out.ubd); 
expect(latestStock.qty, 'QTY').to.eq(requestBodyAdjustmen_out.qty);  
expect(latestStock.from, 'FROM').to.eq(requestBodyAdjustmen_out.from);  
expect(latestStock.event, 'Event').to.eq(requestBodyAdjustmen_out.event);  
expect(latestStock.orderNumber, 'OrderNumber').to.eq(requestBodyAdjustmen_out.orderNumber); 

const After_latestStock_Movement = latestStock.totalStock;  // Ambil nilai qty dari stock movement produk terbaru
//         // cy.log('Stock Movement Before Condition: ', After_latestStock_Movement);

        //condition after stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 50,
            sku: sku_adjustment,
            storeCode: store_code_adjustment,
            ubd: ubd2
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);

        // Ambil initialQty dari data respons terbaru
        const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
        
        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockSummary
    .filter(item => 
        item.sku === sku_adjustment && 
        item.storeCode === store_code_adjustment &&
        new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
        new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
    )
.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
        cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
        throw new Error(`No stock summary data found for SKU ${sku_adjustment} at store ${store_code_adjustment} with UBD ${ubd2}`);
    }

    const After_latestStock_Summary = latestStock.qty;  // Ambil nilai qty dari sttock summary produk terbaru

    // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
    cy.log('lates totalStock  in stock movement condition before: ', Before_latestStock_Movement);
    cy.log('lates QuantityStock in Summary before stock movement: ', Before_latestStock_Summary);
    cy.log('Input Quantity: ', inputQty);
    cy.log('Expected Quantity: ', expectedQty);
    cy.log('lates totalStock  in stock movement condition after: ', After_latestStock_Movement);
    cy.log('lates QuantityStock in Summary after stock movement: ', After_latestStock_Summary);
    // // Step 6: Compare the values
    expect(After_latestStock_Movement).to.eq(Before_latestStock_Summary, 'StockMovement condition after = stok summary condition before');
    expect(After_latestStock_Summary).to.eq(expectedQty, 'StockSummary condition after = expectedQty');

}); 
    });  
        });
    });
});
});
});

describe(' Stock Movement - UBD Null', () => {
    let requestBodyUBDNULL; // Menyimpan body request POST 
    let postDataUBDNULL; // Menyimpan body request POST

    it('Should return the correct API and Verify correct Stock Movement - Adjustment-IN', () => {
        const urlGet = `${URL_PRODUCT}/admin/stock-summary`;  // URL endpoint GET
        const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint GET
        const urlPost = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint POST
    //Before Stock Movement Condition
        cy.api({
                    method: 'GET',
                    url: urlGet2,
                    headers: Cypress.env("REQUEST_HEADERS"),
                    qs: {
                        limit: 50,
                        sort: '-updatedAt',
                        sku: sku_adjustment,
                        from: 'DC',
                        ubd: 'null'
                    }
            }).then((response) => {
                // Pastikan respons sukses
                expect(response.status).to.eq(200);
    
            // Ambil initialQty dari data respons terbaru
            const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data
            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');
        
     // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockMovement
                .filter(item => item.sku === sku_adjustment && item.from === 'DC')[0];  
    
        // // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock || latestStock.totalStock === undefined) {
            Before_latestStock_Movement = 0;  
        } else {
            Before_latestStock_Movement = latestStock.totalStock;
        }
    
    // condition before stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS"),
            qs: {
                limit: 50,
                sort: '-updatedAt',
                sku: sku_adjustment,
                storeCode: store_code_adjustment,
                ubd: 'null'
            }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);
            // Ambil initialQty dari data respons terbaru
            const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data
            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
            expect(stockSummary.length).to.be.lte(1, 'Jumlah dokumen dalam stock summary tidak boleh lebih dari 1'); // Verifikasi bahwa jumlah dokumen tidak boleh lebih dari 1
           
            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
            const latestStock = stockSummary
            .filter(item => item.sku === sku_adjustment && item.storeCode === store_code_adjustment)[0];  
                
            if (!latestStock || latestStock.qty === undefined) {
                Before_latestStock_Summary = 0;
            } else {
                Before_latestStock_Summary = latestStock.qty;
            }

         // Step 2:POST - StockMovement (Create)
            const inputQty = 1;   // Nilai input dari body request
            const dynamicOrderNumber = `140160-UBD_NULL_${Date.now()}`;  // Menggunakan timestamp untuk membuat orderNumber unik
        
            requestBodyUBDNULL = {
                            "sku": sku_adjustment,  
                            "name": "Camomile Cleansing Butter 20ml", 
                            "ubd": '',  
                            "qty": inputQty,  
                            "from": "DC",  
                            "to": store_code_adjustment,  
                            "by": store_code_adjustment,  
                            "notes": "testing_Mils",  
                            "event": "adjustment-in", 
                            "orderNumber": dynamicOrderNumber,  
                            "siteDescription": "adjustment-in DC test"
                        };
            
            cy.api({
            method: 'POST',
            url: urlPost,  // URL untuk POST request
            headers: Cypress.env("REQUEST_HEADERS"),
            body:  requestBodyUBDNULL
        }).then((response) => {
            // Validasi respons API
            expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)
    
            // Validasi struktur respons yang benar
            const body = response.body;
            expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
            expect(body).to.have.property('message');
            expect(body).to.have.property('data');
    
            // Simpan data POST ke variabel postData
            postDataUBDNULL = body.data;
    
            // Validasi properti 'data' lebih detail jika diperlukan
            expect(postDataUBDNULL).to.have.property('sku', `${sku_adjustment}`);
            expect(postDataUBDNULL).to.have.property('name', 'Camomile Cleansing Butter 20ml');
    
            // Step 4: Calculate expectedQty
            const expectedQty = Before_latestStock_Summary + inputQty;  // Mengurangi inputQty dari initialQty
            expect(postDataUBDNULL).to.have.property('qty', expectedQty);
    
            
        //condition after stock movement
    cy.api({
        method: 'GET',
        url: urlGet2,
        headers: Cypress.env("REQUEST_HEADERS"),
        qs: {
            limit: 10,
            sort:'-updatedAt',
            sku: sku_adjustment,
            from: 'DC',
            ubd: 'null'
        }
    }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200);
    
    // Ambil initialQty dari data respons terbaru
    const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data
    
    // Pastikan stockSummary adalah array
    expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');
    
        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
    const latestStock = stockMovement
    .filter(item => 
        item.sku === sku_adjustment && 
        item.from === 'DC' )[0];//&&
     
    // .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 
    
    // Jika data tidak ditemukan, log semua stok yang ada
    if (!latestStock) {
    cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
    throw new Error(`No stock movement data found for SKU ${sku_adjustment} at from store ${store_code_adjustment} with UBD NULL`);
    }
    // Validasi data GET dengan data POST
    expect(latestStock.sku, 'SKU').to.eq(requestBodyUBDNULL.sku);  // Mengambil dari requestBody
    expect(latestStock.name, 'Name SKU').to.eq(requestBodyUBDNULL.name);  // Mengambil dari requestBody
    // Ambil bulan dan tahun dari latestStock.ubd
    const latestStockDate = new Date(latestStock.ubd);
    const latestStockMovement = `${latestStockDate.getFullYear()}-${String(latestStockDate.getMonth() + 1).padStart(2, '0')}`; // Format YYYY-MM
    expect(postDataUBDNULL.ubd, 'UBD').to.eq(null); 
    expect(latestStock.qty, 'QTY').to.eq(requestBodyUBDNULL.qty);  
    expect(latestStock.from, 'FROM').to.eq(requestBodyUBDNULL.from);  
    expect(latestStock.event, 'Event').to.eq(requestBodyUBDNULL.event);  
    expect(latestStock.orderNumber, 'OrderNumber').to.eq(requestBodyUBDNULL.orderNumber); 
    
    const After_latestStock_Movement = latestStock.totalStock;  // Ambil nilai qty dari stock movement produk terbaru
    //         // cy.log('Stock Movement Before Condition: ', After_latestStock_Movement);
    
            //condition after stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS"),
            qs: {
                limit: 50,
                sort:'-updatedAt',
                sku: sku_adjustment,
                storeCode: store_code_adjustment,
                ubd: 'null'
            }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);
    
            // Ambil initialQty dari data respons terbaru
            const stockSummary = response.body.data.docs;  // Asumsikan data ada di response.body.data
    
            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockSummary)).to.eq(true, 'Stock summary should be an array');
            
            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockSummary
        .filter(item => 
            item.sku === sku_adjustment && 
            item.storeCode === store_code_adjustment)[0]; //&&
            // new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            // new Date(item.ubd).getMonth() + 1 === 11 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        
    // .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 
    
        // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
            cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
            throw new Error(`No stock summary data found for SKU ${sku_adjustment} at store ${store_code_adjustment} with UBD Null`);
        }
    
        const After_latestStock_Summary = latestStock.qty;  // Ambil nilai qty dari sttock summary produk terbaru
    
        // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
        cy.log('lates totalStock  in stock movement condition before: ', Before_latestStock_Movement);
        cy.log('lates QuantityStock in Summary before stock movement: ', Before_latestStock_Summary);
        cy.log('Input Quantity: ', inputQty);
        cy.log('Expected Quantity: ', expectedQty);
        cy.log('lates totalStock  in stock movement condition after: ', After_latestStock_Movement);
        cy.log('lates QuantityStock in Summary after stock movement: ', After_latestStock_Summary);
        // // Step 6: Compare the values
        expect(After_latestStock_Movement).to.eq(Before_latestStock_Summary, 'StockMovement condition after = stok summary condition before');
        expect(After_latestStock_Summary).to.eq(expectedQty, 'StockSummary condition after = expectedQty');
    
    }); 
        });  
            });
        });
    });
    });
});

  });