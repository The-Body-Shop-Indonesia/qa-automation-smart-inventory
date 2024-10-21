const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('Requisition - UBD', function () {
  it('Login admin', () => {
    const url = URL_USER + '/admin/login'
    cy.log(Cypress.env('ADMIN_USERNAME'))
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        username: Cypress.env('ADMIN_USERNAME'),
        password: Cypress.env('ADMIN_PASSWORD')
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenAdmin = response.body.data.accessToken
      // const employeeToken = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_ADMIN', {
        Authorization: 'Bearer ' + tokenAdmin
      })
    })
  })

  it('Successfully login Employee', () => {
    const url = URL_USER + '/employee/login'
    const employeeLogin = Cypress.env('Employee_Login')
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: Cypress.env('NIK_BXC'),
        storeCode: Cypress.env('STORE_CODE_BXC'),
        pin: Cypress.env('PIN_BXC')
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
        const employeeToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS_Employee', {
          Authorization: 'Bearer ' + employeeToken,
          channel: 'pos'
        })
      })
  })

  let requestBody
  let postDataRequisition
  let Before_latestStock_Summary
  let Before_latestStock_Movement
  it('Should return the correct API and Verify correct Stock Movement - Requisition', () => {
    const urlGet = `${URL_PRODUCT}/admin/stock-summary` // URL endpoint GET
    const urlGet2 = `${URL_PRODUCT}/admin/stock-movement` // URL endpoint GET
    const url = URL_PRODUCT + '/employee/requisition/v2'
    //Before Stock Movement Condition
    cy.api({
      method: 'GET',
      url: urlGet2,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 10,
        sort: '-updatedAt',
        sku: '134070359',
        from: '14160',
        ubd: '2025-05'
      }
    }).then((response) => {
      // Pastikan respons sukses
      expect(response.status).to.eq(200)

      // Ambil initialQty dari data respons terbaru
      const stockMovement = response.body.data.docs // Asumsikan data ada di response.body.data

      // Pastikan stockSummary adalah array
      expect(Array.isArray(stockMovement)).to.eq(
        true,
        'Stock Movement should be an array'
      )

      // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
      const latestStock = stockMovement
        .filter(
          (item) =>
            item.sku === '134070359' &&
            item.from === '14160' &&
            new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
            new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] // Urutkan berdasarkan waktu

      if (!latestStock) {
        // Ambil totalStock dari latestStock sebelumnya
        const Before_latestStock_Movement = 0 // If latestStock is undefined, set it to 0
        const totalStock = 0 // Set totalStock menjadi 0 karena data tidak ditemukan
        cy.log(
          `SKU 134070359 at from store 14160 - Previous totalStock: ${Before_latestStock_Movement}, Current totalStock: ${totalStock}`
        )
      } else {
        const Before_latestStock_Movement = latestStock.totalStock // Safely access totalStock because latestStock is defined
      }

      // condition before stock summary
      cy.api({
        method: 'GET',
        url: urlGet,
        headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
        qs: {
          limit: 50,
          sku: '134070359',
          storeCode: '14160',
          ubd: '2025-05-01'
        }
      }).then((response) => {
        // Pastikan respons sukses
        expect(response.status).to.eq(200)
        // Ambil initialQty dari data respons terbaru
        const stockSummary = response.body.data.docs // Asumsikan data ada di response.body.data

        // Pastikan stockSummary adalah array
        expect(Array.isArray(stockSummary)).to.eq(
          true,
          'Stock summary should be an array'
        )

        // Verifikasi bahwa jumlah dokumen tidak boleh lebih dari 1
        expect(stockSummary.length).to.be.lte(
          1,
          'Jumlah dokumen dalam stock summary tidak boleh lebih dari 1'
        )

        // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
        const latestStock = stockSummary
          .filter(
            (item) =>
              item.sku === '134070359' &&
              item.storeCode === '14160' &&
              new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
              new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] // Urutkan berdasarkan waktu

        if (!latestStock) {
          Before_latestStock_Summary = 0 // Sekarang Before_latestStock_Summary di-set di sini
          cy.log(
            `SKU 134070359 at from store 14160 - Previous totalStock: ${Before_latestStock_Summary}, Current totalStock: 0`
          )
        } else {
          Before_latestStock_Summary = latestStock.qty // Simpan nilai ini di variabel luar
        }

        // Step 2:POST - Requisition
        const inputQty = 1 // Nilai input dari body request

        requestBody = {
          nik: Cypress.env('NIK_BXC'),
          products: [
            {
              sku: '134070359',
              qty: inputQty,
              ubd: '2025-05',
              requiredUbd: true
            }
          ],
          type: 'Tester',
          reason: 'buat test.'
        }
        cy.api({
          method: 'POST',
          url, // URL untuk POST request
          headers: Cypress.env('REQUEST_HEADERS_Employee'),
          body: requestBody
        }).then((response) => {
          // Validasi respons API
          expect(response.status).to.eq(201) // Pastikan status kode 201 (Created)

          // Validasi struktur respons yang benar
          const body = response.body
          expect(body).to.have.property('statusCode') // Sesuaikan dengan struktur yang benar
          expect(body).to.have.property('message')
          expect(body).to.have.property('data')

          // Simpan data POST ke variabel postDataRequisition
          postDataRequisition = body.data

          // Ambil SKU dan UBD dari hasil respon
          const product = postDataRequisition.products[0]
          const ubd = product.ubdDetail[0].ubd
          const ubdMonthYear = ubd.slice(0, 7) // Ambil bagian '2025-05' dari '2025-05-01T07:00:00.000Z'
          //Validasi requested & respons
          expect(postDataRequisition.nik).to.eq(requestBody.nik)
          expect(product.product.sku).to.eq(requestBody.products[0].sku)
          expect(postDataRequisition.products[0].qty).to.eq(
            requestBody.products[0].qty
          )
          expect(ubdMonthYear).to.eq('2025-05')
          expect(postDataRequisition.type).to.eq(requestBody.type)
          expect(postDataRequisition.reason).to.eq(requestBody.reason)

          // Step 4: Calculate expectedQty
          const expectedQty = Before_latestStock_Summary - inputQty // Sekarang Before_latestStock_Summary terdefinisi
          cy.log(
            'Jumlah stok summary [sebelum movement]:',
            Before_latestStock_Summary
          )
          cy.log('Input qty Requisition', inputQty)
          cy.log('Expected Quantity:', expectedQty)
          // expect(postDataRequisition.products[0]).to.have.property('qty', expectedQty);

          //condition after stock movement
          cy.api({
            method: 'GET',
            url: urlGet2,
            headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
            qs: {
              limit: 10,
              sort: '-updatedAt',
              sku: '134070359',
              from: '14160',
              ubd: '2025-05'
            }
          }).then((response) => {
            // Pastikan respons sukses
            expect(response.status).to.eq(200)

            const stockMovement = response.body.data.docs // Asumsikan data ada di response.body.data

            // Pastikan stockSummary adalah array
            expect(Array.isArray(stockMovement)).to.eq(
              true,
              'Stock Movement should be an array'
            )

            // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
            const latestStock = stockMovement
              .filter(
                (item) =>
                  item.sku === '134070359' &&
                  item.from === '14160' &&
                  new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                  new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
              )
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] // Urutkan berdasarkan waktu

            // Jika data tidak ditemukan, log semua stok yang ada
            if (!latestStock) {
              cy.log('Available Stocks:', stockMovement) // Log semua data stok yang tersedia
              throw new Error(
                'No stock movement data found for SKU 134070359 at from store 14160 with UBD 2025-05'
              )
            }

            const After_latestStock_Movement = latestStock.totalStock

            //condition after stock summary
            cy.api({
              method: 'GET',
              url: urlGet,
              headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
              qs: {
                limit: 50,
                sku: '134070359',
                storeCode: '14160',
                ubd: '2025-05-01'
              }
            }).then((response) => {
              // Pastikan respons sukses
              expect(response.status).to.eq(200)

              // Ambil initialQty dari data respons terbaru
              const stockSummary = response.body.data.docs // Asumsikan data ada di response.body.data

              // Pastikan stockSummary adalah array
              expect(Array.isArray(stockSummary)).to.eq(
                true,
                'Stock summary should be an array'
              )

              // Cari item dengan SKU yang sesuai dan filter berdasarkan UBD, sesuaikan dengan format bulan dan tahun
              const latestStock = stockSummary
                .filter(
                  (item) =>
                    item.sku === '134070359' &&
                    item.storeCode === '14160' &&
                    new Date(item.ubd).getFullYear() === 2025 && // Filter berdasarkan tahun
                    new Date(item.ubd).getMonth() + 1 === 5 // Filter berdasarkan bulan (bulan dalam JavaScript dimulai dari 0, jadi tambahkan 1)
                )
                .sort(
                  (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                )[0] // Urutkan berdasarkan waktu

              // Jika data tidak ditemukan, log semua stok yang ada
              if (!latestStock) {
                cy.log('Available Stocks:', stockSummary) // Log semua data stok yang tersedia
                throw new Error(
                  'No stock data found for SKU 134070359 at store 14160 with UBD 2025-05'
                )
              }

              const After_latestStock_Summary = latestStock.qty // Ambil nilai qty dari sttock summary produk terbaru

              // Step 5: Log nilai-nilai untuk memastikan perhitungan benar
              cy.log(
                'lates totalStock  in stock movement condition before: ',
                Before_latestStock_Movement
              )
              cy.log(
                'lates QuantityStock in Summary before stock movement: ',
                Before_latestStock_Summary
              )
              cy.log('Input Quantity: ', inputQty)
              cy.log('Expected Quantity: ', expectedQty)
              cy.log(
                'lates totalStock  in stock movement condition after: ',
                After_latestStock_Movement
              )
              cy.log(
                'lates QuantityStock in Summary after stock movement: ',
                After_latestStock_Summary
              )
              // // Step 6: Compare the values
              expect(After_latestStock_Movement).to.eq(
                Before_latestStock_Summary,
                'StockMovement condition after = stok summary condition before'
              )
              expect(After_latestStock_Summary).to.eq(
                expectedQty,
                'StockSummary condition after = expectedQty'
              )
            })
          })
        })
      })
    })
  })

  it('Verify the item returned should match after POST', () => {
    const url = URL_PRODUCT + '/employee/requisition'
    const today = new Date().toISOString().split('T')[0] // Dapatkan tanggal hari ini dalam format YYYY-MM-DD

    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_Employee'),
      qs: {
        limit: 50,
        from_date: today,
        sort: '-updatedAt'
      }
    }).then((response) => {
      // Pastikan respons sukses
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq('Success')
      expect(response.body).to.have.property('data')

      // Ambil data terbaru dari response body
      const RequisitionData = response.body.data.docs // Asumsikan data ada di response.body.data

      //   // Log hasil respon data untuk pengecekan
      //   cy.log('Requisition Data:', JSON.stringify(RequisitionData, null, 2));

      // Filter dan ambil item terbaru berdasarkan from_date
      const lastData = RequisitionData.filter(
        (item) => new Date(item.createdAt).toISOString().split('T')[0] === today
      ) // Filter berdasarkan createdAt
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] // Urutkan berdasarkan updatedAt terbaru

      // Jika data tidak ditemukan, log semua stok yang ada
      if (!lastData) {
        cy.log(
          'Available Data Requisition:',
          JSON.stringify(RequisitionData, null, 2)
        ) // Log semua data stok yang tersedia
        throw new Error('No data Requisition found for today: ' + today)
      }

      // Validasi data GET dengan data POST sebelumnya
      expect(lastData.nik).to.eq(requestBody.nik) // Bandingkan nik dengan requestBody
      expect(lastData.products[0].product.sku).to.eq(
        requestBody.products[0].sku
      ) // Bandingkan SKU produk
      expect(lastData.products[0].qty).to.eq(requestBody.products[0].qty) // Bandingkan qty produk

      // Ambil UBD dan format untuk validasi
      const ubd = lastData.products[0].ubdDetail[0].ubd // Ambil UBD dari lastData
      const ubdMonthYear = ubd.slice(0, 7) // Format UBD menjadi YYYY-MM
      expect(ubdMonthYear).to.eq('2025-05') // Validasi bulan dan tahun UBD

      expect(lastData.type).to.eq(requestBody.type) // Bandingkan type
      expect(lastData.reason).to.eq(requestBody.reason) // Bandingkan reason
    })
  })
})
