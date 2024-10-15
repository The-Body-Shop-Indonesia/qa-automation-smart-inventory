const urlMP = Cypress.config("baseUrlMP")


const local_id = Math.floor(Math.random() * 10000000000).toString() //random id
const localName = "999AutomationQAMP999"

describe('Callback create order MP', () => {
    it("Callback create order MP", () => {
        const key = Cypress.env('MP_KEY')
        const channel = "Shopee"
        const skus = "112250061" //dibuat SKU array?
        const price = "159000"
        const id =  BigInt(Math.floor(Math.random() * 10000000000000000000000000000)).toString() //musti dibuat random angka
        const storeName = "Shopee 1"
        const storeID = 1323
        const cur_date = new Date()
        const utcOffset = -7 * 60; // UTC offset in minutes (+07:00)
        const localOffset = cur_date.getTimezoneOffset();
        cur_date.setMinutes(cur_date.getMinutes() - (utcOffset + localOffset)); //Adjusting for the +07:00 offset

        const y = cur_date.getFullYear();
        const mm= ('0'+(cur_date.getMonth()+1)).slice(-2);
        const d = ('0'+cur_date.getDate()).slice(-2);
        const h = ('0'+cur_date.getHours()).slice(-2);
        const m = ('0'+cur_date.getMinutes()).slice(-2);
        const s = ('0'+cur_date.getSeconds()).slice(-2);
        const ms = cur_date.getMilliseconds();

        const dateParam = y+"-"+mm+"-"+d+"T"+h+":"+m+":"+s+"."+ms+"+07:00";

        cy.log(id, local_id, dateParam);

        cy.request({
            method: "POST",
            url: urlMP,
            headers: {
                Key: key
            },
            body: {
                event: "orders/create",
                order: {
                    id: id,
                    status: "Open",
                    channel: channel,
                    channel_id: 12,
                    local_id: local_id,
                    local_name: localName,
                    store_name: storeName,
                    store_id: storeID,
                    profile_id: 198,
                    address: {
                        address_1: "Jl. POS PENGUMBEN, KEBON JERUK, DKI JAKARTA, ID, 11540",
                        address_2: "",
                        city: "KOTA JAKARTA BARAT",
                        country: "Indonesia",
                        name: "Testing QA MP_"+y+mm+d+"_"+h+m+s, //date
                        phone: "62800001905",
                        postal_code: "11540",
                        province: "DKI JAKARTA",
                        province_code: "DKI JAKARTA",
                        sub_district: "",
                        district: "KEBON JERUK",
                        coordinate: null,
                        formatted: "Jl.POS PENGUMBEN NO.26 Rt.010 / Rw.004, KOTA JAKARTA BARAT, KEBON JERUK, DKI JAKARTA, ID, 11540"
                    },
                    customer_info: {
                        id: 50018106,
                        name: "Testing QA MP_"+y+mm+d+"_"+h+m+s, //date
                        email: "",
                        customer_since: "2022-05-24 15:28:12"
                    },
                    dropshipper_info: {
                        id: 16284861,
                        name: null,
                        phone: null
                    },
                ordered_at: dateParam,
                created_at: dateParam,
                updated_at: dateParam,
                item_lines: [
                    {
                      id: 133209738,
                      local_id: "0-8643115006",              
                      sku: skus, //ganti jika ganti produk
                      name: "", //ganti jika ganti produk
                      variant_name: "", //ganti jika ganti produk
                      variant_id: 132606, //ganti jika ganti produk
                      variant_sku: skus, //ganti jika ganti produk
                      price: 1290000, //ganti jika ganti produk
                      sale_price: price, //ganti jika ganti produk
                      total_price: price, //ganti jika ganti produk
                      voucher_amount: 0,
                      voucher_code: null,              
                      voucher_seller: 0,
                      tax_price: 0,
                      fulfill_by_channel: false,
                      shipping_provider: "Reguler (Cashless)",
                      shipping_provider_type: "Reguler (Cashless)",
                      tracking_number: null,
                      note: null,
                      internal_note: null,
                      bundle_info: []
                    }
                  ],
                    payment: {
                        payment_method: "Online Payment",
                        status: "Payment Verified"
                    },
                    shipping_price: 10000,
                    disc_shipping_seller: 0,
                    disc_shipping_platform: 0,
                    shipping_courier: {
                        awb: null,
                        document_path: "",
                        booking_code: null,
                        delivery_type: "NON INTEGRATED",
                        channel_docs_path: null,
                        logistic_destination_code: null,
                        expedition: "Reguler (Cashless)",
                        city: "KOTA JAKARTA PUSAT",
                        postalCode: "11550"
                    },
                    shipping_provider: "Reguler (Cashless)",
                    shipping_provider_type: "Reguler (Cashless)",
                    shipping_description: null,
                    subtotal: 218000,
                    channel_rebate: 0,
                    cashless: true,
                    discount_amount: 0,
                    voucher_seller: 0,
                    total_price: 218000,
                    voucher_code: "",
                    insurance_fee: 0,
                    discount_reason: null,
                    tax_price: 0,
                    warehouse_id: 195,
                    cod: false,
                    delivery_type: null,
                    warehouse_code: null,
                    note: null,
                    internal_note: null,
                    returns: []
                    }
                }
        })
        .should(response => {
            expect(response.status).to.equal(200)
        })
    })

    it("Cek Database Forstokorders", () => {
        //const local_id = "8294943204" //tes yg udah jadi
        const db_MP = Cypress.env('DB_MP')
        const db_Collection = Cypress.env('DB_COLLECTION_FORSTOKORDER')
        cy.wait(30000)

        cy.task('mongodb:findOne', {
            database: db_MP,
            collection: db_Collection,
            query: {
                localId: local_id
            }
        })
        .should(result => {
            expect(result).to.have.property('_id')
            expect(result).to.have.property('note', null)
            expect(result).to.have.property('status', 'Open')
            expect(result).to.have.property('localId', local_id)
            expect(result).to.have.property('localName', localName)
            expect(result).to.have.property('orderNumber') 
        })
        .then(result => {
            //get ordernumber dari query
            Cypress.env("MP_ORDERNUMBER", result.orderNumber)
            cy.log("Order Number: ", Cypress.env("MP_ORDERNUMBER"))
        })
    })

    it("Cek Database Order", () => {
        //const order_number = "359050020240213161" //tes yg udah jadi
        const order_number = Cypress.env("MP_ORDERNUMBER")
        const db_Order = Cypress.env('DB_PRODUCTS')
        const db_Collection = Cypress.env('DB_COLLECTION_ORDERS')
        cy.log(db_Order)
        cy.log(db_Collection)
        //const local_id = ""
        cy.task('mongodb:findOne', {
            database: db_Order,
            collection: db_Collection,
            query: {
                orderNumber: order_number
            }
        })
        .should(result => {
            expect(result).to.have.property('orderNumber',order_number)
        })
    })
})
/*  1. callback / create order MP (done)
    2. wait sblm cek db 20-30 detik (ada kemungkinan lbh dari itu jadi ada retry)
    3. koneksi cypress mongo (done)
    4. cek forstok order (done)
    5. cek forstok error klo ada stock habis
    6. cek cart
    7. cek order*/