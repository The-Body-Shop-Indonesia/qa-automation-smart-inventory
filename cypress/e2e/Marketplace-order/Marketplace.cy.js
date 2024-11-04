const urlMP = Cypress.config('baseUrlMP')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_USER = Cypress.config('baseUrlUser')

const local_id = Math.floor(Math.random() * 10000000000).toString() //random id
const localName = '999AutomationQAMP999'

let sku_array = []

// Add Product A (quantity: 2)
const qty_sku_1 = 2
const sku_product_1 = '113500161'
const sku_1 = Array(qty_sku_1).fill([sku_product_1, 149000, 10000])

const qty_sku_2 = 2
const sku_product_2 = '112520870'
const sku_2 = Array(qty_sku_2).fill([sku_product_2, 139000, 0])

const qty_sku_3 = 1
const sku_product_3 = '155060173'
const sku_3 = Array(qty_sku_3).fill([sku_product_3, 129000, 25000])

sku_array = sku_array.concat(sku_1, sku_2, sku_3)

const item_lines = sku_array.map((item_sku) => {
  const [sku, normal_price, discount, qty] = item_sku
  const sku_MP_price = normal_price - discount

  Cypress.env('SKU_MP_PRICE', sku_MP_price)

  // Create an object for each item
  return {
    id: 133209738,
    local_id: '0-8643115006',
    sku: sku,
    name: '',
    variant_name: '',
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
    shipping_provider: 'Reguler (Cashless)',
    shipping_provider_type: 'Reguler (Cashless)',
    tracking_number: null,
    note: null,
    internal_note: null,
    bundle_info: []
  }
})

const grand_total_MP = item_lines.reduce((acc, item) => acc + item.price, 0)
//console.log(grand_total_MP)

const sku_grouping = sku_array.reduce((acc, item) => {
  const [sku, normal_price, discount] = item
  const sku_MP_price = normal_price - discount
  //const grand_total_sku = sku_MP_price * qty
  // Jika SKU sudah ada di accumulator, tambahkan qty
  if (acc[sku]) {
    acc[sku].qty += 1
    acc[sku].grand_total += sku_MP_price
  } else {
    // Jika SKU belum ada, tambahkan ke accumulator
    acc[sku] = {
      normal_price,
      discount,
      qty: 1,
      grand_total: sku_MP_price
    }
  }
  return acc
}, {})

//console.log('Test SKU grouping: ', sku_grouping)

describe('Callback create order MP', () => {
  // it('Callback create order MP', () => {
  //   const key = Cypress.env('MP_KEY')
  //   const channel = 'Shopee'
  //   const id = BigInt(
  //     Math.floor(Math.random() * 10000000000000000000000000000)
  //   ).toString() //musti dibuat random angka
  //   const storeName = 'Shopee 1'
  //   const storeID = 1323
  //   const cur_date = new Date()
  //   const utcOffset = -7 * 60 // UTC offset in minutes (+07:00)
  //   const localOffset = cur_date.getTimezoneOffset()
  //   cur_date.setMinutes(cur_date.getMinutes() - (utcOffset + localOffset)) //Adjusting for the +07:00 offset

  //   const y = cur_date.getFullYear()
  //   const mm = ('0' + (cur_date.getMonth() + 1)).slice(-2)
  //   const d = ('0' + cur_date.getDate()).slice(-2)
  //   const h = ('0' + cur_date.getHours()).slice(-2)
  //   const m = ('0' + cur_date.getMinutes()).slice(-2)
  //   const s = ('0' + cur_date.getSeconds()).slice(-2)
  //   const ms = cur_date.getMilliseconds()

  //   const dateParam =
  //     y + '-' + mm + '-' + d + 'T' + h + ':' + m + ':' + s + '.' + ms + '+07:00'

  //   //cy.log(id, local_id, dateParam);

  //   cy.api({
  //     method: 'POST',
  //     url: urlMP,
  //     headers: {
  //       Key: key
  //     },
  //     body: {
  //       event: 'orders/create',
  //       order: {
  //         id: id,
  //         status: 'Open',
  //         channel: channel,
  //         channel_id: 12,
  //         local_id: local_id,
  //         local_name: localName,
  //         store_name: storeName,
  //         store_id: storeID,
  //         profile_id: 198,
  //         address: {
  //           address_1: 'Jl. POS PENGUMBEN, KEBON JERUK, DKI JAKARTA, ID, 11540',
  //           address_2: '',
  //           city: 'KOTA JAKARTA BARAT',
  //           country: 'Indonesia',
  //           name: 'Testing QA MP_' + y + mm + d + '_' + h + m + s, //date
  //           phone: '62800001905',
  //           postal_code: '11540',
  //           province: 'DKI JAKARTA',
  //           province_code: 'DKI JAKARTA',
  //           sub_district: '',
  //           district: 'KEBON JERUK',
  //           coordinate: null,
  //           formatted:
  //             'Jl.POS PENGUMBEN NO.26 Rt.010 / Rw.004, KOTA JAKARTA BARAT, KEBON JERUK, DKI JAKARTA, ID, 11540'
  //         },
  //         customer_info: {
  //           id: 50018106,
  //           name: 'Testing QA MP_' + y + mm + d + '_' + h + m + s, //date
  //           email: '',
  //           customer_since: '2022-05-24 15:28:12'
  //         },
  //         dropshipper_info: {
  //           id: 16284861,
  //           name: null,
  //           phone: null
  //         },
  //         ordered_at: dateParam,
  //         created_at: dateParam,
  //         updated_at: dateParam,
  //         item_lines: item_lines,
  //         payment: {
  //           payment_method: 'Online Payment',
  //           status: 'Payment Verified'
  //         },
  //         shipping_price: 10000,
  //         disc_shipping_seller: 0,
  //         disc_shipping_platform: 0,
  //         shipping_courier: {
  //           awb: null,
  //           document_path: '',
  //           booking_code: null,
  //           delivery_type: 'NON INTEGRATED',
  //           channel_docs_path: null,
  //           logistic_destination_code: null,
  //           expedition: 'Reguler (Cashless)',
  //           city: 'KOTA JAKARTA PUSAT',
  //           postalCode: '11550'
  //         },
  //         shipping_provider: 'Reguler (Cashless)',
  //         shipping_provider_type: 'Reguler (Cashless)',
  //         shipping_description: null,
  //         subtotal: grand_total_MP, //ganti jika produk ganti
  //         channel_rebate: 0,
  //         cashless: true,
  //         discount_amount: 0,
  //         voucher_seller: 0,
  //         total_price: grand_total_MP, //ganti jika produk ganti
  //         voucher_code: '',
  //         insurance_fee: 0,
  //         discount_reason: null,
  //         tax_price: 0,
  //         warehouse_id: 195,
  //         cod: false,
  //         delivery_type: null,
  //         warehouse_code: null,
  //         note: null,
  //         internal_note: null,
  //         returns: []
  //       }
  //     }
  //   }).should((response) => {
  //     expect(response.status, 'Response status should be 200').to.equal(200)
  //     expect(
  //       response.body.message,
  //       'Response message should be Success'
  //     ).to.equal('Success')
  //     expect(
  //       response.body.data,
  //       'Response message should "successfully process order"'
  //     ).to.equal('successfully process order')
  //   })
  // })

  it('Check Database Forstokorders', () => {
    const local_id = '5699917431' //tes yg udah jadi
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
      .should((result) => {
        const item_lines = result.itemLines
        const item_length = item_lines.length

        expect(result).to.have.property('_id')
        expect(result).to.have.property('note', null)
        expect(result).to.have.property('customerInfo')
        expect(result).to.have.property('itemLines')
        expect(result).to.have.property('status', 'Open')
        expect(result).to.have.property('localId', local_id)
        expect(result).to.have.property('localName', localName)
        expect(result).to.have.property('shippingPrice')
        expect(result).to.have.property('storeName')
        expect(result).to.have.property('storeId')
        expect(result).to.have.property('orderNumber')
        item_lines.forEach(function (item) {
          expect(item).to.have.property('sku')
          expect(item).to.have.property('price')
          expect(item).to.have.property('salePrice')
          expect(item).to.have.property('totalPrice')
        })

        expect(item_lines).to.have.length(3)
        expect(
          result.subtotal,
          `Subtotal should be ${grand_total_MP}`
        ).to.equal(grand_total_MP)
        expect(
          result.totalPrice,
          `Total Price should be ${grand_total_MP}`
        ).to.equal(grand_total_MP)

        for (let i = 0; i < item_length; i++) {
          //console.log("test")
          if (result.itemLines[i].sku == sku_product_1) {
            expect(
              result.itemLines[i].sku,
              `SKU should be ${sku_product_1}`
            ).to.equal(sku_product_1)
            //console.log("Test 123",sku_grouping[sku_product_1])
            expect(
              result.itemLines[i].qty,
              `QTY should be ${sku_grouping[sku_product_1].qty}`
            ).to.equal(sku_grouping[sku_product_1].qty)
            expect(
              result.itemLines[i].price,
              `Price should be ${sku_grouping[sku_product_1].grand_total}`
            ).to.equal(sku_grouping[sku_product_1].grand_total)
            expect(
              result.itemLines[i].salePrice,
              `Sale Price should be ${sku_grouping[sku_product_1].grand_total}`
            ).to.equal(sku_grouping[sku_product_1].grand_total)
            expect(
              result.itemLines[i].totalPrice,
              `Total Price should be ${sku_grouping[sku_product_1].grand_total}`
            ).to.equal(sku_grouping[sku_product_1].grand_total)
          } else if (result.itemLines[i].sku == sku_product_2) {
            expect(
              result.itemLines[i].sku,
              `SKU should be ${sku_product_2}`
            ).to.equal(sku_product_2)
            //console.log("Test 123",sku_grouping[sku_product_1])
            expect(
              result.itemLines[i].qty,
              `QTY should be ${sku_grouping[sku_product_2].qty}`
            ).to.equal(sku_grouping[sku_product_2].qty)
            expect(
              result.itemLines[i].price,
              `Price should be ${sku_grouping[sku_product_2].grand_total}`
            ).to.equal(sku_grouping[sku_product_2].grand_total)
            expect(
              result.itemLines[i].salePrice,
              `Sale Price should be ${sku_grouping[sku_product_2].grand_total}`
            ).to.equal(sku_grouping[sku_product_2].grand_total)
            expect(
              result.itemLines[i].totalPrice,
              `Total Price should be ${sku_grouping[sku_product_2].grand_total}`
            ).to.equal(sku_grouping[sku_product_2].grand_total)
          } else if (result.itemLines[i].sku == sku_product_3) {
            expect(
              result.itemLines[i].sku,
              `SKU should be ${sku_product_3}`
            ).to.equal(sku_product_3)
            //console.log("Test 123",sku_grouping[sku_product_1])
            expect(
              result.itemLines[i].qty,
              `QTY should be ${sku_grouping[sku_product_3].qty}`
            ).to.equal(sku_grouping[sku_product_3].qty)
            expect(
              result.itemLines[i].price,
              `Price should be ${sku_grouping[sku_product_3].grand_total}`
            ).to.equal(sku_grouping[sku_product_3].grand_total)
            expect(
              result.itemLines[i].salePrice,
              `Sale Price should be ${sku_grouping[sku_product_3].grand_total}`
            ).to.equal(sku_grouping[sku_product_3].grand_total)
            expect(
              result.itemLines[i].totalPrice,
              `Total Price should be ${sku_grouping[sku_product_3].grand_total}`
            ).to.equal(sku_grouping[sku_product_3].grand_total)
          }
        }
      })
      .then((result) => {
        //get ordernumber dari query
        Cypress.env('MP_ORDERNUMBER', result.orderNumber)
        cy.log('Order Number: ', Cypress.env('MP_ORDERNUMBER'))
        //cek price price nya
      })
  })

  it('Check Database Order', () => {
    //const order_number = '359050020240213798' //tes yg udah jadi
    const order_number = Cypress.env('MP_ORDERNUMBER')
    const db_Order = Cypress.env('DB_PRODUCTS')
    const db_Collection = Cypress.env('DB_COLLECTION_ORDERS')

    //const local_id = ""
    cy.task('mongodb:findOne', {
      database: db_Order,
      collection: db_Collection,
      query: {
        orderNumber: order_number
      }
    })
      .should((result) => {
        const items = result.items
        const items_length = result.items.length

        items.forEach(function (item) {
          expect(item).to.have.property('qty')
          expect(item).to.have.property('promoNumber')
          expect(item).to.haveOwnProperty('price') //normal price
          expect(item).to.haveOwnProperty('discountedPrice') //normal price
          expect(item).to.haveOwnProperty('subTotal') //normal price
          expect(item).to.have.property('sku')
        })

        expect(result).to.have.property('items')
        expect(result).to.have.property('orderNumber', order_number)
        expect(
          result.totalAmount,
          `Total Amount should be ${grand_total_MP}`
        ).to.equal(grand_total_MP)
        expect(
          result.paymentAmount,
          `Payment Amount should be ${grand_total_MP}`
        ).to.equal(grand_total_MP)

        for (let i = 0; i < items_length; i++) {
          if (items[i].promoNumber !== '') {
            expect(
              items[i].grandTotal,
              `Grand Total for GWP should be 0`
            ).to.equal(0)
            expect(
              items[i].isFreeProduct,
              `isFreeProduct should be true`
            ).to.equal(true)
          } else {
            if (items[i].sku == sku_product_1) {
              const normal_price = sku_grouping[sku_product_1].normal_price
              const sku_qty = sku_grouping[sku_product_1].qty
              const subtotal_sku = normal_price * sku_qty
              const grand_total_MP = sku_grouping[sku_product_1].grand_total
              const discount_price = subtotal_sku - grand_total_MP

              expect(items[i].qty).to.equal(sku_grouping[sku_product_1].qty)
              expect(items[i].sku).to.equal(sku_product_1)

              expect(
                items[i].valueDiscount,
                `Value discount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].promoAmount,
                `Promo amount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].grandTotal,
                `Grand Total should be ${grand_total_MP}`
              ).to.equal(grand_total_MP)
            } else if (items[i].sku == sku_product_2) {
              const normal_price = sku_grouping[sku_product_2].normal_price
              const sku_qty = sku_grouping[sku_product_2].qty
              const subtotal_sku = normal_price * sku_qty
              const grand_total_MP = sku_grouping[sku_product_2].grand_total
              const discount_price = subtotal_sku - grand_total_MP

              expect(items[i].qty).to.equal(sku_grouping[sku_product_2].qty)
              expect(items[i].sku).to.equal(sku_product_2)

              expect(
                items[i].valueDiscount,
                `Value discount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].promoAmount,
                `Promo amount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].grandTotal,
                `Grand Total should be ${grand_total_MP}`
              ).to.equal(grand_total_MP)
            } else if (items[i].sku == sku_product_3) {
              const normal_price = sku_grouping[sku_product_3].normal_price
              const sku_qty = sku_grouping[sku_product_3].qty
              const subtotal_sku = normal_price * sku_qty
              const grand_total_MP = sku_grouping[sku_product_3].grand_total
              const discount_price = subtotal_sku - grand_total_MP

              expect(items[i].qty).to.equal(sku_grouping[sku_product_3].qty)
              expect(items[i].sku).to.equal(sku_product_3)

              expect(
                items[i].valueDiscount,
                `Value discount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].promoAmount,
                `Promo amount should be ${discount_price}`
              ).to.equal(discount_price) //discount amount
              expect(
                items[i].grandTotal,
                `Grand Total should be ${grand_total_MP}`
              ).to.equal(grand_total_MP)
            }
          }
        }
      })
      .then((result) => {
        const items = result.items
        const paymentAmount = result.paymentAmount
        const storeCode = result.store.storeCode
        Cypress.env('PAYMENT_AMOUNT', paymentAmount)
        Cypress.env('STORE_CODE', storeCode)

        const items_length = result.items.length
        const gwp_array = []

        for (let i = 0; i < items_length; i++) {
          if (items[i].promoNumber !== '') {
            gwp_array.push(items[i])
            Cypress.env('PRODUCT_GWP', gwp_array)
            console.log(Cypress.env('PRODUCT_GWP'))
            const test = Cypress.env('PRODUCT_GWP').length
            cy.log('Product qty GWP: ', test)
          }
        }
      })
  })

  it('Check cart rule', () => {
    //login admin
    const urlUser = URL_USER + '/admin/login'
    const username_adm = Cypress.env('ADMIN_USERNAME')
    const password_adm = Cypress.env('ADMIN_PASSWORD')

    cy.api({
      method: 'POST',
      url: urlUser,
      body: {
        username: username_adm,
        password: password_adm
      }
    }).then((response) => {
      const adminToken = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_ADMIN', {
        Authorization: 'Bearer ' + adminToken
      })

      //const url_cartrule_detail = URL_PRODUCT + `/cart-rule/get/${promo_id}`
      const product_gwp = Cypress.env('PRODUCT_GWP')
      cy.log(`Order have ${product_gwp.length} GWP`)

      for (let i = 0; i < product_gwp.length; i++) {
        const gwp_pn = product_gwp[i].promoNumber
        const gwp_qty = product_gwp[i].qty
        const gwp_sku = product_gwp[i].sku
        cy.log('GWP PN: ', gwp_pn)
        cy.log('GWP qty: ', gwp_qty)
        cy.log('GWP sku: ', gwp_sku)
        const url_cartrule_list =
          URL_PRODUCT +
          `/cart-rule/?page=1&limit=10&keyword=${gwp_pn}&is_exclusive=false&is_discard=false`
        cy.log(url_cartrule_list)

        cy.api({
          method: 'GET',
          url: url_cartrule_list,
          headers: Cypress.env('REQUEST_HEADERS_ADMIN')
        }).should((response) => {
          const docs = response.body.data.docs[0]
          expect(response.status, 'Response status should be 200').to.equal(200)
          expect(docs.promoNumber, `Promo Number should be ${gwp_pn}`).to.equal(
            gwp_pn
          )
          //check if order condition match with promo condition
          const rawTermsData = response.body.data.docs[0].rawTermsData
          const promoTerm = JSON.parse(rawTermsData)
          console.log(promoTerm)

          const total_value = parseInt(promoTerm[0].value)
          const rawStoreCode = promoTerm[1].value
          const store_code = rawStoreCode.split(';')

          expect(
            store_code,
            `Store code ${Cypress.env('STORE_CODE')} should be in store condition`
          ).to.include(Cypress.env('STORE_CODE'))
          expect(
            Cypress.env('PAYMENT_AMOUNT'),
            `Total value in order should be greater than ${total_value}`
          ).to.be.greaterThan(total_value)

          const rawEffect = response.body.data.docs[0].rawEffectData
          const promoEffect = JSON.parse(rawEffect)

          const type_promo = promoEffect.type
          const qty_promo = parseInt(promoEffect.value)
          const sku_promo = promoEffect.optionalVal1

          console.log('Type Promo:', type_promo)
          console.log('Quantity Promo:', qty_promo)
          console.log('SKU Promo:', sku_promo)

          //check if gwp match with promo reward
          expect(
            gwp_qty,
            `Quantity GWP in order should be ${qty_promo}`
          ).to.equal(qty_promo)
          expect(gwp_sku, `SKU GWP in order should be ${sku_promo}`).to.equal(
            sku_promo
          )
        })
      }
    })

    // cy.api({
    //   method: 'GET',
    //   url,
    //   headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    // }).should((response) => {
    //   expect(response.status).to.equal(200)
    //   expect(response.promoNumber).to.equal(gwp_pn)
    // })
  })
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
