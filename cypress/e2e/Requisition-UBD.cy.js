const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")


describe('requisition', function() {
  // it('Successfully login', () => {
  //   const url = Cypress.env("baseUrlUser") + "/employee/login";
  //   const employeeLogin = Cypress.env("Employee_Login"); // Ambil data employee_login dari env
  
  //   cy.api({
  //     method: "POST",
  //     url,
  //     body: employeeLogin // Gunakan data login dari environment variable
  //   }).then((response) => {
  //     expect(response.status).to.eq(200);
  //     cy.log("Login successful");
  //   });
  // });
  
    it('Successfully login', () => {
      const url = URL_USER + "/employee/login"
      const employeeLogin = Cypress.env("Employee_Login");
      cy.api({
        method: "POST",
        url,
        body: {
          nik: '00012',
          storeCode: '14036',
          pin:'1234'
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
        Cypress.env("REQUEST_HEADERS", {
          Authorization: "Bearer " + employeeToken,
          channel: "pos"
        })
      })
    })

    let requestBody; // Menyimpan body request POST 
    let postData
    it("Creates Requsition AS Manager", () => {
        const url = URL_PRODUCT + "/employee/requisition/v2"

        const inputQty = 1;   // Nilai input dari body request
        
        requestBody = {
            "nik": "00012",
            "products": [
              {
                "sku": "134070359",
                "qty": 1,
                "ubd": "2024-12",
                "requiredUbd": true
              }
            ],
            "type": "Tester",
            "reason": "buat test."
        };
        cy.api({
        method: 'POST',
        url,  // URL untuk POST request
        headers: Cypress.env("REQUEST_HEADERS"),
        body: requestBody
    }).then((response) => {
        // Validasi respons API
        expect(response.status).to.eq(201);  // Pastikan status kode 201 (Created)

        // Validasi struktur respons yang benar
        const body = response.body;
        expect(body).to.have.property('statusCode');  // Sesuaikan dengan struktur yang benar
        expect(body).to.have.property('message');
        expect(body).to.have.property('data');

        // Simpan data POST ke variabel postData
        postData = response.body.data;body.data;

        // Ambil SKU dan UBD dari hasil respon
        const product = postData.products[0];
        // const sku = product.product.sku;       
        const ubd = product.ubdDetail[0].ubd;  
        // Ekstrak bulan dan tahun dari UBD (YYYY-MM)
         const ubdMonthYear = ubd.slice(0, 7);  // Ambil bagian '2024-12' dari '2024-12-01T07:00:00.000Z'
    //Validasi requested & respons
        expect(postData.nik).to.eq(requestBody.nik);
        expect(product.product.sku).to.eq(requestBody.products[0].sku)
        expect(postData.products[0].qty).to.eq(requestBody.products[0].qty);
        expect(ubdMonthYear).to.eq('2024-12'); 
        expect(postData.type).to.eq(requestBody.type);
        expect(postData.reason).to.eq(requestBody.reason);

})
})

it('Verify the item returned should match after POST', () => {
    const url = URL_PRODUCT + "/employee/requisition";
    const today = new Date().toISOString().split('T')[0]; // Dapatkan tanggal hari ini dalam format YYYY-MM-DD

    cy.api({
        method: 'GET',
        url,
        headers: Cypress.env("REQUEST_HEADERS"),
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

          // Log hasil respon data untuk pengecekan
          cy.log('Requisition Data:', JSON.stringify(RequisitionData, null, 2));
          
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
        expect(ubdMonthYear).to.eq('2024-12'); // Validasi bulan dan tahun UBD

        expect(lastData.type).to.eq(requestBody.type); // Bandingkan type
        expect(lastData.reason).to.eq(requestBody.reason); // Bandingkan reason
    });
  });



});

