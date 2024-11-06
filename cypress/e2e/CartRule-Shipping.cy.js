const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PAYMENT = Cypress.config('baseUrlPayment')

describe('Set cart rule to apply', function () {
  it('Login admin', () => {
    const url = URL_USER + '/admin/login'
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
  it('Set cart rule', () => {
    const url =
      URL_PRODUCT +
      '/cart-rule?page=1&limit=10&keyword=PNAUTOSHIP&is_exclusive=false&is_discard=false'
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN')
    }).then((response) => {
      const data = response.body.data.docs[0]
      Cypress.env('CARTRULE_DETAILS', data)
      const effect = data.effect
      const rawEffectData = data.rawEffectData
      const rawEffect = JSON.parse(rawEffectData)
      const type = rawEffect.type
      const val = rawEffect.value
      const optionalVal1 = rawEffect.optionalVal1
      Cypress.env('CARTRULE_TYPE', type) //shipping_fee
      Cypress.env('CARTRULE_VALUE', val) //15000
      Cypress.env('CARTRULE_OPTIONALVAL1', optionalVal1) //fix_amount
      const terms = data.terms
      const rawTermsData = data.rawTermsData
      const termsArray = JSON.parse(rawTermsData)
      // Mengambil nilai tertentu dari masing-masing objek dalam array
      const subTotalValue = termsArray[0].value
      const channelValue = termsArray[1].value
      const shippingValue = termsArray[2].value
      Cypress.env('CARTRULE_SUBTOTAL', subTotalValue) //150000
      Cypress.env('CARTRULE_CHANNEL', channelValue) //mobile;web
      Cypress.env('CARTRULE_SHIPPING', shippingValue) //sap-regular
      const channelArray = channelValue.split(';')
      const newChannelArray = channelArray.map((channel) => {
        if (channel === 'mobile' || channel === 'web') {
          return 'ONLINE'
        } else if (channel === 'pos') {
          return 'WALK-IN'
        }
      })
      Cypress.env('CARTRULE_CHANNEL_ARRAY', newChannelArray)
    })
  })
})
describe('Set sku product to use', function () {
  before('Set sku product', () => {
    // Mengambil data dari fixture
    cy.fixture('skus').then((data) => {
      const skus = data.skuProducts
      const selectedSkus = new Set() // Set untuk memastikan SKU unik

      while (selectedSkus.size < 4) {
        const randomIndex = Math.floor(Math.random() * skus.length)
        selectedSkus.add(skus[randomIndex])
      }

      // Mengubah Set ke array
      const [sku1, sku2, sku3, sku4] = Array.from(selectedSkus)
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku1}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_A', data)
      })
      cy.api({
        method: 'GET',
        url: `${URL_PRODUCT}/product/search/${sku2}`
      }).then((response) => {
        const data = response.body.data
        Cypress.env('Product_B', data)
      })
    })
  })
  it('Used sku', () => {
    const itemA = Cypress.env('Product_A')
    const itemB = Cypress.env('Product_B')
    cy.log(`Item A: ${itemA.sku}, price: ${itemA.price}`)
    cy.log(`Item B: ${itemB.sku}, price: ${itemB.price}`)
  })
})

describe('Customer add product to cart', () => {
  before('Login customer', () => {
    const identifier = Cypress.env('IDENTIFIER_SDC')
    const otp = Cypress.env('OTP_SDC')
    const url = `${URL_USER}/otp/validate`
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        identifier: identifier,
        otp: otp,
        pageType: 'Login'
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenUser = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_USER', {
        Authorization: 'Bearer ' + tokenUser,
        channel: 'web'
      })
    })
  })
  before('Check cart', () => {
    const url = `${URL_PRODUCT}/cart/my-cart`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      const items = response.body.data.items
      Cypress.env('ITEMS', items.length)
    })
  })
  before('Clear cart', () => {
    const url = `${URL_PRODUCT}/cart/remove-all-item`
    const items = Cypress.env('ITEMS')
    Cypress._.times(items, (i) => {
      cy.api({
        method: 'PATCH',
        url,
        headers: Cypress.env('REQUEST_HEADERS_USER')
      }).then((response) => {
        expect(response.status).to.equal(200)
      })
    })
  })

  it('Add product to cart', () => {
    const url = `${URL_PRODUCT}/cart/add`
    const product = Cypress.env('Product_A')
    const sku = product.sku
    const price = product.price
    const name = product.name
    const qty = 1
    const payload = {
      sku: sku,
      qty: qty,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      const cartId = response.body.data._id
      Cypress.env('CART_ID', cartId)
      const items = response.body.data.items
      expect(items[0].sku, 'SKU should ' + sku).to.equal(sku)
      expect(items[0].product.name, `Product name should be ${name}`).to.equal(
        name
      )
      expect(
        items[0].qty,
        'Quantity of product ' + sku + ' should ' + qty
      ).to.equal(qty)
      const productPrice = items[0].product.price
      expect(productPrice, `Product price should be ${price}`).to.equal(price)
      Cypress.env(`price_${sku}`, price)
      Cypress.env('totalAmount', price)
      Cypress.env('paymentAmount', price)
    })
  })

  it('Add other product to cart', () => {
    const url = `${URL_PRODUCT}/cart/add`
    const product = Cypress.env('Product_B')
    const sku = product.sku
    const price = product.price
    const name = product.name
    const qty = 1
    const payload = {
      sku: sku,
      qty: qty,
      customPrice: 0,
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      const items = response.body.data.items
      expect(items[1].sku, 'SKU should ' + sku).to.equal(sku)
      expect(items[1].product.name, `Product name should be ${name}`).to.equal(
        name
      )
      expect(
        items[1].qty,
        'Quantity of product ' + sku + ' should ' + qty
      ).to.equal(qty)
      const productPrice = items[1].product.price
      expect(productPrice, `Product price should be ${price}`).to.equal(price)
      Cypress.env(`price_${sku}`, price)
      const totalAmount = Cypress.env('totalAmount') + price
      Cypress.env('totalAmount', totalAmount)
      Cypress.env('paymentAmount', totalAmount)
      //sub_total
      expect(
        items[1].sub_total,
        'sub_total of product ' + sku + ' should ' + price
      ).to.equal(price)
      expect(
        response.body.data.totalAmount,
        'totalAmount should ' + Cypress.env('totalAmount')
      ).to.equal(Cypress.env('totalAmount'))
      expect(
        response.body.data.paymentAmount,
        'paymentAmount should ' + Cypress.env('paymentAmount')
      ).to.equal(Cypress.env('paymentAmount'))
      const paymentDetails = response.body.data.paymentDetails
      expect(
        paymentDetails[0].total,
        'paymentDetails.Subtotal should ' + Cypress.env('paymentAmount')
      ).to.equal(Cypress.env('paymentAmount'))
      expect(
        paymentDetails[12].total,
        'paymentDetails.Total should ' + Cypress.env('paymentAmount')
      ).to.equal(Cypress.env('paymentAmount'))
    })
  })
})

describe('Customer checkout product', () => {
  before('Customer get address list', () => {
    const url = `${URL_USER}/address`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      const docs = response.body.data.docs[0]
      Cypress.env('ADDRESS', docs)
    })
  })

  it('Should able to set address', () => {
    const url = `${URL_PRODUCT}/cart/update-shipping-address`
    const address = Cypress.env('ADDRESS')
    const payload = {
      cityId: address.cityId,
      city: address.city,
      postalCode: address.postalCode,
      district: address.district,
      regionName: address.regionName,
      street: address.street,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      addressName: address.addressName,
      pinpointLatLong: address.pinpointLatLong,
      pinpointAddress: address.pinpointAddress,
      note: address.note
    }
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(
        response.body.data.shippingAddress.city,
        'City should be' + address.city
      ).to.equal(address.city)
      expect(
        response.body.data.shippingAddress.postalCode,
        'Postal code should be' + address.postalCode
      ).to.equal(address.postalCode)
      expect(
        response.body.data.shippingAddress.district,
        'District should be' + address.district
      ).to.equal(address.district)
      expect(
        response.body.data.shippingAddress.regionName,
        'Region name should be' + address.regionName
      ).to.equal(address.regionName)
      expect(
        response.body.data.shippingAddress.street,
        'Street should be' + address.street
      ).to.equal(address.street)
      expect(
        response.body.data.shippingAddress.recipientName,
        'Recipient name should be' + address.recipientName
      ).to.equal(address.recipientName)
      expect(
        response.body.data.shippingAddress.recipientPhone,
        'Recipient phone should be' + address.recipientPhone
      ).to.equal(address.recipientPhone)
      expect(
        response.body.data.shippingAddress.addressName,
        'Address name should be' + address.addressName
      ).to.equal(address.addressName)
      expect(
        response.body.data.shippingAddress.pinpointLatLong,
        'Pinpoint lat long should be' + address.pinpointLatLong
      ).to.equal(address.pinpointLatLong)
      expect(
        response.body.data.shippingAddress.pinpointAddress,
        'Pinpoint address should be' + address.pinpointAddress
      ).to.equal(address.pinpointAddress)
      expect(
        response.body.data.shippingAddress.note,
        'Note should be' + address.note
      ).to.equal(address.note)
    })
  })
  it('Should able to get shipping methods', () => {
    const url = `${URL_PRODUCT}/cart/available-shipping-method`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(response.body.data.length).to.be.greaterThan(0)
      const datas = response.body.data
      datas.forEach((data) => {
        const code = data.code
        const title = data.title
        if (code === 'regular') {
          const couriers = data.couriers
          couriers.forEach((courier) => {
            const courierCode = courier.courierCode
            if (courierCode === 'sap-regular') {
              Cypress.env('SAP_REG', courier)
            }
          })
        }
      })
    })
  })
  it('Should able to set shipping method', () => {
    const url = `${URL_PRODUCT}/cart/update-shipping-method`
    const sap_reg = Cypress.env('SAP_REG')
    const payload = {
      courierCode: sap_reg.courierCode,
      courierName: sap_reg.courierName,
      courierDescription: sap_reg.courierDescription,
      courierImage: '',
      weight: sap_reg.weight,
      price: sap_reg.price,
      estimate: sap_reg.estimate,
      status: true,
      shippingWeight: sap_reg.shippingWeight
    }
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(200)
      const shippingMethod = response.body.data.shippingMethod
      expect(
        shippingMethod.courierCode,
        `courierCode should ${sap_reg.courierCode}`
      ).to.equal(sap_reg.courierCode)
      expect(
        shippingMethod.courierName,
        `courierName should ${sap_reg.courierName}`
      ).to.equal(sap_reg.courierName)
      expect(
        shippingMethod.courierDescription,
        `courierDescription should ${sap_reg.courierDescription}`
      ).to.equal(sap_reg.courierDescription)
      expect(
        shippingMethod.courierImage,
        `courierImage should ${sap_reg.courierImage}`
      ).to.equal(sap_reg.courierImage)
      expect(shippingMethod.weight, `weight should ${sap_reg.weight}`).to.equal(
        sap_reg.weight
      )
      expect(shippingMethod.price, `price should ${sap_reg.price}`).to.equal(
        sap_reg.price
      )
      expect(
        shippingMethod.estimate,
        `estimate should ${sap_reg.estimate}`
      ).to.equal(sap_reg.estimate)
      expect(shippingMethod.status, `status should be ${true}`).to.equal(true)
      const shippingFee = sap_reg.weight * sap_reg.price
      expect(
        shippingMethod.shippingFee,
        `shippingFee should be ${shippingFee}`
      ).to.equal(shippingFee)
      Cypress.env('SHIPPING_FEE', shippingFee)
      expect(
        shippingMethod.shippingWeight,
        `shippingWeight should ${sap_reg.shippingWeight}`
      ).to.equal(sap_reg.shippingWeight)
    })
  })
  it('Order summary price breakdown', () => {
    const url = `${URL_PRODUCT}/cart/my-cart`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      const paymentDetails = response.body.data.paymentDetails
      const subtotal = Cypress.env('totalAmount')
      const shippingFee = Cypress.env('SHIPPING_FEE')
      const shippingDiscount = Cypress.env('CARTRULE_VALUE') * -1
      const shippingMethod = response.body.data.shippingMethod
      const channelArray = Cypress.env('CARTRULE_CHANNEL_ARRAY')
      const omni_trx_type = response.body.data.omni_trx_type
      expect(
        paymentDetails[0].total,
        `Subtotal should be ${subtotal}`
      ).to.equal(subtotal)
      expect(
        paymentDetails[1].details[0].value,
        `Shipping value should be ${shippingFee}`
      ).to.equal(shippingFee)
      if (
        subtotal >= Cypress.env('CARTRULE_SUBTOTAL') &&
        shippingMethod.courierCode === Cypress.env('CARTRULE_SHIPPING') &&
        channelArray.includes(omni_trx_type)
      ) {
        expect(
          paymentDetails[3].total,
          `Shipping discount should be ${shippingDiscount}`
        ).to.equal(shippingDiscount)
        var total = subtotal + shippingFee + shippingDiscount
      } else {
        var total = subtotal + shippingFee
      }
      expect(paymentDetails[12].total, `Total should be ${total}`).to.equal(
        total
      )
      Cypress.env('paymentAmount', total)
      expect(
        response.body.data.paymentAmount,
        `Payment amount should be ${total}`
      )
    })
  })
  it('Should able to get payment methods', () => {
    const url = `${URL_PAYMENT}/payment-method?amount=${Cypress.env('paymentAmount')}`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(response.body.data.length).to.be.greaterThan(0)
      const data = response.body.data
      expect(data[0].code).to.equal('BankTransferVA')
      const paymentMethodCode = data[0].paymentMethods[0].code
      if (paymentMethodCode === 'va_bca') {
        Cypress.env('VA_BCA', data[0].paymentMethods[0])
      }
    })
  })
  it('Should able to set payment method', () => {
    const url = `${URL_PRODUCT}/cart/update-payment`
    const va_bca = Cypress.env('VA_BCA')
    const payload = {
      method: va_bca.code,
      isInstallment: false,
      token: '',
      installmentTenor: 0,
      isOvo: false,
      ovoNumber: '',
      ovoRetryCount: 0,
      bin_number: '',
      approvalCode: '123321',
      value: Cypress.env('paymentAmount')
    }
    cy.api({
      method: 'PATCH',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(200)
      const paymentMethod = response.body.data.payments
      expect(paymentMethod.method, `method should ${va_bca.code}`).to.equal(
        va_bca.code
      )
      expect(
        paymentMethod.isInstallment,
        `isInstallment should be false`
      ).to.equal(false)
      expect(paymentMethod.token, `token should be empty string`).to.equal('')
      expect(
        paymentMethod.installmentTenor,
        `installmentTenor should be 0`
      ).to.equal(0)
      expect(paymentMethod.isOvo, `isOvo should be false`).to.equal(false)
      expect(
        paymentMethod.ovoNumber,
        `ovoNumber should be empty string`
      ).to.equal('')
      expect(
        paymentMethod.bin_number,
        `bin_number should be empty string`
      ).to.equal('')
    })
  })
  it('Should able to create order', () => {
    const url = `${URL_PRODUCT}/order/create-v2`
    const payload = {
      cart: Cypress.env('CART_ID'),
      approvalCode: '123321',
      gwps: [],
      notes: ''
    }
    cy.api({
      method: 'POST',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      const orderId = response.body.data._id
      const orderNumber = response.body.data.orderNumber
      expect(orderId).to.not.be.empty
      expect(orderNumber, `Order number should not be empty, ${orderNumber}`).to
        .not.be.empty
      Cypress.env('ORDER_ID', orderId)
      Cypress.env('ORDER_NUMBER', orderNumber)
    })
  })
})
