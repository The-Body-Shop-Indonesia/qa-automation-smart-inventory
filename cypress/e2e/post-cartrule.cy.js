const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PAYMENT = Cypress.config('baseUrlPayment')

let customerId
let cartId
let totalValueTerm
let storeCodeTerm
let ResponseDataIDCartrules
let ResponseDataNameCartrules
let effectData
let ResponseDataCartrules
let promoNumber_CartRule
let paymentDetailTotal
let ResponseDataTiersCartRule
describe('Staff create order', function () {
  it('Successfully login Employee', () => {
    const url = URL_USER + '/employee/login'
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
        Cypress.env('REQUEST_HEADERS', {
          Authorization: 'Bearer ' + employeeToken,
          channel: 'pos'
        })
        Cypress.env('emp_nik', response.body.data.user.nik)
        Cypress.env('storeCode', response.body.data.user.storeCode)
      })
  })

  it('Successfully login Admin', () => {
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

  it('Check shift', () => {
    const url = URL_USER + '/employee/shift'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      failOnStatusCode: false
    })
      .should((response) => {
        const body = response.body
        expect(body).to.haveOwnProperty('statusCode')
        expect(body).to.haveOwnProperty('message')
      })
      .then((response) => {
        Cypress.env('RESPONSE_BODY', response.body)
      })
  })

  it('Close shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 200 && body.data.shift.status === 'expired') {
      const url = URL_USER + '/employee/shift/close'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      })
        .should((response) => {
          expect(response.status).to.equal(201)
        })
        .then((response) => {
          Cypress.env('RESPONSE_BODY', response.body)
        })
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
    } else {
      cy.log('tidak perlu close shift')
    }
  })

  it('Open shift', () => {
    const body = Cypress.env('RESPONSE_BODY')
    if (body.statusCode === 201) {
      const url = URL_USER + '/employee/shift/open'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 400) {
      const url = URL_USER + '/employee/shift/open'
      cy.api({
        method: 'POST',
        url,
        headers: Cypress.env('REQUEST_HEADERS'),
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.equal(201)
      })
    } else if (body.statusCode === 500) {
      cy.log('Internal Server Error')
    } else {
      cy.log('shift sedang berjalan')
    }
  })

  it('Should able to create cart', () => {
    const url = URL_PRODUCT + '/employee/cart/create'
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        isGuest: false,
        firstName: 'Mils',
        lastName: 'Jamils',
        cardNumber: '51716799227000317',
        nik: '',
        FamilyNumber: '',
        isFamily: false,
        customerGroup: 'STARTER',
        image:
          'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg',
        isScanner: true,
        isLapsed: false,
        isReactivated: false,
        isIcarusAppUser: false,
        autoEnroll: false,
        autoEnrollFrom: ''
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.data).to.haveOwnProperty('_id')
      expect(response.body.data.customer).to.haveOwnProperty('_id')
      cartId = response.body.data._id
      Cypress.env('cartId', cartId)
      customerId = response.body.data.customer._id
      Cypress.env('customerId', customerId)
    })
  })

  it('Should able to assign employee', () => {
    const url =
      URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId') + '/assign-to'
    const nik = Cypress.env('emp_nik')
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        nik: nik
      }
    }).should((response) => {
      expect(response.status).to.equal(201)
      const data = response.body.data
      expect(data.assignTo.nik, 'Employee NIK should ' + nik).to.equal(nik)
      Cypress.env('CART', response.body.data)
    })
  })

  it('Should get cart rule disc 10%', () => {
    const dataId = '671a123857e46bf7dbea5de8'
    const urlCartrule = URL_PRODUCT + '/cart-rule/get/' + dataId
    cy.api({
      method: 'GET',
      url: urlCartrule,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      body: {
        id: dataId
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      const body = response.body
      expect(body.statusCode).to.equal(200)
      const data = response.body.data
      expect(data._id).to.equal(dataId)

      // Simpan data respons ke alias
      cy.wrap(data).as('ResponseDataCartrules') // Simpan hanya `data` ke alias
    })
    cy.get('@ResponseDataCartrules').then((ResponseDataCartrules) => {
      // Raw terms data sebagai string JSON
      const rawTermsData = ResponseDataCartrules.rawTermsData
      // Parse rawTermsData menjadi objek JavaScript
      const termsArray = JSON.parse(rawTermsData)
      // Pisahkan nilai terms
      totalValueTerm = termsArray.find((term) => term.type === 'total_value')
      storeCodeTerm = termsArray.find((term) => term.type === 'store_code')

      //get data respon
      ResponseDataIDCartrules = ResponseDataCartrules._id
      ResponseDataNameCartrules = ResponseDataCartrules.displayName
      promoNumber_CartRule = ResponseDataCartrules.promoNumber
      ResponseDataTiersCartRule = ResponseDataCartrules.tiers
      // cy.log(ResponseDataTiersCartRule)

      if (totalValueTerm) {
        cy.log(
          `1. total value = ${totalValueTerm.operator}${totalValueTerm.value}`
        )
      }
      if (storeCodeTerm) {
        cy.log(`2. store code = ${storeCodeTerm.value}`)
      }

      // Parsing data effect
      effectData = ResponseDataCartrules.effect
      const [effectType, effectValue, optionalVal2] = effectData.split(',')

      // Raw effects data sebagai string JSON
      const rawEffectData = ResponseDataCartrules.rawEffectData
      // Parse rawEffectData menjadi objek JavaScript
      let effectArray
      try {
        effectArray = JSON.parse(rawEffectData)
      } catch (e) {
        cy.log('Error parsing rawEffectData:', e)
        return // Stop further execution if parsing fails
      }

      cy.log(`Effect Type: ${effectType}`)
      cy.log(`Discount Value: ${effectValue}`)
      cy.log(`Max Ammount: ${optionalVal2}`)
    })
  })

  it('Should able to add product to cart by scan QR', () => {
    const url =
      URL_PRODUCT +
      '/employee/cart/pos-ubd/' +
      Cypress.env('customerId') +
      '/item/add'
    const sku = '145500080'
    const qty = 1
    const ubd = '2025-05'

    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS'),
      body: {
        sku: sku,
        qty: qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: ubd
      }
    })
      .then((response) => {
        expect(response.status).to.equal(201)
        const data = response.body.data
        expect(data).to.haveOwnProperty('_id')
        expect(data).to.haveOwnProperty('omni_trx_type')
        expect(data).to.haveOwnProperty('is_omni')
        expect(data).to.haveOwnProperty('assignToStoreDispatcher')
        expect(data).to.haveOwnProperty('user')
        expect(data).to.haveOwnProperty('items')
        expect(data).to.haveOwnProperty('void_items')
        expect(data).to.haveOwnProperty('totalAmount')
        expect(data).to.haveOwnProperty('totalWeight')
        expect(data).to.haveOwnProperty('payments')
        expect(data).to.haveOwnProperty('multiPayments')
        expect(data).to.haveOwnProperty('billingAddress')
        expect(data).to.haveOwnProperty('shippingMethod')
        expect(data).to.haveOwnProperty('shippingAddress')
        expect(data).to.haveOwnProperty('shippingDetails')
        expect(data).to.haveOwnProperty('vouchers')
        expect(data).to.haveOwnProperty('paymentDetails')
        expect(data).to.haveOwnProperty('paymentAmount')
        expect(data).to.haveOwnProperty('currentPayment')
        expect(data).to.haveOwnProperty('isActive')
        expect(data).to.haveOwnProperty('isSendAsGift')
        expect(data).to.haveOwnProperty('greetingCartType')
        expect(data).to.haveOwnProperty('sendAsGiftDetail')
        expect(data).to.haveOwnProperty('storeCredit')
        expect(data).to.haveOwnProperty('store')
        expect(data).to.haveOwnProperty('store_dispatcher')
        expect(data).to.haveOwnProperty('point')
        expect(data).to.haveOwnProperty('cartRuleApplied')
        expect(data).to.haveOwnProperty('customer')
        expect(data).to.haveOwnProperty('createdBy')
        expect(data).to.haveOwnProperty('channel')
        expect(data).to.haveOwnProperty('freeProducts')
        expect(data).to.haveOwnProperty('freeProductOptions')
        expect(data).to.haveOwnProperty('vatAmount')
        expect(data).to.haveOwnProperty('discountDetail')
        expect(data).to.haveOwnProperty('assignTo')
        expect(data).to.haveOwnProperty('totalAmountVoid')
        expect(data).to.haveOwnProperty('type')
        expect(data).to.haveOwnProperty('isScanner')
        expect(data).to.haveOwnProperty('cartRuleOnSubtotal')
        expect(data).to.haveOwnProperty('freeProductOptionsSelected')
        expect(data).to.haveOwnProperty('dealsId')
        expect(data).to.haveOwnProperty('itemOrders')
        expect(data).to.haveOwnProperty('createdAt')
        expect(data).to.haveOwnProperty('updatedAt')
        expect(data).to.haveOwnProperty('__v')
        expect(data).to.haveOwnProperty('productCategoriesInternal')
        expect(data).to.haveOwnProperty('cashVoucher')
        data.items.forEach(function (item) {
          expect(item).to.haveOwnProperty('product')
          expect(item).to.haveOwnProperty('qty')
          expect(item).to.haveOwnProperty('sub_total')
          expect(item).to.haveOwnProperty('sku')
          expect(item).to.haveOwnProperty('grandTotal')
          expect(item).to.haveOwnProperty('ubdDetail')
        })
      })
      .then((response) => {
        const data = response.body.data
        const item = response.body.data.items
        const paymentDetails = response.body.data.paymentDetails
        expect(item.length).to.equal(1)
        const ubdTest = new Date(ubd)
        const yearExpiredTest = ubdTest.getFullYear()
        const monthExpiredTest = ubdTest.getMonth() + 1
        // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
        const responseUbd = item[0].ubdDetail[0].ubd
        const responseUbdDate = new Date(responseUbd)
        const yearExpiredResponse = responseUbdDate.getFullYear()
        const monthExpiredResponse = responseUbdDate.getMonth() + 1
        expect(item[0].sku, 'SKU should ' + sku).to.equal(sku)
        expect(
          item[0].qty,
          'Quantity of product ' + sku + ' should ' + qty
        ).to.equal(qty)
        expect(
          item[0].ubdDetail[0].total,
          'Total of product ' + sku + ' and UBD ' + ubd + ' should ' + qty
        ).to.equal(qty)
        expect(yearExpiredResponse).to.equal(yearExpiredTest)
        expect(monthExpiredResponse).to.equal(monthExpiredTest)
        const price_145500080 = item[0].product.price
        cy.log('Price Normal SKU 145500080:', item[0].product.price)
        Cypress.env('price_145500080', price_145500080)
          ? response.body.data.paymentDetails.find(
              (detail) => detail.label === 'Subtotal'
            ).total
          : null

        //validasi kondisi cart = kondisi cart rule
        if (paymentDetails) {
          cy.log('paymentDetails ditemukan.')
          const subtotalDetail = paymentDetails.find(
            (detail) => detail.label === 'Subtotal'
          )
          if (subtotalDetail) {
            cy.log(`Subtotal POS: ${subtotalDetail.total}`)
            cy.log(
              'term total value',
              totalValueTerm.operator + totalValueTerm.value
            )
          } else {
            cy.log("Tidak ada field 'Subtotal' di paymentDetails.")
          }
        } else {
          cy.log('paymentDetails tidak ditemukan.')
        }

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )
        const paymentDetailSubtotal = subtotalDetail.total
        const termValue = totalValueTerm
          ? parseFloat(totalValueTerm.value)
          : NaN
        const POS_StoreCode = response.body.data.createdBy.storeCode
        const POS_UserTier = response.body.data.customer.customerGroup
        const tiersArray = ResponseDataTiersCartRule.split(',')

        cy.log('POS User Tier :', POS_UserTier)
        cy.log('POS Store Code :', POS_StoreCode)
        cy.log('Kondisi cart rule store code :', storeCodeTerm.value)

        // Cek kondisi cart
        if (
          !isNaN(termValue) &&
          POS_StoreCode === storeCodeTerm.value &&
          tiersArray.includes(POS_UserTier)
        ) {
          if (paymentDetailSubtotal >= termValue) {
            cy.log(
              `Subtotal (${subtotalDetail.total}) ${totalValueTerm.operator} (${termValue}).`
            )
            expect(
              paymentDetailSubtotal,
              'Subtotal >= kondisi cart rule'
            ).to.be.at.least(termValue)
            expect(
              POS_StoreCode,
              'Store code sesuai kondisi cart rule'
            ).to.equal(storeCodeTerm.value)
            expect(ResponseDataTiersCartRule).to.include(POS_UserTier)
          } else {
            cy.log(
              `Sub total (${subtotalDetail.total}) kurang dari kondisi cart rule (${termValue}).`
            )
            expect(paymentDetailSubtotal).to.be.lessThan(termValue)
          }
        } else {
          cy.log('Nilai termValue tidak valid. Periksa data terms.')
        }

        //validasi cart rule ter apply [ID, Name, Disc per SKU]
        const cartRuleApplied = data.cartRuleApplied
        const promoValue = response.body.data.items[0].promoBreakdown
        const promoBreakdownValue = promoValue[0].value
        const cartRuleIdAppliedINCart = cartRuleApplied[0]._id
        const cartRule_DispName_Cart = cartRuleApplied[0].displayName
        const [effectType, effectValue, optionalVal2] = effectData.split(',')
        const expecteddisc = price_145500080 * parseFloat(effectValue)
        const PN_Cart = response.body.data.items[0].promoNumber
        const expected_priceSKU_afterDisc = price_145500080 - expecteddisc
        const priceSKU_afterDisc_InCart = response.body.data.items[0].grandTotal

        expect(cartRuleIdAppliedINCart, 'ID Cart rule sesuai').to.equal(
          ResponseDataIDCartrules
        )

        expect(PN_Cart, 'PN Cart rule sesuai').to.equal(promoNumber_CartRule)

        expect(
          cartRule_DispName_Cart,
          'Display Name Cart rule sesuai'
        ).to.equal(ResponseDataNameCartrules)

        expect(
          promoBreakdownValue,
          'Jumlah disc per SKU sesuai pada Cart rule'
        ).to.equal(expecteddisc)

        expect(priceSKU_afterDisc_InCart, 'ID Cart rule sesuai').to.equal(
          expected_priceSKU_afterDisc
        )

        cy.log('ID Cart Rule', ResponseDataIDCartrules)
        cy.log('ID Cart rule di POS', cartRuleIdAppliedINCart)

        cy.log(expecteddisc, 'Expected Disc per SKU')
        cy.log(promoBreakdownValue, 'Actual Disc per SKU pada Cart')

        cy.log(
          expected_priceSKU_afterDisc,
          'Expected harga setelah disck per SKU'
        )
        cy.log(priceSKU_afterDisc_InCart, 'Actual harga setelah disc per SKU')
          ? //mencari total promo pada payment detail
            response.body.data.paymentDetails.find(
              (detail) => detail.label === 'Promo'
            ).total
          : null

        const TotalPromo = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Promo'
        )
        const paymentDetailPromo = TotalPromo.total
        cy.log('Total Promo:', paymentDetailPromo)

        const expectedGrandTotal = subtotalDetail.total + paymentDetailPromo
        cy.log(expectedGrandTotal, 'Expected Grand Total')
          ? //mencari grand total pada payment detail
            response.body.data.paymentDetails.find(
              (detail) => detail.label === 'Total'
            ).total
          : null
        const GrandTotal = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Total'
        )
        paymentDetailTotal = GrandTotal.total
        cy.log('Grand Total POS:', paymentDetailTotal)

        expect(paymentDetailTotal, 'Grand Total sesuai').to.equal(
          expectedGrandTotal
        )
      })
  })

  it(`Successfully select "Tunai" as payment method`, () => {
    const cart = Cypress.env('CART')
    const mockPayload = {
      method: '18',
      isInstallment: false,
      token: '',
      installmentTenor: 0,
      isOvo: false,
      ovoNumber: '',
      ovoRetryCount: 0,
      bin_number: '',
      approvalCode: '',
      value: paymentDetailTotal
    }

    const url =
      URL_PRODUCT +
      `/employee/cart/${Cypress.env('customerId')}/update-payment-v2`
    cy.api({
      url,
      method: 'PATCH',
      headers: Cypress.env('REQUEST_HEADERS'),
      body: mockPayload
    }).should((response) => {
      expect(response.status).to.equal(200)

      const body = response.body.data
      // validate payment field
      const { info, name, changeDue, ...paymentObjResponse } = body.payments
      expect(paymentObjResponse).to.deep.equal(mockPayload)

      // validate multipayment
      expect(body.multiPayments).to.be.an('array')
      expect(body.multiPayments.length).to.be.greaterThan(0)
      expect(
        body.multiPayments[0].name,
        'Payment method selected should Tunai'
      ).to.equal('Tunai')
      Cypress.env('CART', response.body.data)
    })
  })

  // it('Successfully validates pre-order informations', () => {
  //   const url =
  //     URL_PRODUCT +
  //     `/employee/cart/${Cypress.env('customerId')}/validate-purchase`
  //   cy.api({
  //     url,
  //     method: 'GET',
  //     headers: Cypress.env('REQUEST_HEADERS')
  //   }).should((response) => {
  //     expect(response.status).to.equal(200)
  //   })
  // })

  // it('Successfully create order', () => {
  //   const cart = Cypress.env('CART')

  //   // expect(cart.omni_trx_type).to.equal("WALK_IN")
  //   // expect(cart.is_omni).to.equal(false)

  //   const payload = {
  //     cart: cart._id,
  //     approvalCode: cart.payments.approvalCode,
  //     notes: ''
  //   }

  //   const url = URL_PRODUCT + `/order/create-v2`
  //   cy.api({
  //     url,
  //     method: 'POST',
  //     headers: Cypress.env('REQUEST_HEADERS'),
  //     body: payload
  //   }).should((response) => {
  //     expect(response.status).to.equal(201)
  //     const body = response.body.data

  //     expect(body).to.haveOwnProperty('orderNumber')
  //     Cypress.env('orderNumber', response.body.data.orderNumber)
  //     expect(body.cartId).to.equal(cart._id)

  //     expect(body.items).to.be.an('array')
  //     expect(body.items.length).to.be.greaterThan(0)
  //     // let totalItemPrice = 0
  //     // body.items.forEach(item => {
  //     //     totalItemPrice += item.grandTotal
  //     //     const qty = item.qty
  //     //     const totalQtyFromUbdDetail = item.ubdDetail.reduce((total, ubd) => {
  //     //     total += ubd.total
  //     //     return total
  //     //     }, 0)
  //     //     expect(qty).to.equal(totalQtyFromUbdDetail)
  //     // })

  //     expect(body.totalAmount).to.equal(Cypress.env('totalAmount'))
  //     expect(body.paymentAmount).to.equal(Cypress.env('paymentAmount'))
  //     expect(
  //       body.payments.paymentStatus,
  //       'payment.paymentStatus should Paid'
  //     ).to.equal('Paid')
  //     expect(body.paymentStatus, 'paymentStatus should Paid').to.equal('Paid')
  //     expect(body.orderStatus, 'orderStatus should PAID').to.equal('PAID')
})
