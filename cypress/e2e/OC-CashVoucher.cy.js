const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

//codevoucher: TESTCASH002-Mils
describe('User Available Acces to Redemption Voucher', () => {
  before('User Login', () => {
    const url_user = URL_USER + '/otp/validate'
    const url_admin = URL_USER + '/admin/login'

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
          Authorization: 'Bearer ' + userToken
        })
      })

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
        const AdminToken = response.body.data.accessToken
        Cypress.env('REQUEST_HEADERS_ADMIN', {
          Authorization: 'Bearer ' + AdminToken
        })
      })
  })

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
        keywords: 'TESTCASH002-Mils'
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const ResponbodyVoucher = response.body
      RespondataVoucher = response.body.data.docs[0]
      expect(ResponbodyVoucher.statusCode).to.equal(200)
      if (Array.isArray(RespondataVoucher)) {
        RespondataVoucher.forEach((doc) => {
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
    const sku1 = { sku: '101060431', qty: 1, name: 'ALOE CREAM CLEANSER 125ML' }
    const sku2 = { sku: '101060438', qty: 1, name: 'ALOE TONER 250ML' }

    requestBodyCart = {
      channel: 'web',
      data: [
        {
          sku: sku1.sku,
          qty: sku1.qty
        },
        {
          sku: sku2.sku,
          qty: sku2.qty
        }
      ]
    }

    // Step 1: Check if the cart has any items
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/cart/my-cart',
      headers: {
        ...Cypress.env('REQUEST_HEADERS'),
        Channel: 'web'
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
          addToCart(url_add_bulkCart, requestBodyCart, sku1, sku2)
        })
      } else {
        // If cart is already empty, proceed directly with adding items
        addToCart(url_add_bulkCart, requestBodyCart, sku1, sku2)
      }
    })
    // Function to add items to cart and validate response
    function addToCart(url_add_bulkCart, requestBodyCart, sku1, sku2) {
      cy.api({
        method: 'POST',
        url: url_add_bulkCart,
        headers: {
          ...Cypress.env('REQUEST_HEADERS'),
          Channel: 'web' // Add header Channel
        },
        body: requestBodyCart
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')

        const postDataRespon = body.data
        const items = postDataRespon.items

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
        const expectedSubtotal = items[0].sub_total + items[1].sub_total
        expect(expectedSubtotal, 'Sub total Cart').to.eq(
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
      channel: 'web',
      // courierCode: 'gosend-instant'
      courierCode: 'sap-express'
    }

    cy.api({
      method: 'PATCH',
      url: url_address,
      headers: {
        ...Cypress.env('REQUEST_HEADERS'),
        Channel: 'web'
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
        const promodetail = body.data.paymentDetails.find(
          (detail) => detail.label === 'Shipping Discount'
        )
        Cypress.env('Respon Shipment', body.data)
        Cypress.env(
          'ShippingPrice',
          Cypress.env('Respon Shipment').shippingMethod.price
        )
        cy.log(Cypress.env('ShippingPrice'))
        const shippingDisc = promodetail.total

        Cypress.env('Shipping', Cypress.env('ShippingPrice') + shippingDisc)
        expect(
          Cypress.env('Respon Shipment').totalAmount,
          'Sub total checkout sesuai dengan yang di cart'
        ).to.eq(Cypress.env('SubTotalCart'))

        expect(requestBodyShipment.courierCode, 'Kurir').to.eq(
          Cypress.env('Respon Shipment').shippingMethod.courierCode
        )

        const expectedTotal_inShipmentMethode =
          Cypress.env('SubTotalCart') + Cypress.env('Shipping')
        cy.log('subtotal', Cypress.env('SubTotalCart'))
        cy.log(
          'Ongkir sebelum disc',
          Cypress.env('Respon Shipment').shippingMethod.price
        )
        cy.log('Disc Shipping', shippingDisc)
        cy.log('Total Ongkir', Cypress.env('Shipping'))
        cy.log('Expected Total/Payment Amount', expectedTotal_inShipmentMethode)

        expect(expectedTotal_inShipmentMethode, 'Total / Payment Amount').to.eq(
          Cypress.env('Respon Shipment').paymentAmount
        )
      })
    })
  })

  it('Should be able apply voucher', () => {
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const url_applyVoucher = URL_PRODUCT + '/cart/apply-voucher'
    const url_deleteVoucher = URL_PRODUCT + '/cart/remove-voucher'
    const requestBodyVoucher = {
      channel: 'web',
      voucherCode: 'TESTCASH002-Mils',
      category: 'cash_voucher',
      description: 'TEST CASH VOUCHER 2 AJA',
      available: true,
      type: '0'
    }

    cy.api({
      method: 'POST',
      url: url_deleteVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS'),
        Channel: 'web' // Add header Channel
      },
      body: {
        voucherCode: 'TESTCASH002-Mils'
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
    })
    cy.api({
      method: 'POST',
      url: url_applyVoucher,
      headers: {
        ...Cypress.env('REQUEST_HEADERS'),
        Channel: 'web' // Add header Channel
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
        'Apply_ValueVoucher',
        postDataRespon.vouchers[0].details.voucherValue
      )
      Cypress.env('Apply_SubTotal', postDataRespon.totalAmount)
      Cypress.env('PaymentAmount', postDataRespon.paymentAmount)

      expect(Cypress.env('Apply_codeCashVoucher'), 'Voucher Code sesuai').to.eq(
        RespondataVoucher.voucherCode
      )
      expect(
        Cypress.env('Apply_ValueVoucher'),
        'Cash Voucher Value sesuai'
      ).to.eq(RespondataVoucher.voucherValue)
      expect(Cypress.env('Apply_SubTotal'), 'SubTotal sesuai').to.eq(
        Cypress.env('SubTotalCart')
      )
      Cypress.env(
        'Sisa Bayar',
        Cypress.env('Apply_SubTotal') +
          Cypress.env('Shipping') -
          Cypress.env('Apply_ValueVoucher')
      )

      cy.log('SubTotal', Cypress.env('Apply_SubTotal'))
      cy.log('Shippping', Cypress.env('Shipping'))
      cy.log('Value Voucher', Cypress.env('Apply_ValueVoucher'))
      cy.log('Sisa Pembayaran', Cypress.env('Sisa Bayar'))
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
        ...Cypress.env('REQUEST_HEADERS'),
        Channel: 'web' // Add header Channel
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

      cy.log('Payment Methode 1', Cypress.env('Payment1'))
      cy.log('Total Payment 1', Cypress.env('PaymentAmount1'))
      cy.log('Payment Methode 2:', Cypress.env('Payment2'))
      cy.log('Total Payment 2', Cypress.env('PaymentAmount2'))

      expect(Cypress.env('PaymentAmount2'), 'Total Bayar').to.eq(
        Cypress.env('Sisa Bayar')
      )
    })
  })
})
