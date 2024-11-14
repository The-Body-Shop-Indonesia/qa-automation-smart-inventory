const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('Check cart rule', function () {
  before(() => {
    cy.log(Cypress.env('ADMIN_USERNAME'))
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
    })
      .should((response) => {
        expect(response.status, 'Response code should be 201').to.equal(201)
        const body = response.body
        expect(body.statusCode, 'Status code should be 201').to.equal(201)
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

  it('Check cart rule', () => {
    const promo_id = '6728958597d0152c75b0d950'
    const url = URL_PRODUCT + `/cart-rule/get/${promo_id}`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const data = response.body.data
        Cypress.env('CARTRULE_DATA', data)
        console.log(Cypress.env('CARTRULE_DATA'))
        //const cust_tier = Cypress.env('CARTRULE_DATA').tiers
        // const rawTermsData = Cypress.env('CARTRULE_DATA').rawTermsData
        // cy.log(Cypress.env('CARTRULE_DATA').rawTermsData)
        // const promoTerm = JSON.parse(rawTermsData)
        // console.log(promoTerm)
        // const rawEffectData = Cypress.env('CARTRULE_DATA').rawEffectData
        // cy.log(Cypress.env('CARTRULE_DATA').rawEffectData)
        // const promoEffect = JSON.parse(rawEffectData)
        // console.log(promoEffect)
      })
  })
})

describe('Customer cart section', function () {
  const urlCust = URL_USER + '/otp/validate'

  before(() => {
    cy.api({
      method: 'POST',
      url: urlCust,
      body: {
        identifier: Cypress.env('USER_EMAIL'),
        otp: Cypress.env('USER_OTP'),
        pageType: 'Login'
      }
    })
      .should((response) => {
        expect(response.status).to.equal(201)
      })
      .then((response) => {
        const custToken = response.body.data.accessToken
        Cypress.env('CUSTOMER_REQ_HEADERS', {
          Authorization: 'Bearer ' + custToken,
          channel: 'web'
        })
      })
  })

  //get shipping address customer
  before(() => {
    const url_customer_address = URL_USER + '/address?sort=-updatedAt'
    cy.api({
      method: 'GET',
      url: url_customer_address,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).then((response) => {
      const cust_address = response.body.data.docs[0]
      Cypress.env('CUST_ADDRESS', cust_address)
      console.log(Cypress.env('CUST_ADDRESS'))
    })
  })

  it('Add product to cart and check promo GWP', () => {
    const url = URL_PRODUCT + '/cart/my-cart'
    const url_add = URL_PRODUCT + '/cart/add'
    const url_remove_items = URL_PRODUCT + '/cart/remove-all-item'

    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const data = response.body.data
        //remove all items if items not empty
        if (data.items.length > 0) {
          cy.log('Cart is not empty')
          cy.api({
            method: 'PATCH',
            url: url_remove_items,
            headers: Cypress.env('CUSTOMER_REQ_HEADERS')
          })
        } else {
          cy.log('Cart is empty')
        }

        //promoterm
        const rawTermsData = Cypress.env('CARTRULE_DATA').rawTermsData
        cy.log(rawTermsData)
        const promoTerm = JSON.parse(rawTermsData)
        //console.log(promoTerm)
        //promoeffect
        const rawEffectData = Cypress.env('CARTRULE_DATA').rawEffectData
        cy.log(rawEffectData)
        const promoEffect = JSON.parse(rawEffectData)
        //console.log(promoEffect)

        const sku_term = promoTerm[2].optionalVal
        const sku_term_qty = parseInt(promoTerm[2].value)
        const sku_term_operator = promoTerm[2].operator
        const total_value_term = parseInt(promoTerm[1].value)
        const total_value_term_operator = promoTerm[1].operator
        const sku_effect = promoEffect.optionalVal1
        const sku_effect_qty = parseInt(promoEffect.value)
        const sku_effect_type = promoEffect.type

        cy.log('Promo type: ' + sku_effect_type)
        cy.log('SKU condition: ' + sku_term)
        cy.log(`SKU condition qty ${sku_term_operator} ${sku_term_qty}`)
        cy.log(
          `Total value condition ${total_value_term_operator} ${total_value_term}`
        )
        cy.log('SKU GWP: ' + sku_effect)
        cy.log('Qty SKU GWP: ' + sku_effect_qty)

        //add product
        cy.api({
          method: 'POST',
          url: url_add,
          headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
          body: {
            sku: sku_term,
            qty: sku_term_qty,
            notes: ''
          }
        }).should((response) => {
          expect(response.status, 'Response code should be 201').to.equal(201)
          const data = response.body.data
          const items = response.body.data.items
          const customer = response.body.data.customer
          const GWP = response.body.data.freeProducts
          const cart_rule_applied = response.body.data.cartRuleApplied[0]

          //cart rule applied check section
          expect(
            cart_rule_applied._id,
            `Cart rule applied on cart should have id ${Cypress.env('CARTRULE_DATA')._id}`
          ).to.equal(Cypress.env('CARTRULE_DATA')._id)
          expect(
            cart_rule_applied.name,
            `Cart rule applied on cart should have name ${Cypress.env('CARTRULE_DATA').name}`
          ).to.equal(Cypress.env('CARTRULE_DATA').name)
          expect(
            cart_rule_applied.promoNumber,
            `Cart rule applied on cart should have promo number ${Cypress.env('CARTRULE_DATA').promoNumber}`
          ).to.equal(Cypress.env('CARTRULE_DATA').promoNumber)
          expect(cart_rule_applied.rawTermsData).to.equal(
            Cypress.env('CARTRULE_DATA').rawTermsData
          )
          expect(cart_rule_applied.rawEffectData).to.equal(
            Cypress.env('CARTRULE_DATA').rawEffectData
          )

          //cart condition should same as in cart rule condition or not
          expect(
            Cypress.env('CARTRULE_DATA').tiers,
            `Customer tier ${customer.customerGroup} should be in cart rule condition`
          ).to.include(customer.customerGroup)
          expect(
            data.totalAmount,
            `Total Amount should be ${total_value_term_operator} ${total_value_term}`
          ).to.be.gte(total_value_term)
          expect(
            items[0].sku,
            `Product ${sku_term} should be in customer cart as cart rule condition`
          ).to.equal(sku_term)
          expect(
            items[0].qty,
            `Product term qty should be ${sku_term_operator} ${sku_term_qty} as cart rule condition`
          ).to.be.gte(sku_term_qty)
          expect(
            items[0].ubdDetail[0].ubd,
            `Product term ubd in ubd detail should be null`
          ).to.equal(null)
          expect(
            items[0].ubdDetail[0].total,
            `Product term total in ubd detail should be ${sku_term_qty}`
          ).to.be.gte(sku_term_qty)

          //free product section check
          expect(GWP.length, 'GWP length on data should be 1').to.equal(1)
          expect(
            GWP[0].sku,
            `Product GWP should be ${sku_effect} as cart rule reward`
          ).to.equal(sku_effect)
          expect(
            GWP[0].qty,
            `GWP product qty should be ${sku_effect_qty}`
          ).to.equal(sku_effect_qty)
          expect(
            GWP[0].promoNumber,
            `GWP Promo Number should be ${Cypress.env('CARTRULE_DATA').promoNumber}`
          ).to.equal(Cypress.env('CARTRULE_DATA').promoNumber)
          expect(
            GWP[0].grandTotal,
            `GWP product grand total should be 0`
          ).to.equal(0)
        })
      })
  })

  it('Update address and shipping method', () => {
    const url_update_address = URL_PRODUCT + '/cart/update-shipping-address'
    const url_get_shipping_method =
      URL_PRODUCT + '/cart/available-shipping-method'
    const url_update_shipping = URL_PRODUCT + '/cart/update-shipping-method'

    //update customer address
    cy.api({
      method: 'PATCH',
      url: url_update_address,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        cityId: Cypress.env('CUST_ADDRESS').cityId,
        city: Cypress.env('CUST_ADDRESS').city,
        postalCode: Cypress.env('CUST_ADDRESS').postalCode,
        district: Cypress.env('CUST_ADDRESS').district,
        regionName: Cypress.env('CUST_ADDRESS').regionName,
        street: Cypress.env('CUST_ADDRESS').street,
        recipientName: Cypress.env('CUST_ADDRESS').recipientName,
        recipientPhone: Cypress.env('CUST_ADDRESS').recipientPhone,
        addressName: Cypress.env('CUST_ADDRESS').addressName
      }
    }).should((response) => {
      expect(response.status, 'Response code should be 200').to.equal(200)
      const data = response.body.data
      const shipping_address = data.shippingAddress

      expect(
        shipping_address.cityId,
        `City ID should be ${Cypress.env('CUST_ADDRESS').cityId}`
      ).to.equal(Cypress.env('CUST_ADDRESS').cityId)
      expect(
        shipping_address.city,
        `Address city should be ${Cypress.env('CUST_ADDRESS').city}`
      ).to.equal(Cypress.env('CUST_ADDRESS').city)
      expect(shipping_address.postalCode).to.equal(
        Cypress.env('CUST_ADDRESS').postalCode
      )
      expect(
        shipping_address.district,
        `Address district should be ${Cypress.env('CUST_ADDRESS').district}`
      ).to.equal(Cypress.env('CUST_ADDRESS').district)
      expect(
        shipping_address.regionName,
        `Address region name should be ${Cypress.env('CUST_ADDRESS').regionName}`
      ).to.equal(Cypress.env('CUST_ADDRESS').regionName)
      expect(
        shipping_address.street,
        `Address street should be ${Cypress.env('CUST_ADDRESS').street}`
      ).to.equal(Cypress.env('CUST_ADDRESS').street)
      expect(
        shipping_address.recipientName,
        `Address recipient name should be ${Cypress.env('CUST_ADDRESS').recipientName}`
      ).to.equal(Cypress.env('CUST_ADDRESS').recipientName)
      expect(
        shipping_address.recipientPhone,
        `Address recipient phone should be ${Cypress.env('CUST_ADDRESS').recipientPhone}`
      ).to.equal(Cypress.env('CUST_ADDRESS').recipientPhone)
      expect(
        shipping_address.addressName,
        `Address name should be ${Cypress.env('CUST_ADDRESS').addressName}`
      ).to.equal(Cypress.env('CUST_ADDRESS').addressName)
    })

    //update shipping method
    cy.api({
      method: 'GET',
      url: url_get_shipping_method,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const data = response.body.data[0]
        const get_shipping_method = data.couriers[0]
        Cypress.env('COURIERS_DATA', get_shipping_method)
        // console.log(Cypress.env('COURIERS_DATA'))
        cy.api({
          method: 'PATCH',
          url: url_update_shipping,
          headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
          body: {
            courierCode: Cypress.env('COURIERS_DATA').courierCode
          }
        }).should((response) => {
          const data = response.body.data
          const shipping_method = data.shippingMethod
          expect(response.status, 'Response code should be 200').to.equal(200)

          expect(
            shipping_method.courierCode,
            `Courier Code should be ${Cypress.env('COURIERS_DATA').courierCode}`
          ).to.equal(Cypress.env('COURIERS_DATA').courierCode)
          expect(
            shipping_method.courierName,
            `Courier Name should be ${Cypress.env('COURIERS_DATA').courierName}`
          ).to.equal(Cypress.env('COURIERS_DATA').courierName)
          expect(
            shipping_method.price,
            `Shipping Price should be ${Cypress.env('COURIERS_DATA').price}`
          ).to.equal(Cypress.env('COURIERS_DATA').price)
        })
      })
      .then((response) => {
        const data = response.body.data
        Cypress.env('CART_DATA', data)
      })
  })

  it('Update payment', () => {
    const url_available_payment = URL_PRODUCT + '/cart/available-payment-method'
    const url_update_payment = URL_PRODUCT + '/cart/update-payment'
    const cart_data = Cypress.env('CART_DATA')
    const total_amount = cart_data.totalAmount

    cy.api({
      method: 'GET',
      url: url_available_payment,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    })
      .should((response) => {
        expect(response.status, 'Response code should be 200').to.equal(200)
      })
      .then((response) => {
        const data = response.body.data[1]
        const get_payment_method = data.paymentMethods[0]
        Cypress.env('PAYMENT_DATA', get_payment_method)
        console.log(Cypress.env('PAYMENT_DATA'))

        cy.api({
          method: 'PATCH',
          url: url_update_payment,
          headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
          body: {
            method: Cypress.env('PAYMENT_DATA').code,
            isInstallment: false,
            token: '',
            installmentTenor: 0,
            isOvo: false,
            ovoNumber: '',
            ovoRetryCount: 0,
            bin_number: '',
            approvalCode: '',
            value: total_amount
          }
        }).should((response) => {
          const data = response.body.data
          const payment_method = data.payments

          expect(response.status, 'Response code should be 200').to.equal(200)

          expect(
            payment_method.method,
            `Payment method should be ${Cypress.env('PAYMENT_DATA').code}`
          ).to.equal(Cypress.env('PAYMENT_DATA').code)
          expect(
            payment_method.info.code,
            `Payment code should be ${Cypress.env('PAYMENT_DATA').code}`
          ).to.equal(Cypress.env('PAYMENT_DATA').code)
          expect(
            payment_method.name,
            `Payment name should be ${Cypress.env('PAYMENT_DATA').name}`
          ).to.equal(Cypress.env('PAYMENT_DATA').name)
          expect(
            payment_method.value,
            `Payment value should be ${total_amount}`
          ).to.equal(total_amount)
        })
      })
  })

  it('Create order', () => {
    const url_order = URL_PRODUCT + '/order/create-v2'

    cy.api({
      method: 'POST',
      url: url_order,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        cart: Cypress.env('CART_DATA')._id
      }
    }).should((response) => {
      const cart_data = Cypress.env('CART_DATA')
      const cart_items = cart_data.items[0]
      const cart_gwp = cart_data.freeProducts[0]
      const order_data = response.body.data
      const order_items = order_data.items

      expect(response.status, 'Response code should be 201').to.equal(201)
      expect(order_data).to.haveOwnProperty('orderNumber')

      expect(order_data.cartId, `Cart ID should be ${cart_data._id}`).to.equal(
        cart_data._id
      )

      //product biasa
      expect(
        order_items[0].sku,
        `SKU ${cart_items.sku} should be in order`
      ).to.equal(cart_items.sku)
      expect(
        order_items[0].qty,
        `SKU qty ${cart_items.qty} should be in order`
      ).to.equal(cart_items.qty)
      expect(
        order_items[0].price,
        `SKU price ${cart_items.product.price} should be in order`
      ).to.equal(cart_items.product.price)
      expect(
        order_items[0].grandTotal,
        `SKU price ${cart_items.grandTotal} should be in order`
      ).to.equal(cart_items.grandTotal)
      expect(
        order_items[0].ubdDetail[0].ubd,
        `SKU ubd should be null in order`
      ).to.equal(null)
      expect(
        order_items[0].ubdDetail[0].total,
        `SKU ubd total shoud be ${cart_items.qty} in order`
      ).to.equal(cart_items.qty)

      //product GWP
      expect(
        order_items[1].sku,
        `SKU GWP ${cart_gwp.sku} should be in order`
      ).to.equal(cart_gwp.sku)
      expect(
        order_items[1].qty,
        `GWP qty ${cart_gwp.qty} should be in order`
      ).to.equal(cart_gwp.qty)
      expect(
        order_items[1].promoNumber,
        `Promo Number ${cart_gwp.promoNumber} should be in order`
      ).to.equal(cart_gwp.promoNumber)
      expect(
        order_items[1].grandTotal,
        `SKU GWP price 0 should be in order`
      ).to.equal(0)
      expect(
        order_items[0].ubdDetail[0].ubd,
        `SKU GWP ubd should be null in order`
      ).to.equal(null)
      expect(
        order_items[0].ubdDetail[0].total,
        `SKU GWP ubd total shoud be ${cart_gwp.qty} in order`
      ).to.equal(cart_gwp.qty)
    })
  })
})

//ubd detail
