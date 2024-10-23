const urlMP = Cypress.config("baseUrlMP")


const local_id = Math.floor(Math.random() * 10000000000).toString() //random id
const localName = "999AutomationQAMP999"

//const skus = "112250061" //dibuat SKU array?
//const price = 130000 //159000
const sku_array = [[101060473,179000,10000], [101060473,179000,10000], [101060466,329000,20000], [101060459,89000,0], [101060459,89000,0]]




describe('Callback create order MP', () => {
    it("Callback create order MP", () => {
        const key = Cypress.env('MP_KEY')
        const channel = "Shopee"
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

        const y = cur_date.getFullYear();
        const mm= ('0'+(cur_date.getMonth()+1)).slice(-2);
        const d = ('0'+cur_date.getDate()).slice(-2);
        const h = ('0'+cur_date.getHours()).slice(-2);
        const m = ('0'+cur_date.getMinutes()).slice(-2);
        const s = ('0'+cur_date.getSeconds()).slice(-2);
        const ms = cur_date.getMilliseconds();

        const dateParam = y+"-"+mm+"-"+d+"T"+h+":"+m+":"+s+"."+ms+"+07:00";

        const item_lines = sku_array.map(item_sku => {
            const [sku, normal_price, discount] = item_sku;
            const sku_MP_price = normal_price - discount
        
            // Create an object for each item
            return {
                id: 133209738,
                local_id: "0-8643115006",
                sku: sku,
                name: "",
                variant_name: "",
                variant_id: sku,
                variant_sku: sku,
                price: sku_MP_price,
                sale_price: sku_MP_price,
                total_price: sku_MP_price,
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
            };
        });

        const subtotal_MP = item_lines.reduce((acc, item) => acc + item.price, 0);

        //cy.log(id, local_id, dateParam);

        cy.api({
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
                    item_lines: item_lines,
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
                    subtotal: subtotal_MP, //ganti jika produk ganti
                    channel_rebate: 0,
                    cashless: true,
                    discount_amount: 0,
                    voucher_seller: 0,
                    total_price: subtotal_MP, //ganti jika produk ganti
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
            expect(response.status, 'Response status should be 200').to.equal(200)
            //expect(response.message, 'Response message should be Success').to.equal("Success")
            //expect(response.data, 'Response message should "successfully process order"').to.equal("successfully process order")
        })
    })

    // it("Cek Database Forstokorders", () => {
    //     //const local_id = "8294943204" //tes yg udah jadi
    //     const db_MP = Cypress.env('DB_MP')
    //     const db_Collection = Cypress.env('DB_COLLECTION_FORSTOKORDER')
    //     cy.wait(30000)

    //     cy.task('mongodb:findOne', {
    //         database: db_MP,
    //         collection: db_Collection,
    //         query: {
    //             localId: local_id
    //         }
    //     })
    //     .should(result => {
    //         const item_lines = result.itemLines

    //         expect(result).to.have.property('_id')
    //         expect(result).to.have.property('note', null)
    //         expect(result).to.have.property('customerInfo') 
    //         expect(result).to.have.property('itemLines') 
    //         expect(result).to.have.property('status', 'Open')
    //         expect(result).to.have.property('localId', local_id)
    //         expect(result).to.have.property('localName', localName)
    //         expect(result).to.have.property('shippingPrice') 
    //         expect(result).to.have.property('storeName') 
    //         expect(result).to.have.property('storeId') 
    //         expect(result).to.have.property('orderNumber')
    //         item_lines.forEach(function(item){
    //             expect(item).to.have.property('sku') 
    //             expect(item).to.have.property('price') 
    //             expect(item).to.have.property('salePrice') 
    //             expect(item).to.have.property('totalPrice') 
    //         })

    //         expect(result.subtotal).to.equal(price) 
    //         expect(result.totalPrice).to.equal(price) 

    //         const item_length = result.itemLines.lenght

    //         for(let i = 0; i < item_length; i++){
    //             expect(result.itemLines[i].sku, `SKU should be ${skus}`).to.equal(skus) 
    //             expect(result.itemLines[i].price, `Price should be ${price}`).to.equal(price) 
    //             expect(result.itemLines[i].salePrice, `Sale Price should be ${price}`).to.equal(price) 
    //             expect(result.itemLines[i].totalPrice, `Total Price should be ${price}`).to.equal(price) 
    //         }

    //     })
    //     .then(result => {
    //         //get ordernumber dari query
    //         Cypress.env("MP_ORDERNUMBER", result.orderNumber)
    //         cy.log("Order Number: ", Cypress.env("MP_ORDERNUMBER"))
    //         //cek price price nya
    //     })
    // })

    // it("Cek Database Order", () => {
    //     //const order_number = "359050020240213161" //tes yg udah jadi
    //     const order_number = Cypress.env("MP_ORDERNUMBER")
    //     const db_Order = Cypress.env('DB_PRODUCTS')
    //     const db_Collection = Cypress.env('DB_COLLECTION_ORDERS')
        
    //     //const local_id = ""
    //     cy.task('mongodb:findOne', {
    //         database: db_Order,
    //         collection: db_Collection,
    //         query: {
    //             orderNumber: order_number
    //         }
    //     })
    //     .should(result => {
    //         const items = result.items
    //         const items_length = result.items.length

    //         expect(result).to.have.property('items')
    //         expect(result).to.have.property('orderNumber',order_number)

    //         for(let i = 0; i < items_length; i++){
    //             expect(items[i]).to.have.property('promoNumber')
    //             expect(items[i]).to.haveOwnProperty("price") //normal price
    //             expect(items[i]).to.haveOwnProperty("discountedPrice") //normal price
    //             expect(items[i]).to.haveOwnProperty("subTotal") //normal price

    //             if(items[i].promoNumber !== ""){
    //                 expect(items[i].grandTotal, `Grand Total for GWP should be 0`).to.equal(0)
    //             } else {
    //                 const normal_price = items[i].price
    //                 const price_discount = normal_price - price

    //                 //calculate discount
    //                 expect(items[i].valueDiscount, `Value discount should be ${price_discount}`).to.equal(price_discount) //discount amount
    //                 expect(items[i].promoAmount, `Promo amount should be ${price_discount}`).to.equal(price_discount) //discount amount

    //                 expect(items[i].grandTotal, `Grand Total should be ${price}`).to.equal(price)
    //             }
    //         }
    //     })
    // })
})
/*  1. callback / create order MP (done)
    2. wait sblm cek db 20-30 detik (ada kemungkinan lbh dari itu jadi ada retry)
    3. koneksi cypress mongo (done)
    4. cek forstok order (done)
    5. cek forstok error klo ada stock habis
    6. cek cart
    7. cek order
    
    catatan untuk tambahan: 
    1. sku ditambahkan jadi misal SKU 1 qty 1, SKU 2 qty 2, SKU 3 qty 3
    2. logic untuk ngecek qty nya bener ga 
    3. voucher amount/promo amount di payload 
    
    logic sku: perlu cari SKU yg sama berapa banyak jumlahn*/