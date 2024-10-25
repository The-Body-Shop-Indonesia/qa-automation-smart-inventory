const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

const sku_requisition= '134070359'
const ubd_requisiton= '2025-05'
const store_requisition = Cypress.env("STORE_CODE_BXC")
const sku_damaged= '126350116'
const ubd_damaged= '2026-06'

describe('Requisition - UBD', function() {
    it('Login admin', () => {
        const url = URL_USER + "/admin/login"
        cy.log(Cypress.env('ADMIN_USERNAME'))
        cy.api({
            method: "POST",
            url,
            // headers,
            body: {
                username: Cypress.env('ADMIN_USERNAME'),
                password: Cypress.env('ADMIN_PASSWORD')
            }
        })
        .then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.statusCode).to.equal(201)
            expect(response.body.data.accessToken).to.not.be.empty
            const tokenAdmin = response.body.data.accessToken
            // const employeeToken = response.body.data.accessToken
            Cypress.env("REQUEST_HEADERS_ADMIN", {
                Authorization: "Bearer " + tokenAdmin
            })
        })
    })
        
    it('Successfully login Employee [Store Leader]', () => {
    const url = URL_USER + "/employee/login"
    const employeeLoginLeader = Cypress.env("Employee_Login");
    cy.api({
    method: "POST",
    url,
    body: {
        nik: Cypress.env("NIK_BXC"),
        storeCode: Cypress.env("STORE_CODE_BXC"),
        pin: Cypress.env("PIN_BXC"),
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
        const employeeToken = response.body.data.accessToken
        Cypress.env("REQUEST_HEADERS_LEADSTORE", {
            Authorization: "Bearer " + employeeToken,
            channel: "pos"
        })
        })
    })

    it('Successfully login Employee [STAFF]', () => {
        const url = URL_USER + "/employee/login"
        const employeeLoginStaff = Cypress.env("Employee_Login");
        cy.api({
        method: "POST",
        url,
        body: {
            nik: Cypress.env("NIK_STAFF"),
            storeCode: Cypress.env("STORE_CODE_STAFF"),
            pin: Cypress.env("PIN_BXC"),
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
            const employeeToken = response.body.data.accessToken
            Cypress.env("REQUEST_HEADERS_STAFF", {
                Authorization: "Bearer " + employeeToken,
                channel: "pos"
            })
            })
        })

    let requestBody;
    let postDataRequisition;
    let Before_latestStock_Movement;
    let Before_latestStock_Summary;
    it('Should return the correct API and Verify correct Stock Movement - Requisition', () => {
        const urlGet = `${URL_PRODUCT}/admin/stock-summary`;  // URL endpoint GET
        const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint GET
        const url = URL_PRODUCT + "/employee/requisition/v2"
    //Before Stock Movement Condition
        cy.api({
                    method: 'GET',
                    url: urlGet2,
                    headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
                    qs: {
                        limit: 10,
                        sort: '-updatedAt',
                        sku: sku_requisition,
                        from: Cypress.env("STORE_CODE_BXC"),
                        ubd: ubd_requisiton
                    }
            }).then((response) => {
                expect(response.status).to.eq(200);
                // Ambil initialQty dari data respons terbaru
                const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

                // Pastikan stockSummary adalah array
                expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');


                    // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
                const latestStock = stockMovement
                .filter(item => 
                    item.sku === sku_requisition && 
                    item.from === Cypress.env("STORE_CODE_BXC") &&
                    new Date(item.ubd).getFullYear() === 5 && // Filter berdasarkan tahun
                    new Date(item.ubd).getMonth() + 1 === 2025 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
                )
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 
                    if (!latestStock) {
                        Before_latestStock_Movement = 0;  // Sekarang Before_latestStock_Summary di-set di sini
                        cy.log(`SKU ${sku_requisition} at from store ${sku_requisition} - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: 0`);
                        } else {
                        Before_latestStock_Movement = latestStock.totalStock;  // Simpan nilai ini di variabel luar
                        }
            
            // const After_latestStock_Movement = latestStock.totalStock;
    // condition before stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
            qs: {
                limit: 50,
                sku: sku_requisition,
                storeCode: Cypress.env("STORE_CODE_BXC"),
                ubd: ubd_requisiton
            }
            }).then((response) => {
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
                item.sku === sku_requisition && 
                item.storeCode === Cypress.env("STORE_CODE_BXC") &&
                new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
            )

        //     new Date(item.ubd).getFullYear() === year_requisition && // Filter berdasarkan tahun
        //     new Date(item.ubd).getMonth() + 1 === month_requisition // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        // )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

            if (!latestStock) {
                Before_latestStock_Summary = 0;  // Sekarang Before_latestStock_Summary di-set di sini
                cy.log(`SKU ${sku_requisition} at from store ${store_requisition} - Previous totalStock: ${Before_latestStock_Summary}, Current totalStock: 0`);
                } else {
                Before_latestStock_Summary = latestStock.qty;  // Simpan nilai ini di variabel luar
                }

            // Step 2:POST - Requisition
            const inputQty = 1;   // Nilai input dari body request

            requestBody = {
                            "nik": Cypress.env("NIK_BXC"),
                            "products": [
                                {
                                "sku": sku_requisition,
                                "qty": inputQty,
                                "ubd": ubd_requisiton,
                                "requiredUbd": true
                                }
                            ],
                            "type": "Tester",
                            "reason": "buat test."
                            };
        cy.api({
        method: 'POST',
        url,  // URL untuk POST request
        headers: Cypress.env("REQUEST_HEADERS_LEADSTORE"),
        body: requestBody
        }).then((response) => {
            // Validasi respons API
            expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

            // Validasi struktur respons yang benar
            const body = response.body;
            expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
            expect(body).to.have.property('message');
            expect(body).to.have.property('data');

            // Simpan data POST ke variabel postDataRequisition
            postDataRequisition = body.data;

            // Ambil SKU dan UBD dari hasil respon
            const product = postDataRequisition.products[0];
            const ubd = product.ubdDetail[0].ubd;     
            const ubdMonthYear = ubd.slice(0, 7);  // Ambil bagian '2025-05' dari '2025-05-01T07:00:00.000Z'
            //Validasi requested & respons
            expect(postDataRequisition.nik).to.eq(requestBody.nik);
            expect(product.product.sku).to.eq(requestBody.products[0].sku)
            expect(postDataRequisition.products[0].qty).to.eq(requestBody.products[0].qty);
            expect(ubdMonthYear).to.eq(ubd_requisiton); 
            expect(postDataRequisition.type).to.eq(requestBody.type);
            expect(postDataRequisition.reason).to.eq(requestBody.reason);
            
            // Step 4: Calculate expectedQty
            const expectedQty = Before_latestStock_Summary - inputQty;  // Sekarang Before_latestStock_Summary terdefinisi
            
            cy.log('Jumlah stok summary [sebelum movement]:', Before_latestStock_Summary);
            cy.log('Input qty Requisition', inputQty);
            cy.log('Expected Quantity:', expectedQty);
            
        //condition after stock movement
        cy.api({
            method: 'GET',
            url: urlGet2,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
            qs: {
                limit: 10,
                sort:'-updatedAt',
                sku: sku_requisition,
                from: Cypress.env("STORE_CODE_BXC"),
                ubd: ubd_requisiton
            }
        }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200);

            const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');

                // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
            const latestStock = stockMovement
            .filter(item => 
                item.sku === sku_requisition && 
                item.from === Cypress.env("STORE_CODE_BXC") &&
                new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

            // Jika data tidak ditemukan, log semua stok yang ada
            if (!latestStock) {
            cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
            throw new Error(`No stock movement data found for SKU ${sku_requisition} at from store${store_requisition} with UBD ${ubd_requisiton}`);
            }

            const After_latestStock_Movement = latestStock.totalStock;

            //condition after stock summary
        cy.api({
            method: 'GET',
            url: urlGet,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
            qs: {
                limit: 50,
                sku: sku_requisition,
                storeCode: Cypress.env("STORE_CODE_BXC"),
                ubd: ubd_requisiton
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
                item.sku === sku_requisition && 
                item.storeCode === Cypress.env("STORE_CODE_BXC") &&
                new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
            )
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

                // Jika data tidak ditemukan, log semua stok yang ada
                if (!latestStock) {
                    cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
                    throw new Error(`No stock data found for SKU ${sku_requisition} at store ${store_requisition} with UBD ${ubd_requisiton}`);
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


it('Verify the item returned should match after POST Requisition', () => {
const url = URL_PRODUCT + "/employee/requisition";
const today = new Date().toISOString().split('T')[0]; // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
// const expectedUbd = '2025-05';
    cy.api({
        method: 'GET',
        url,
        headers: Cypress.env("REQUEST_HEADERS_LEADSTORE"),
        qs: {
            limit: 50,
            from_date: today,
            sort: '-updatedAt',
        }
            }).then((response) => {
                // Pastikan respons sukses
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Success"); 
                expect(response.body).to.have.property('data');

                // Ambil data terbaru dari response body
                const RequisitionData = response.body.data.docs; // Asumsikan data ada di response.body.data
                // Filter dan ambil item terbaru berdasarkan from_date
                const lastData = RequisitionData
                .filter(item => new Date(item.createdAt).toISOString().split('T')[0] === today) // Filter berdasarkan createdAt
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]; // Urutkan berdasarkan updatedAt terbaru

                // Jika data tidak ditemukan, log semua stok yang ada
                if (!lastData) {
                    cy.log('Available Data Requisition:', JSON.stringify(RequisitionData, null, 2)); // Log semua data stok yang tersedia
                    throw new Error('No data Requisition found for today: ' + today);
                }

                // Validasi data GET dengan data POST sebelumnya
                expect(lastData.nik).to.eq(requestBody.nik); // Bandingkan nik dengan requestBody
                expect(lastData.products[0].product.sku).to.eq(requestBody.products[0].sku); // Bandingkan SKU produk
                expect(lastData.products[0].qty).to.eq(requestBody.products[0].qty); // Bandingkan qty produk

                // Ambil UBD dan format untuk validasi
                const ubd = lastData.products[0].ubdDetail[0].ubd; // Ambil UBD dari lastData
                const ubdMonthYear = ubd.slice(0, 7); // Format UBD menjadi YYYY-MM
                expect(ubdMonthYear).to.eq(ubd_requisiton); // Validasi bulan dan tahun UBD

                expect(lastData.type).to.eq(requestBody.type); // Bandingkan type
                expect(lastData.reason).to.eq(requestBody.reason); // Bandingkan reason
                });
                });

describe('Damaged - UBD', function() {
let requestBodyDamaged;
let postDataRequisitionDamaged;
let Before_latestStock_Movement_Damaged;
let Before_latestDamaged_Summary
let After_latestStock_Movement_Damaged;
let After_latestDamaged_Summary;
it('Should return the correct API and Verify correct Stock Movement - Requisition Damaged', () => {
    const urlGet = `${URL_PRODUCT}/admin/stock-summary`;  // URL endpoint GET
    const urlGet2 = `${URL_PRODUCT}/admin/stock-movement`;  // URL endpoint GET
    const url = URL_PRODUCT + "/employee/requisition/v2"
    //Before Stock Movement Condition
    cy.api({
        method: 'GET',
        url: urlGet2,
        headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
        qs: {
            limit: 10,
            sort: '-updatedAt',
            sku: sku_damaged,
            from: Cypress.env("STORE_CODE_BXC"),
            ubd: ubd_damaged
        }
        }).then((response) => {
        expect(response.status).to.eq(200);
        // Ambil initialQty dari data respons terbaru
        const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');


            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockMovement
        .filter(item => 
            item.sku === sku_damaged && 
            item.from === Cypress.env("STORE_CODE_BXC") &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 6 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 
        if (!latestStock) {
            Before_latestStock_Movement_Damaged = 0;  // Sekarang Before_latestStock_Summary di-set di sini
            cy.log(`SKU ${sku_damaged} at from store ${store_requisition} - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: 0`);
            } else {
            Before_latestStock_Movement_Damaged = latestStock.totalStock;  // Simpan nilai ini di variabel luar
            }
        });

    // condition before stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
        qs: {
            limit: 50,
            sku: sku_damaged,
            storeCode: Cypress.env("STORE_CODE_BXC"),
            ubd: ubd_damaged
        }
        }).then((response) => {
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
            item.sku === sku_damaged && 
            item.storeCode === Cypress.env("STORE_CODE_BXC") &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 6 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        if (!latestStock) {
            Before_latestStock_Summary = 0;
            Before_latestDamaged_Summary = 0; // Jika tidak ada, damaged juga dianggap 0
            cy.log(`No stock summary found for SKU ${sku_damaged} . Available data:`, stockSummary);
        } else {
            Before_latestStock_Summary = latestStock.qty;  // Ambil nilai qty
            Before_latestDamaged_Summary = latestStock.damaged || 0;  // Ambil nilai damaged, fallback 0
            cy.log('Before Stock Summary: ', { qty: Before_latestStock_Summary, damaged: Before_latestDamaged_Summary });
        }
    });

    // Step 2:POST - Requisition
    const inputQty = 1;   // Nilai input dari body request
    requestBodyDamaged = {
        "nik": Cypress.env("NIK_BXC"),
        "products": [
            {
            "sku": sku_damaged,
            "qty": inputQty,
            "ubd": ubd_damaged,
            "requiredUbd": true
            }
        ],
        "type": "Damaged",
        "reason": "Barang harus di hancurkan."
    };           
    cy.api({
        method: 'POST',
        url,  // URL untuk POST request
        headers: Cypress.env("REQUEST_HEADERS_LEADSTORE"),
        body: requestBodyDamaged
        }).then((response) => {
        // Validasi respons API
        expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

        // Validasi struktur respons yang benar
        const body = response.body;
        expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
        expect(body).to.have.property('message');
        expect(body).to.have.property('data');

        // Simpan data POST ke variabel postDataRequisitionDamaged
        postDataRequisitionDamaged = body.data;

        // Ambil SKU dan UBD dari hasil respon
        const product = postDataRequisitionDamaged.products[0];
        const ubd = product.ubdDetail[0].ubd;     
        const ubdMonthYearDamaged = ubd.slice(0, 7);  // Ambil bagian '2025-05' dari '2025-05-01T07:00:00.000Z'
        //Validasi requested & respons
        expect(postDataRequisitionDamaged.nik).to.eq(requestBodyDamaged.nik);
        expect(product.product.sku).to.eq(requestBodyDamaged.products[0].sku)
        expect(postDataRequisitionDamaged.products[0].qty).to.eq(requestBodyDamaged.products[0].qty);
        expect(ubdMonthYearDamaged).to.eq('2026-06'); 
        expect(postDataRequisitionDamaged.type).to.eq(requestBodyDamaged.type);
        expect(postDataRequisitionDamaged.reason).to.eq(requestBodyDamaged.reason);
        
        // Step 4: Calculate expectedQty
        const expectedQty = Before_latestStock_Summary - inputQty;  // Sekarang Before_latestStock_Summary terdefinisi
        const expectedDamaged = Before_latestDamaged_Summary + inputQty;

        
    //condition after stock movement
    cy.api({
        method: 'GET',
        url: urlGet2,
        headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
        qs: {
            limit: 10,
            sort:'-updatedAt',
            sku: sku_damaged,
            from: Cypress.env("STORE_CODE_BXC"),
            ubd: ubd_damaged
        }
        }).then((response) => {
            // Pastikan respons sukses
        expect(response.status).to.eq(200);

        const stockMovement = response.body.data.docs;  // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockMovement)).to.eq(true, 'Stock Movement should be an array');

            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockMovement
        .filter(item => 
            item.sku === sku_damaged && 
            item.from === Cypress.env("STORE_CODE_BXC") &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 6 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
        cy.log('Available Stocks:', stockMovement);  // Log semua data stok yang tersedia
        throw new Error(`No stock movement data found for SKU ${sku_damaged} at from store ${store_requisition} with UBD ${ubd_damaged}`);
        }

        const After_latestStock_Movement_Damaged = latestStock.totalStock;

    //condition after stock summary
    cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env("REQUEST_HEADERS_ADMIN"),
        qs: {
            limit: 50,
            sku: sku_damaged,
            storeCode: Cypress.env("STORE_CODE_BXC"),
            ubd: ubd_damaged
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
            item.sku === sku_damaged && 
            item.storeCode === Cypress.env("STORE_CODE_BXC") &&
            new Date(item.ubd).getFullYear() === 2026 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 6 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];  // Urutkan berdasarkan waktu 

        // Jika data tidak ditemukan, log semua stok yang ada
        if (!latestStock) {
            cy.log('Available Stocks:', stockSummary);  // Log semua data stok yang tersedia
            throw new Error('No stock data found for SKU 126350116 at store 14160 with UBD 2025-05');
        }

        const After_latestStock_Summary = latestStock.qty;  // Ambil nilai qty dari sttock summary produk terbaru
        const  After_latestDamaged_Summary =  latestStock.damaged;
        // cy.log('qty stok summary after movement: ',  After_latestStock_Summary);
        // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
        cy.log('Jumlah stok Totalqty  Movement [sebelum movement]:', Before_latestStock_Movement_Damaged)
        cy.log('Jumlah stok qty  summary [sebelum movement]:', Before_latestStock_Summary)
        cy.log('Jumlah stok damaged  summary [sebelum movement]:', Before_latestDamaged_Summary);
        cy.log('Input Quantity: ', inputQty);
        cy.log('Expected Quantity: ', expectedQty);
        cy.log('Expected Damaged: ', expectedDamaged);
        cy.log('Expected totalQty stock movement [sesudah movement]: ', After_latestStock_Movement_Damaged);
        cy.log('Expected qty Summary [sesudah movement]: ', After_latestStock_Summary);
        cy.log('Expected qty Damaged [sesudah movement]: ', After_latestDamaged_Summary);
        // // Step 6: Compare the values
        expect(After_latestStock_Movement_Damaged).to.eq(Before_latestStock_Summary, 'StockMovement condition after = stok summary condition before');
        expect(After_latestStock_Summary).to.eq(expectedQty, 'QTY StockSummary condition after = expectedQty');
        expect(After_latestDamaged_Summary).to.eq(expectedDamaged, 'Damaged StockSummary condition after = expectedDamaged');
}); 
    });  
        });
    });

    it('Verify the item returned should match after POST Damaged', () => {
        const url = URL_PRODUCT + "/employee/requisition";
        const today = new Date().toISOString().split('T')[0]; // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
        
            cy.api({
                method: 'GET',
                url,
                headers: Cypress.env("REQUEST_HEADERS_LEADSTORE"),
                qs: {
                    limit: 50,
                    from_date: today,
                    sort: '-updatedAt',
                }
                    }).then((response) => {
                        // Pastikan respons sukses
                        expect(response.status).to.eq(200);
                        expect(response.body.message).to.eq("Success"); 
                        expect(response.body).to.have.property('data');
        
                        // Ambil data terbaru dari response body
                        const RequisitionData = response.body.data.docs; // Asumsikan data ada di response.body.data
                        // Filter dan ambil item terbaru berdasarkan from_date
                        const lastData = RequisitionData
                        .filter(item => new Date(item.createdAt).toISOString().split('T')[0] === today) // Filter berdasarkan createdAt
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]; // Urutkan berdasarkan updatedAt terbaru
        
                        // Jika data tidak ditemukan, log semua stok yang ada
                        if (!lastData) {
                            cy.log('Available Data Requisition:', JSON.stringify(RequisitionData, null, 2)); // Log semua data stok yang tersedia
                            throw new Error('No data Requisition found for today: ' + today);
                        }
        
                        // Validasi data GET dengan data POST sebelumnya
                        expect(lastData.nik).to.eq(requestBodyDamaged.nik); // Bandingkan nik dengan requestBody
                        expect(lastData.products[0].product.sku).to.eq(requestBodyDamaged.products[0].sku); // Bandingkan SKU produk
                        expect(lastData.products[0].qty).to.eq(requestBodyDamaged.products[0].qty); // Bandingkan qty produk
        
                        // Ambil UBD dan format untuk validasi
                        const ubd = lastData.products[0].ubdDetail[0].ubd; // Ambil UBD dari lastData
                        const ubdMonthYear = ubd.slice(0, 7); // Format UBD menjadi YYYY-MM
                        expect(ubdMonthYear).to.eq(ubd_damaged); // Validasi bulan dan tahun UBD
        
                        expect(lastData.type).to.eq(requestBodyDamaged.type); // Bandingkan type
                        expect(lastData.reason).to.eq(requestBodyDamaged.reason); // Bandingkan reason
                        });
                        });
    
});

describe('STAFF - Requisition - UBD', function() {
    it('Verify unable create requisition if login Staff', () => {
        const url = URL_PRODUCT + "/employee/requisition";
        const inputQty = 1;   // Nilai input dari body request
        cy.api({
            method: 'POST',
            url, 
            headers: Cypress.env("REQUEST_HEADERS_STAFF"),
            failOnStatusCode: false,
            Body: {
                "nik": Cypress.env("NIK_STAFF"),
                "products": [
                    {
                    "sku": sku_damaged,
                    "qty": inputQty,
                    "ubd": ubd_damaged,
                    "requiredUbd": true
                    }
                ],
                "type": "Damaged",
                "reason": "Barang harus di hancurkan."
            }
            })
            .should(response => {
            expect(response.status).to.equal(403)
            const body = response.body
            expect(body).to.haveOwnProperty("statusCode")
            expect(body).to.haveOwnProperty("message")
            expect(body).to.haveOwnProperty("error")
            expect(body.statusCode).to.equal(403)
        })
       
        })
          })
});