// Definisikan getDynamicVoucherCode di luar hook dan describe

function getDynamicVoucherCode(baseVoucherCode) {
  // Dapatkan nomor terakhir dari file JSON di fixtures
  return cy.readFile('cypress/fixtures/lastVoucherNumber.json').then((data) => {
    let currentNumber = data.lastVoucherNumber || 1
    const formattedNumber = String(currentNumber).padStart(2, '0') // Tambahkan '0' di depan jika kurang dari 10
    Cypress.env('VoucherCode', `${baseVoucherCode}-${formattedNumber}`)
    // Simpan nomor terbaru ke file JSON untuk iterasi berikutnya
    return cy
      .writeFile('cypress/fixtures/lastVoucherNumber.json', {
        lastVoucherNumber: currentNumber + 1
      })
      .then(() => Cypress.env('VoucherCode'))
  })
}

const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const baseVoucherCode = 'TESTCASH002-Mils'
let voucherCode
// let RespondataVoucher
describe('Get Last Voucher Code', () => {
  before('User Login', () => {
    const url_user = URL_USER + '/otp/validate'
    const url_admin = URL_USER + '/admin/login'

    // Login sebagai User
    cy.api({
      method: 'POST',
      url: url_user,
      body: {
        identifier: Cypress.env('identifier_user'),
        otp: Cypress.env('otp_user'),
        pageType: 'Login'
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
        const userToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + userToken,
          Channel: 'web'
        })
      })

    // Login sebagai Admin
    cy.api({
      method: 'POST',
      url: url_admin,
      body: {
        username: Cypress.env('ADMIN_USERNAME'),
        password: Cypress.env('ADMIN_PASSWORD')
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
        const adminToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS_ADMIN', {
          Authorization: 'Bearer ' + adminToken
        })
      })
  })

  before('Generate Voucher Code', () => {
    // Menghasilkan kode voucher dinamis sebelum semua tes dijalankan
    getDynamicVoucherCode(baseVoucherCode).then((code) => {
      voucherCode = code
      cy.log('Generated Voucher Code:', voucherCode)
    })
  })

  before('Cek Stok', () => {
    // Muat data dari fixture
    cy.fixture('skus').then((data) => {
      const sku = data.skuCashVouchers // Ambil SKU dari fixture
      const key = `stock:${sku}-34999-stock` // Buat key dengan SKU yang diambil
      const amount = 10 // jumlah stok yang ingin ditambahkan

      cy.task('addStock', { key, amount }, { timeout: 30000 }).should('exist')
      // cy.task('addStock', { key, amount }, { timeout: 10000 }).then(
      //   (newStock) => {
      //     cy.log(`Stok baru adalah: ${newStock}`)
      //     expect(newStock).to.be.a('number')
      //     // cy.log(`Stok baru adalah: ${newStock}`)
      //     expect(newStock).to.be.a('number')
      //   }
      // )
    })
  })

  it('Shows voucher Code Last', () => {
    cy.log('Generated Voucher Code:', voucherCode)
  })
})

describe('Show Cash Voucher in Detail Voucher', () => {
  let RespondataVoucher
  it('Shows cash voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_voucherDetail = URL_PRODUCT + '/admin/voucher/vms/voucher-detail'

    cy.api({
      method: 'GET',
      url: url_voucherDetail,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 50,
        sort: '-updatedAt',
        keywords: voucherCode
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const ResponbodyVoucher = response.body
      const dataVoucher = response.body.data.docs
      RespondataVoucher = response.body.data.docs[0]
      expect(ResponbodyVoucher.statusCode).to.equal(200)
      if (Array.isArray(dataVoucher)) {
        dataVoucher.forEach((doc) => {
          const { _id, redeemStatus, voucherCode, expiryDate, voucherAmount } =
            doc
          // Only log if redeemStatus is "AVAILABLE" and the voucher has not expired
          if (redeemStatus === 'AVAILABLE') {
            const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            const expiry = new Date(expiryDate).toISOString().split('T')[0]

            // Only log vouchers that have not expired
            if (expiry >= today) {
              // Prepare a single string to log voucher details
              let voucherDetails = `Voucher ID: ${_id}, Redeem Status: ${redeemStatus}, TBS Code Voucher: ${voucherCode}, Voucher Amount:${voucherAmount}`

              // Add expiryDate to the log
              voucherDetails += `, Expiry Date: ${expiryDate}`

              // Log all details in one line
              cy.log(voucherDetails)
            }
          }
        })
      } else {
        cy.log('Data docs not found or not an array')
      }
    })
  })

  let requestBodyCart
  let requestBodyShipment
  let requestBodyAddress
  it('Should be able to add product to cart', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_bulkCart = URL_PRODUCT + '/cart/add/bulk'
    const url_delete_allcart = URL_PRODUCT + '/cart/remove-all-item'
    Cypress.env('SKU1', {
      sku: '101060431',
      qty: 1,
      name: 'ALOE CREAM CLEANSER 125ML'
    })
    Cypress.env('SKU2', { sku: '101060438', qty: 1, name: 'ALOE TONER 250ML' })

    requestBodyCart = {
      data: [
        {
          sku: Cypress.env('SKU1').sku,
          qty: Cypress.env('SKU1').qty
        },
        {
          sku: Cypress.env('SKU2').sku,
          qty: Cypress.env('SKU2').qty
        }
      ]
    }

    // Step 1: Check if the cart has any items
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/cart/my-cart',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      }
    }).then((response) => {
      const items = response.body.data.items || []

      if (items.length > 0) {
        // Step 2: If cart has items, delete all items
        cy.request({
          method: 'PATCH',
          url: url_delete_allcart,
          headers: {
            ...Cypress.env('REQUEST_HEADERS'),
            Channel: 'web'
          }
        }).then(() => {
          expect(response.status).to.eq(200)
          // Proceed with adding items to cart after clearing the cart
          addToCart(
            url_add_bulkCart,
            requestBodyCart,
            Cypress.env('SKU1'),
            Cypress.env('SKU2')
          )
        })
      } else {
        // If cart is already empty, proceed directly with adding items
        addToCart(
          url_add_bulkCart,
          requestBodyCart,
          Cypress.env('SKU1'),
          Cypress.env('SKU2')
        )
      }
    })
    // Function to add items to cart and validate response

    function addToCart(url_add_bulkCart, requestBodyCart) {
      const sku1 = Cypress.env('SKU1')
      const sku2 = Cypress.env('SKU2')

      cy.api({
        method: 'POST',
        url: url_add_bulkCart,
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
          // Channel: 'web' // Add header Channel
        },
        body: requestBodyCart
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        Cypress.env('Cart', body.data)
        // const postDataRespon = body.data
        const items = Cypress.env('Cart').items
        // cy.log(Cypress.env('Cart')._id, 'id cart')

        // Validate item 1
        expect(items[0].product.sku, 'sku Code1:').to.eq(sku1.sku)
        expect(items[0].product.name, 'Nama SKU1:').to.eq(sku1.name)
        expect(items[0].qty, 'QTY SKU1:').to.eq(sku1.qty)
        expect(items[0].sub_total, 'Sub Total SKU1').to.eq(
          items[0].product.price * sku1.qty
        )
        // Validate item 2
        expect(items[1].product.sku, 'sku Code2:').to.eq(sku2.sku)
        expect(items[1].product.name, 'Nama SKU2:').to.eq(sku2.name)
        expect(items[1].qty, 'QTY SKU2:').to.eq(sku2.qty)
        expect(items[1].sub_total, 'Sub Total SKU2').to.eq(
          items[1].product.price * sku2.qty
        )
        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )
        Cypress.env('SubTotalCart', subtotalDetail.total)

        const promoAmount = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Promo'
        )
        Cypress.env('promoAmunt', promoAmount.total)

        Cypress.env('PaymentAmountCart', response.body.data.paymentAmount)

        const expectedSubtotal = items[0].sub_total + items[1].sub_total
        const expectedPaymenAmount =
          Cypress.env('SubTotalCart') - Cypress.env('promoAmunt')

        expect(expectedSubtotal, 'Sub total in Cart').to.eq(
          Cypress.env('SubTotalCart')
        )
        expect(expectedPaymenAmount, 'Total in Cart').to.eq(
          Cypress.env('PaymentAmountCart')
        )
      })
    }
  })

  it('Should be able to add shipment methode', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_shipmentMethode = URL_PRODUCT + '/cart/update-shipping-method'
    const url_address = URL_PRODUCT + '/cart/update-shipping-address'
    requestBodyAddress = {
      cityId: '64912f5b33066dc53982701b',
      city: 'Jakarta Barat',
      postalCode: '11540',
      district: 'Kebon Jeruk',
      regionName: 'DKI Jakarta',
      street: 'Jl. Pos Pengumben No.26',
      recipientName: 'MUHAMAD SOBIRIN JAMIL',
      recipientPhone: '6282324324432',
      addressName: 'Jamil - Rumah',
      pinpointLatLong: '-6.21589, 106.7752315',
      pinpointAddress: 'rumah alm bang yuyi',
      note: 'Deket emerald apparel samping ada gang naek ke atas dikit'
    }

    requestBodyShipment = {
      courierCode: 'sap-express'
    }

    cy.api({
      method: 'PATCH',
      url: url_address,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      },
      body: requestBodyAddress
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      cy.api({
        method: 'PATCH',
        url: url_add_shipmentMethode,
        headers: {
          ...Cypress.env('REQUEST_HEADERS'),
          Channel: 'web' // Add header Channel
        },
        body: requestBodyShipment
      }).then((response) => {
        expect(response.status).to.eq(200)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        const promoShipping = body.data.paymentDetails.find(
          (detail) => detail.label === 'Shipping Discount'
        )
        Cypress.env('ResponShipment', body.data)

        Cypress.env(
          'ShippingPrice',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log(Cypress.env('ShippingPrice'))

        const shippingDisc = promoShipping.total

        Cypress.env('Shipping', Cypress.env('ShippingPrice') + shippingDisc)

        const subtotalDetail = Cypress.env(
          'ResponShipment'
        ).paymentDetails.find((detail) => detail.label === 'Subtotal')
        Cypress.env('SubTotalCheckout', subtotalDetail.total)

        expect(Cypress.env('SubTotalCheckout'), 'SubTotal sesuai').to.eq(
          Cypress.env('SubTotalCart')
        )

        expect(requestBodyShipment.courierCode, 'Kurir').to.eq(
          Cypress.env('ResponShipment').shippingMethod.courierCode
        )

        const expectedTotal_inShipmentMethode =
          Cypress.env('SubTotalCart') + Cypress.env('Shipping')
        cy.log('subtotal', Cypress.env('SubTotalCart'))
        cy.log(
          'Ongkir sebelum disc',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log('Disc Shipping', shippingDisc)
        cy.log('Total Ongkir', Cypress.env('Shipping'))
        cy.log('Expected Total/Payment Amount', expectedTotal_inShipmentMethode)

        expect(expectedTotal_inShipmentMethode, 'Total / Payment Amount').to.eq(
          Cypress.env('ResponShipment').paymentAmount
        )
      })
    })
  })

  it('Should be able apply voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_applyVoucher = URL_PRODUCT + '/cart/apply-voucher'
    const url_deleteVoucher = URL_PRODUCT + '/cart/remove-voucher'

    const requestBodyVoucher = {
      voucherCode: voucherCode,
      category: 'cash_voucher',
      description: 'TEST CASH VOUCHER 2 AJA',
      available: true,
      type: '0'
    }

    cy.api({
      method: 'POST',
      url: url_deleteVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: {
        voucherCode: voucherCode
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      const body = response.body
      Cypress.env('ResponVoucher', body.data)
      // Cypress.env('CekVoucher', Cypress.env('ResponVoucher').vouchers)
    })

    cy.api({
      method: 'POST',
      url: url_applyVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: requestBodyVoucher
    }).then((response) => {
      expect(response.status).to.eq(201)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')
      const postDataRespon = body.data
      Cypress.env(
        'Apply_codeCashVoucher',
        postDataRespon.vouchers[0].voucherCode
      )
      Cypress.env(
        'CashVoucher',
        postDataRespon.vouchers[0].details.voucherValue
      )
      const subtotalDetail = postDataRespon.paymentDetails.find(
        (detail) => detail.label === 'Subtotal'
      )
      Cypress.env('Apply_SubTotal', subtotalDetail.total)
      Cypress.env('PaymentAmount', postDataRespon.paymentAmount)

      expect(Cypress.env('SubTotalCheckout'), 'SubTotal').to.eq(
        Cypress.env('Apply_SubTotal')
      )

      expect(Cypress.env('PaymentAmount'), 'Payment Amount').to.eq(
        Cypress.env('ResponShipment').paymentAmount
      )

      expect(Cypress.env('Apply_codeCashVoucher'), 'Voucher Code sesuai').to.eq(
        RespondataVoucher.voucherCode
      )
      expect(Cypress.env('CashVoucher'), 'Nominal Cash Voucher sesuai').to.eq(
        RespondataVoucher.voucherValue
      )

      expect(Cypress.env('CashVoucher'), 'Nominal Cash Voucher sesuai').to.eq(
        RespondataVoucher.voucherValue
      )

      Cypress.env(
        'SisaBayar',
        Cypress.env('Apply_SubTotal') +
          Cypress.env('Shipping') -
          Cypress.env('CashVoucher')
      )

      // expect(Cypress.env('SisaBayar'), 'Payment Amount Sesuai').to.eq(
      //   Cypress.env('PaymentAmount')
      // )

      cy.log('SubTotal', Cypress.env('Apply_SubTotal'))
      cy.log('Shippping', Cypress.env('Shipping'))
      cy.log('Cash Voucher', Cypress.env('CashVoucher'))
      cy.log('Sisa Pembayaran', Cypress.env('SisaBayar'))
    })
  })

  it('Should be able select payment methode', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const URL_PAYMENT = URL_PRODUCT + '/cart/update-payment'
    const requestBodyPaymentMethode = {
      method: 'va_bni',
      isInstallment: false,
      token: '',
      installmentTenor: 0,
      isOvo: false,
      ovoNumber: '',
      ovoRetryCount: 0,
      bin_number: '',
      approvalCode: 'string',
      value:
        Cypress.env('Apply_SubTotal') +
        Cypress.env('Shipping') -
        Cypress.env('Apply_ValueVoucher')
    }
    cy.api({
      method: 'PATCH',
      url: URL_PAYMENT,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web' // Add header Channel
      },
      body: requestBodyPaymentMethode
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')
      const postDataRespon = body.data

      Cypress.env('Payment1', postDataRespon.multiPayments[0].info.name)
      Cypress.env('PaymentAmount1', postDataRespon.multiPayments[0].value)
      Cypress.env('Payment2', postDataRespon.multiPayments[1].info.name)
      Cypress.env('PaymentAmount2', postDataRespon.multiPayments[1].value)

      cy.log('Payment Amount', postDataRespon.paymentAmount)
      cy.log('Payment Methode 1', Cypress.env('Payment1'))
      cy.log('Total Payment 1', Cypress.env('PaymentAmount1'))
      cy.log('Payment Methode 2:', Cypress.env('Payment2'))
      cy.log('Total Payment 2', Cypress.env('PaymentAmount2'))

      expect(Cypress.env('PaymentAmount2'), 'Total Bayar').to.eq(
        Cypress.env('SisaBayar')
      )
    })
  })

  it('Successfully create order', () => {
    const cart = Cypress.env('Cart')

    const payload = {
      cart: cart._id,
      approvalCode: '',
      notes: ''
    }

    const url = URL_PRODUCT + `/order/create-v2`
    cy.api({
      url,
      method: 'POST',
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      const body = response.body.data
      expect(body).to.haveOwnProperty('orderNumber')

      Cypress.env('orderNumber', response.body.data.orderNumber)
      cy.log('orderNumber :', Cypress.env('orderNumber'))
      cy.log('Payment Amount', body.paymentAmount)
      cy.log('Payment Methode 1', body.multiPayments[0].info.name)
      cy.log('Value Payment Methode 1', body.multiPayments[0].value)
      cy.log('Payment Methode 2', body.multiPayments[1].info.name)
      cy.log('Value Payment Methode 2', body.multiPayments[1].value)

      expect(body.cartId, 'Cart ID:').to.equal(cart._id)
      expect(body.items).to.be.an('array')
      expect(body.items.length).to.be.greaterThan(0)
      expect(body.items[0].name, 'SKU1 Name').to.equal(Cypress.env('SKU1').name)
      expect(body.items[0].qty, 'SKU 1 QTY').to.equal(Cypress.env('SKU1').qty)
      expect(body.items[1].name, 'SKU2 Name').to.equal(Cypress.env('SKU2').name)
      expect(body.items[0].qty, 'SKU2 QTY').to.equal(Cypress.env('SKU2').qty)
      expect(body.paymentAmount, 'Payment Amount').to.equal(
        Cypress.env('PaymentAmount')
      )
      expect(body.vouchers[0].voucherCode, 'Voucher Code sesuai').to.eq(
        Cypress.env('Apply_codeCashVoucher')
      )
    })
  })
})

describe('Cash Voucher > Payment Amount', () => {
  let RespondataVoucher
  it('Shows cash voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_voucherDetail = URL_PRODUCT + '/admin/voucher/vms/voucher-detail'

    cy.api({
      method: 'GET',
      url: url_voucherDetail,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 50,
        sort: '-updatedAt',
        keywords: 'TESTCASH002-QAMILS'
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const ResponbodyVoucher = response.body
      const dataVoucher = response.body.data.docs
      RespondataVoucher = response.body.data.docs[0]
      expect(ResponbodyVoucher.statusCode).to.equal(200)
      if (Array.isArray(dataVoucher)) {
        dataVoucher.forEach((doc) => {
          const { _id, redeemStatus, voucherCode, expiryDate, voucherAmount } =
            doc
          // Only log if redeemStatus is "AVAILABLE" and the voucher has not expired
          if (redeemStatus === 'AVAILABLE') {
            const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            const expiry = new Date(expiryDate).toISOString().split('T')[0]

            // Only log vouchers that have not expired
            if (expiry >= today) {
              // Prepare a single string to log voucher details
              let voucherDetails = `Voucher ID: ${_id}, Redeem Status: ${redeemStatus}, TBS Code Voucher: ${voucherCode}, Voucher Amount:${voucherAmount}`

              // Add expiryDate to the log
              voucherDetails += `, Expiry Date: ${expiryDate}`

              // Log all details in one line
              cy.log(voucherDetails)
            }
          }
        })
      } else {
        cy.log('Data docs not found or not an array')
      }
    })
  })

  let requestBodyCart
  let requestBodyShipment
  let requestBodyAddress
  it('Should be able to add product to cart', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_bulkCart = URL_PRODUCT + '/cart/add/bulk'
    const url_delete_allcart = URL_PRODUCT + '/cart/remove-all-item'
    Cypress.env('SKU1', {
      sku: '190180432',
      qty: 1,
      name: 'BATH LILY MINI RAMIE'
    })

    requestBodyCart = {
      data: [
        {
          sku: Cypress.env('SKU1').sku,
          qty: Cypress.env('SKU1').qty
        }
      ]
    }

    // Step 1: Check if the cart has any items
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/cart/my-cart',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      }
    }).then((response) => {
      const items = response.body.data.items || []

      if (items.length > 0) {
        // Step 2: If cart has items, delete all items
        cy.request({
          method: 'PATCH',
          url: url_delete_allcart,
          headers: {
            ...Cypress.env('REQUEST_HEADERS'),
            Channel: 'web'
          }
        }).then(() => {
          expect(response.status).to.eq(200)
          // Proceed with adding items to cart after clearing the cart
          addToCart(
            url_add_bulkCart,
            requestBodyCart,
            Cypress.env('SKU1'),
            Cypress.env('SKU2')
          )
        })
      } else {
        // If cart is already empty, proceed directly with adding items
        addToCart(
          url_add_bulkCart,
          requestBodyCart,
          Cypress.env('SKU1'),
          Cypress.env('SKU2')
        )
      }
    })
    // Function to add items to cart and validate response

    function addToCart(url_add_bulkCart, requestBodyCart) {
      const sku1 = Cypress.env('SKU1')

      cy.api({
        method: 'POST',
        url: url_add_bulkCart,
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
          // Channel: 'web' // Add header Channel
        },
        body: requestBodyCart
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        Cypress.env('Cart', body.data)
        // const postDataRespon = body.data
        const items = Cypress.env('Cart').items
        // cy.log(Cypress.env('Cart')._id, 'id cart')

        // Validate item 1
        expect(items[0].product.sku, 'sku Code1:').to.eq(sku1.sku)
        expect(items[0].product.name, 'Nama SKU1:').to.eq(sku1.name)
        expect(items[0].qty, 'QTY SKU1:').to.eq(sku1.qty)
        expect(items[0].sub_total, 'Sub Total SKU1').to.eq(
          items[0].product.price * sku1.qty
        )

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )
        Cypress.env('SubTotalCart', subtotalDetail.total)

        const promoAmount = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Promo'
        )
        Cypress.env('promoAmunt', promoAmount.total)

        Cypress.env('PaymentAmountCart', response.body.data.paymentAmount)

        const expectedSubtotal = items[0].sub_total //+ items[1].sub_total
        const expectedPaymenAmount =
          Cypress.env('SubTotalCart') - Cypress.env('promoAmunt')

        expect(expectedSubtotal, 'Sub total in Cart').to.eq(
          Cypress.env('SubTotalCart')
        )
      })
    }
  })

  it('Should be able to add shipment methode', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_shipmentMethode = URL_PRODUCT + '/cart/update-shipping-method'
    const url_address = URL_PRODUCT + '/cart/update-shipping-address'
    requestBodyAddress = {
      cityId: '64912f5b33066dc53982701b',
      city: 'Jakarta Barat',
      postalCode: '11540',
      district: 'Kebon Jeruk',
      regionName: 'DKI Jakarta',
      street: 'Jl. Pos Pengumben No.26',
      recipientName: 'MUHAMAD SOBIRIN JAMIL',
      recipientPhone: '6282324324432',
      addressName: 'Jamil - Rumah',
      pinpointLatLong: '-6.21589, 106.7752315',
      pinpointAddress: 'rumah alm bang yuyi',
      note: 'Deket emerald apparel samping ada gang naek ke atas dikit'
    }

    requestBodyShipment = {
      courierCode: 'sap-express'
    }

    cy.api({
      method: 'PATCH',
      url: url_address,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      },
      body: requestBodyAddress
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      cy.api({
        method: 'PATCH',
        url: url_add_shipmentMethode,
        headers: {
          ...Cypress.env('REQUEST_HEADERS'),
          Channel: 'web' // Add header Channel
        },
        body: requestBodyShipment
      }).then((response) => {
        expect(response.status).to.eq(200)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        const promoShipping = body.data.paymentDetails.find(
          (detail) => detail.label === 'Shipping Discount'
        )
        Cypress.env('ResponShipment', body.data)

        Cypress.env(
          'ShippingPrice',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log(Cypress.env('ShippingPrice'))

        const shippingDisc = promoShipping.total

        Cypress.env('Shipping', Cypress.env('ShippingPrice') + shippingDisc)

        const subtotalDetail = Cypress.env(
          'ResponShipment'
        ).paymentDetails.find((detail) => detail.label === 'Subtotal')
        Cypress.env('SubTotalCheckout', subtotalDetail.total)

        expect(Cypress.env('SubTotalCheckout'), 'SubTotal sesuai').to.eq(
          Cypress.env('SubTotalCart')
        )

        expect(requestBodyShipment.courierCode, 'Kurir').to.eq(
          Cypress.env('ResponShipment').shippingMethod.courierCode
        )

        const expectedTotal_inShipmentMethode =
          Cypress.env('SubTotalCart') + Cypress.env('Shipping')
        cy.log('subtotal', Cypress.env('SubTotalCart'))
        cy.log(
          'Ongkir sebelum disc',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log('Disc Shipping', shippingDisc)
        cy.log('Total Ongkir', Cypress.env('Shipping'))
        cy.log('Expected Total/Payment Amount', expectedTotal_inShipmentMethode)

        expect(expectedTotal_inShipmentMethode, 'Total / Payment Amount').to.eq(
          Cypress.env('ResponShipment').paymentAmount
        )
      })
    })
  })

  it('Should be not able apply cash voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_applyVoucher = URL_PRODUCT + '/cart/apply-voucher'
    const url_deleteVoucher = URL_PRODUCT + '/cart/remove-voucher'

    // cy.api({
    //   method: 'POST',
    //   url: url_deleteVoucher,
    //   headers: {
    //     ...Cypress.env('REQUEST_HEADERS')
    //   },
    //   body: {
    //     voucherCode: 'TESTCASH002-QAMILS'
    //   }
    // }).then((response) => {
    //   expect(response.status).to.eq(201)
    //   const body = response.body
    //   Cypress.env('ResponVoucher', body.data)
    //   // Cypress.env('CekVoucher', Cypress.env('ResponVoucher').vouchers)
    // })
    const requestBodyVoucher = {
      voucherCode: 'TESTCASH002-QAMILS',
      category: 'cash_voucher',
      description: 'TEST CASH VOUCHER 2 AJA',
      available: true,
      type: '0'
    }
    cy.api({
      method: 'POST',
      url: url_applyVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: requestBodyVoucher
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq(
        'Pembelian produk harus melebihi nilai voucher sebesar Rp. 50000'
      )
    })
  })
})

const baseVoucherCodes = {
  voucherCode1: 'TESTCASH002-QAMils',
  voucherCode2: 'TESTCASH002-QAMilss' // Perbaiki penulisan tanda kutip
}

const baseVoucherCode1 = baseVoucherCodes.voucherCode1
const baseVoucherCode2 = baseVoucherCodes.voucherCode2
function getDynamicVoucherCode1(baseVoucherCode1) {
  // Dapatkan nomor terakhir untuk voucher pertama dari file JSON di fixtures
  return cy
    .readFile('cypress/fixtures/multipleCashVoucher.json')
    .then((data) => {
      let currentNumber = data.lastMultipleVoucherNumber1 || 1
      const formattedNumber = String(currentNumber).padStart(2, '0') // Tambahkan '0' di depan jika kurang dari 10
      Cypress.env('VoucherCode1', `${baseVoucherCode1}-${formattedNumber}`)

      // Simpan nomor terbaru ke file JSON untuk iterasi berikutnya
      return cy
        .writeFile('cypress/fixtures/multipleCashVoucher.json', {
          ...data,
          lastMultipleVoucherNumber1: currentNumber + 1
        })
        .then(() => Cypress.env('VoucherCode1'))
    })
}

function getDynamicVoucherCode2(baseVoucherCode2) {
  // Dapatkan nomor terakhir untuk voucher kedua dari file JSON di fixtures
  return cy
    .readFile('cypress/fixtures/multipleCashVoucher.json')
    .then((data) => {
      let currentNumber = data.lastMultipleVoucherNumber2 || 1
      const formattedNumber = String(currentNumber).padStart(2, '0') // Tambahkan '0' di depan jika kurang dari 10
      Cypress.env('VoucherCode2', `${baseVoucherCode2}-${formattedNumber}`)

      // Simpan nomor terbaru ke file JSON untuk iterasi berikutnya
      return cy
        .writeFile('cypress/fixtures/multipleCashVoucher.json', {
          ...data,
          lastMultipleVoucherNumber2: currentNumber + 1
        })
        .then(() => Cypress.env('VoucherCode2'))
    })
}

//sku:101050290
describe('Should be able apply Multiple cash voucher', () => {
  before('Generate Voucher Code', () => {
    getDynamicVoucherCode1(baseVoucherCode1).then((code1) => {
      // const voucherCode1 = code1
      cy.log('Generated Voucher Code 1:', Cypress.env('VoucherCode1'))
    })
    getDynamicVoucherCode2(baseVoucherCode2).then((code2) => {
      // const voucherCode2 = code2
      cy.log('Generated Voucher Code 2:', Cypress.env('VoucherCode2'))
    })
  })

  let RespondataVoucher1
  let RespondataVoucher2
  it('Shows cash voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_voucherDetail = URL_PRODUCT + '/admin/voucher/vms/voucher-detail'

    cy.api({
      method: 'GET',
      url: url_voucherDetail,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 50,
        sort: '-updatedAt',
        keywords: Cypress.env('VoucherCode1')
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const ResponbodyVoucher1 = response.body
      const dataVoucher1 = response.body.data.docs
      RespondataVoucher1 = response.body.data.docs[0]
      expect(ResponbodyVoucher1.statusCode).to.equal(200)
      if (Array.isArray(dataVoucher1)) {
        dataVoucher1.forEach((doc) => {
          const { _id, redeemStatus, voucherCode, expiryDate, voucherAmount } =
            doc
          // Only log if redeemStatus is "AVAILABLE" and the voucher has not expired
          if (redeemStatus === 'AVAILABLE') {
            const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            const expiry = new Date(expiryDate).toISOString().split('T')[0]

            // Only log vouchers that have not expired
            if (expiry >= today) {
              // Prepare a single string to log voucher details
              let voucherDetails = `Voucher ID: ${_id}, Redeem Status: ${redeemStatus}, TBS Code Voucher: ${Cypress.env('VoucherCode1')}, Voucher Amount:${voucherAmount}`

              // Add expiryDate to the log
              voucherDetails += `, Expiry Date: ${expiryDate}`

              // Log all details in one line
              cy.log(voucherDetails)
            }
          }
        })
      } else {
        cy.log('Data docs not found or not an array')
      }
    })

    cy.api({
      method: 'GET',
      url: url_voucherDetail,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      qs: {
        limit: 50,
        sort: '-updatedAt',
        keywords: Cypress.env('VoucherCode2')
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const ResponbodyVoucher2 = response.body
      const dataVoucher2 = response.body.data.docs
      RespondataVoucher2 = response.body.data.docs[0]
      expect(ResponbodyVoucher2.statusCode).to.equal(200)
      if (Array.isArray(dataVoucher2)) {
        dataVoucher2.forEach((doc) => {
          const { _id, redeemStatus, voucherCode, expiryDate, voucherAmount } =
            doc
          // Only log if redeemStatus is "AVAILABLE" and the voucher has not expired
          if (redeemStatus === 'AVAILABLE') {
            const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            const expiry = new Date(expiryDate).toISOString().split('T')[0]

            // Only log vouchers that have not expired
            if (expiry >= today) {
              // Prepare a single string to log voucher details
              let voucherDetails = `Voucher ID: ${_id}, Redeem Status: ${redeemStatus}, TBS Code Voucher: ${Cypress.env('VoucherCode2')}, Voucher Amount:${voucherAmount}`

              // Add expiryDate to the log
              voucherDetails += `, Expiry Date: ${expiryDate}`

              // Log all details in one line
              cy.log(voucherDetails)
            }
          }
        })
      } else {
        cy.log('Data docs not found or not an array')
      }
    })
  })
  let requestBodyCart
  let requestBodyShipment
  let requestBodyAddress
  it('Should be able to add product to cart', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_bulkCart = URL_PRODUCT + '/cart/add/bulk'
    const url_delete_allcart = URL_PRODUCT + '/cart/remove-all-item'
    Cypress.env('SKU1', {
      sku: '101050290',
      qty: 1,
      name: 'CAMOMILE GENTLE EYE MAKE-UP REMOVER 250ML'
    })

    requestBodyCart = {
      data: [
        {
          sku: Cypress.env('SKU1').sku,
          qty: Cypress.env('SKU1').qty
        }
      ]
    }

    // Step 1: Check if the cart has any items
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/cart/my-cart',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      }
    }).then((response) => {
      const items = response.body.data.items || []

      if (items.length > 0) {
        // Step 2: If cart has items, delete all items
        cy.request({
          method: 'PATCH',
          url: url_delete_allcart,
          headers: {
            ...Cypress.env('REQUEST_HEADERS'),
            Channel: 'web'
          }
        }).then(() => {
          expect(response.status).to.eq(200)
          // Proceed with adding items to cart after clearing the cart
          addToCart(
            url_add_bulkCart,
            requestBodyCart,
            Cypress.env('SKU1'),
            Cypress.env('SKU2')
          )
        })
      } else {
        // If cart is already empty, proceed directly with adding items
        addToCart(
          url_add_bulkCart,
          requestBodyCart,
          Cypress.env('SKU1'),
          Cypress.env('SKU2')
        )
      }
    })
    // Function to add items to cart and validate response

    function addToCart(url_add_bulkCart, requestBodyCart) {
      const sku1 = Cypress.env('SKU1')

      cy.api({
        method: 'POST',
        url: url_add_bulkCart,
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
          // Channel: 'web' // Add header Channel
        },
        body: requestBodyCart
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        Cypress.env('Cart', body.data)
        // const postDataRespon = body.data
        const items = Cypress.env('Cart').items
        // cy.log(Cypress.env('Cart')._id, 'id cart')

        // Validate item 1
        expect(items[0].product.sku, 'sku Code1:').to.eq(sku1.sku)
        expect(items[0].product.name, 'Nama SKU1:').to.eq(sku1.name)
        expect(items[0].qty, 'QTY SKU1:').to.eq(sku1.qty)
        expect(items[0].sub_total, 'Sub Total SKU1').to.eq(
          items[0].product.price * sku1.qty
        )

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )
        Cypress.env('SubTotalCart', subtotalDetail.total)

        const promoAmount = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Promo'
        )
        Cypress.env('promoAmunt', promoAmount.total)

        Cypress.env('PaymentAmountCart', response.body.data.paymentAmount)

        const expectedSubtotal = items[0].sub_total //+ items[1].sub_total
        const expectedPaymenAmount =
          Cypress.env('SubTotalCart') - Cypress.env('promoAmunt')

        expect(expectedSubtotal, 'Sub total in Cart').to.eq(
          Cypress.env('SubTotalCart')
        )
      })
    }
  })

  it('Should be able to add shipment methode', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_add_shipmentMethode = URL_PRODUCT + '/cart/update-shipping-method'
    const url_address = URL_PRODUCT + '/cart/update-shipping-address'
    requestBodyAddress = {
      cityId: '64912f5b33066dc53982701b',
      city: 'Jakarta Barat',
      postalCode: '11540',
      district: 'Kebon Jeruk',
      regionName: 'DKI Jakarta',
      street: 'Jl. Pos Pengumben No.26',
      recipientName: 'MUHAMAD SOBIRIN JAMIL',
      recipientPhone: '6282324324432',
      addressName: 'Jamil - Rumah',
      pinpointLatLong: '-6.21589, 106.7752315',
      pinpointAddress: 'rumah alm bang yuyi',
      note: 'Deket emerald apparel samping ada gang naek ke atas dikit'
    }

    requestBodyShipment = {
      courierCode: 'sap-express'
    }

    cy.api({
      method: 'PATCH',
      url: url_address,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web'
      },
      body: requestBodyAddress
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      cy.api({
        method: 'PATCH',
        url: url_add_shipmentMethode,
        headers: {
          ...Cypress.env('REQUEST_HEADERS'),
          Channel: 'web' // Add header Channel
        },
        body: requestBodyShipment
      }).then((response) => {
        expect(response.status).to.eq(200)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        const promoShipping = body.data.paymentDetails.find(
          (detail) => detail.label === 'Shipping Discount'
        )
        Cypress.env('ResponShipment', body.data)

        Cypress.env(
          'ShippingPrice',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log(Cypress.env('ShippingPrice'))

        const shippingDisc = promoShipping.total

        Cypress.env('Shipping', Cypress.env('ShippingPrice') + shippingDisc)

        const subtotalDetail = Cypress.env(
          'ResponShipment'
        ).paymentDetails.find((detail) => detail.label === 'Subtotal')
        Cypress.env('SubTotalCheckout', subtotalDetail.total)

        expect(Cypress.env('SubTotalCheckout'), 'SubTotal sesuai').to.eq(
          Cypress.env('SubTotalCart')
        )

        expect(requestBodyShipment.courierCode, 'Kurir').to.eq(
          Cypress.env('ResponShipment').shippingMethod.courierCode
        )

        const expectedTotal_inShipmentMethode =
          Cypress.env('SubTotalCart') + Cypress.env('Shipping')
        cy.log('subtotal', Cypress.env('SubTotalCart'))
        cy.log(
          'Ongkir sebelum disc',
          Cypress.env('ResponShipment').shippingMethod.price
        )
        cy.log('Disc Shipping', shippingDisc)
        cy.log('Total Ongkir', Cypress.env('Shipping'))
        cy.log('Expected Total/Payment Amount', expectedTotal_inShipmentMethode)

        expect(expectedTotal_inShipmentMethode, 'Total / Payment Amount').to.eq(
          Cypress.env('ResponShipment').paymentAmount
        )
      })
    })
  })

  it('Should be able apply voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_applyVoucher = URL_PRODUCT + '/cart/apply-voucher'
    const url_deleteVoucher = URL_PRODUCT + '/cart/remove-voucher'

    const requestBodyVoucher1 = {
      voucherCode: Cypress.env('VoucherCode1'),
      category: 'cash_voucher',
      description: 'TEST CASH VOUCHER 2 AJA',
      available: true,
      type: '0'
    }
    const requestBodyVoucher2 = {
      voucherCode: Cypress.env('VoucherCode2'),
      category: 'cash_voucher',
      description: 'TEST CASH VOUCHER 2 AJA',
      available: true,
      type: '0'
    }

    // cy.api({
    //   method: 'POST',
    //   url: url_deleteVoucher,
    //   headers: {
    //     ...Cypress.env('REQUEST_HEADERS')
    //   },
    //   body: {
    //     voucherCode: Cypress.env('VoucherCode1')
    //   }
    // }).then((response) => {
    //   expect(response.status).to.eq(201)
    //   const body = response.body
    //   Cypress.env('ResponVoucher', body.data)
    // })

    cy.api({
      method: 'POST',
      url: url_applyVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: requestBodyVoucher1
    }).then((response) => {
      expect(response.status).to.eq(201)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')
    })

    cy.api({
      method: 'POST',
      url: url_applyVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: requestBodyVoucher2
    }).then((response) => {
      expect(response.status).to.eq(201)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')
      const postDataRespon = body.data
      const RespondataMultipleVoucher1 = response.body.data.vouchers[0]
      const RespondataMultipleVoucher2 = response.body.data.vouchers[1]

      Cypress.env(
        'Apply_codeCashVoucher1',
        RespondataMultipleVoucher1.voucherCode
      )
      Cypress.env(
        'CashVoucher1',
        RespondataMultipleVoucher1.details.voucherValue
      )

      Cypress.env(
        'Apply_codeCashVoucher2',
        RespondataMultipleVoucher2.voucherCode
      )

      Cypress.env(
        'CashVoucher2',
        RespondataMultipleVoucher2.details.voucherValue
      )

      const subtotalDetail = postDataRespon.paymentDetails.find(
        (detail) => detail.label === 'Subtotal'
      )
      Cypress.env('Apply_SubTotal', subtotalDetail.total)
      Cypress.env('PaymentAmount', postDataRespon.paymentAmount)

      expect(Cypress.env('SubTotalCheckout'), 'SubTotal').to.eq(
        Cypress.env('Apply_SubTotal')
      )

      expect(Cypress.env('PaymentAmount'), 'Payment Amount').to.eq(
        Cypress.env('ResponShipment').paymentAmount
      )

      expect(
        Cypress.env('Apply_codeCashVoucher1'),
        'Voucher Code1 sesuai'
      ).to.eq(RespondataVoucher1.voucherCode)

      expect(Cypress.env('CashVoucher1'), 'Nominal Cash Voucher1 sesuai').to.eq(
        RespondataVoucher1.voucherValue
      )

      expect(
        Cypress.env('Apply_codeCashVoucher2'),
        'Voucher Code2 sesuai'
      ).to.eq(RespondataVoucher2.voucherCode)

      expect(Cypress.env('CashVoucher2'), 'Nominal Cash Voucher2 sesuai').to.eq(
        RespondataVoucher2.voucherValue
      )

      Cypress.env(
        'Total Cash Voucher',
        Cypress.env('CashVoucher1') + Cypress.env('CashVoucher2')
      )

      Cypress.env(
        'SisaBayar',
        Cypress.env('Apply_SubTotal') +
          Cypress.env('Shipping') -
          Cypress.env('CashVoucher1') -
          Cypress.env('CashVoucher2')
      )

      cy.log('Subtotal', Cypress.env('Apply_SubTotal'))
      cy.log(' Shipping', Cypress.env('Shipping'))
      cy.log('PaymenAmount', Cypress.env('PaymentAmount'))
      cy.log('TotalCashvoucher', Cypress.env('Total Cash Voucher'))
      cy.log('Sisa Bayar', Cypress.env('SisaBayar'))
    })
  })

  // it('Should be able select payment methode', () => {
  //   const URL_PRODUCT = Cypress.config('baseUrlProduct')
  //   const URL_PAYMENT = URL_PRODUCT + '/cart/update-payment'
  //   const requestBodyPaymentMethode = {
  //     method: 'shopeepay',
  //     isInstallment: false,
  //     token: '',
  //     installmentTenor: 0,
  //     isOvo: false,
  //     ovoNumber: '',
  //     ovoRetryCount: 0,
  //     bin_number: '',
  //     approvalCode: 'string',
  //     value: Cypress.env('SisaBayar')
  //   }
  //   cy.api({
  //     method: 'PATCH',
  //     url: URL_PAYMENT,
  //     headers: {
  //       ...Cypress.env('REQUEST_HEADERS')
  //       // Channel: 'web' // Add header Channel
  //     },
  //     body: requestBodyPaymentMethode
  //   }).then((response) => {
  //     expect(response.status).to.eq(200)
  //     const body = response.body
  //     expect(body).to.have.property('statusCode')
  //     expect(body).to.have.property('message')
  //     expect(body).to.have.property('data')
  //     const postDataRespon = body.data

  //     Cypress.env(
  //       'MultiPayment_Name[1]',
  //       postDataRespon.multiPayments[0].info.name
  //     )
  //     Cypress.env(
  //       'MultiPayment_Value[1]',
  //       postDataRespon.multiPayments[0].value
  //     )
  //     Cypress.env(
  //       'MultiPayment_Name[2]',
  //       postDataRespon.multiPayments[1].info.name
  //     )
  //     Cypress.env(
  //       'MultiPayment_Value[2]',
  //       postDataRespon.multiPayments[1].value
  //     )
  //     Cypress.env(
  //       'MultiPayment_Name[3]',
  //       postDataRespon.multiPayments[2].info.name
  //     )
  //     Cypress.env(
  //       'MultiPayment_Value[3]',
  //       postDataRespon.multiPayments[2].value
  //     )

  //     cy.log('Payment Amount', postDataRespon.paymentAmount)
  //     cy.log('Payment Methode 1', Cypress.env('MultiPayment_Name[1]'))
  //     cy.log('Total Payment 1', Cypress.env('MultiPayment_Value[1]'))
  //     cy.log('Payment Methode 2:', Cypress.env('MultiPayment_Name[2]'))
  //     cy.log('Total Payment 2', Cypress.env('MultiPayment_Value[2]'))
  //     cy.log('Payment Methode 3:', Cypress.env('MultiPayment_Name[3]'))
  //     cy.log('Total Payment 3', Cypress.env('MultiPayment_Value[3]'))

  //     expect(Cypress.env('MultiPayment_Value[3]'), 'Total Bayar').to.eq(
  //       Cypress.env('SisaBayar')
  //     )
  //   })
  // })

  it('Successfully create order', () => {
    const cart = Cypress.env('Cart')

    const payload = {
      cart: cart._id,
      approvalCode: '',
      notes: ''
    }

    const url = URL_PRODUCT + `/order/create-v2`
    cy.api({
      url,
      method: 'POST',
      headers: Cypress.env('REQUEST_HEADERS'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      const body = response.body.data
      expect(body).to.haveOwnProperty('orderNumber')

      Cypress.env('orderNumber', response.body.data.orderNumber)
      cy.log('orderNumber :', Cypress.env('orderNumber'))
      cy.log('Payment Amount', body.paymentAmount)
      cy.log('Payment Methode 1', body.multiPayments[0].info.name)
      cy.log('Value Payment Methode 1', body.multiPayments[0].value)
      cy.log('Payment Methode 2', body.multiPayments[1].info.name)
      cy.log('Value Payment Methode 2', body.multiPayments[1].value)
      cy.log('Payment Methode 3', body.multiPayments[2].info.name)
      cy.log('Value Payment Methode 3', body.multiPayments[2].value)

      // expect(body.cartId, 'Cart ID:').to.equal(cart._id)
      // expect(body.items).to.be.an('array')
      // expect(body.items.length).to.be.greaterThan(0)
      // expect(body.items[0].name, 'SKU1 Name').to.equal(Cypress.env('SKU1').name)
      // expect(body.items[0].qty, 'SKU 1 QTY').to.equal(Cypress.env('SKU1').qty)
      // expect(body.paymentAmount, 'Payment Amount').to.equal(
      //   Cypress.env('PaymentAmount')
      // )
      // expect(body.vouchers[0].voucherCode, 'Voucher Code sesuai').to.eq(
      //   Cypress.env('Apply_codeCashVoucher')
      // )
    })
  })
  //hasil jika melalui payment methode error 400 Bad Request -> Order Pending
  //jika lgsg create order tanpa milih payment methode error 502 Bad Gateway -> Order terbentuk
})
