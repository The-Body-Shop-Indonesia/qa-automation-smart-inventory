const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const url_admin = URL_USER + '/admin/login'

let cartId
let customerId
describe('Prepare cart', () => {
  before('User Login Admin', () => {
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

  before('User Login POS', () => {
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

  before('Check shift', () => {
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

  before('Close shift', () => {
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

  before('Open shift', () => {
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

  it('Should able to create cart for Single product', () => {
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
      Cypress.env('cartId1', cartId)
      customerId = response.body.data.customer._id
      Cypress.env('customerId1', customerId)
    })

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
      Cypress.env('cartId1B', cartId)
      customerId = response.body.data.customer._id
      Cypress.env('customerId1B', customerId)
    })
  })

  it('Should able to create cart for Multiple product', () => {
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
      Cypress.env('cartId2', cartId)
      customerId = response.body.data.customer._id
      Cypress.env('customerId2', customerId)
    })
  })
})

describe('Add items Single', () => {
  it('Should be able to add single products to cart with UBD Null', () => {
    cy.fixture('skus').then((data) => {
      const sku = data.skuPOS[1]
      const sku_Name = data.skuPOSName[1]
      Cypress.env('SKU', { sku: sku, qty: 1, name: sku_Name })

      const AddSKU = {
        sku: Cypress.env('SKU').sku,
        qty: Cypress.env('SKU').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: null
      }
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId1B') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: AddSKU
      }).then((response) => {
        expect(response.status).to.eq(201)
        const items = response.body.data.items
        const itemss = response.body.data.items[0]
        Cypress.env('qty', itemss.qty)
        Cypress.env('product', itemss.product)
        const ubdDetails = itemss.ubdDetail

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )

        Cypress.env('price', Cypress.env('product').multi_price.price)
        Cypress.env('SubTotalPaymnetDetail', subtotalDetail.total)
        Cypress.env('SubTotalProduct', itemss.sub_total)

        ubdDetails.forEach((ubdItem) => {
          const ubdDate = ubdItem.ubd.slice(0, 7)
          Cypress.env('ubdDate', ubdDate)
          Cypress.env('ubdTotal', ubdItem.total)

          expect(items, 'jumlah data Items').to.have.length(1)

          expect(Cypress.env('product')).to.have.property(
            'sku',
            Cypress.env('SKU').sku
          )

          expect(Cypress.env('product')).to.have.property(
            'name',
            Cypress.env('SKU').name
          )
          expect(AddSKU.qty, 'Qty Produk').to.eq(Cypress.env('qty'))
          expect(AddSKU.ubd).to.eq(Cypress.env('ubdDate'))
          expect(Cypress.env('product')).to.have.property('price', 319000)
          expect(Cypress.env('ubdDate')).to.eq(AddSKU.ubd)
          expect(Cypress.env('price')).to.eq(Cypress.env('SubTotalProduct'))

          cy.log('Name SKU1:', Cypress.env('SKU').name)
          cy.log('UBD SKU 1:', Cypress.env('ubdDate'))
          cy.log('Total UBD SKU-1:', Cypress.env('ubdTotal'))
        })
      })
    })
  })

  it('Should be able to add single products to cart with UBD Date', () => {
    cy.fixture('skus').then((data) => {
      const sku1 = data.skuPOS[0]
      const sku2 = data.skuPOS[1]
      const sku1_Name = data.skuPOSName[0]
      const sku2_Name = data.skuPOSName[1]
      Cypress.env('SKU', { sku: sku1, qty: 1, name: sku1_Name })

      const AddSKU = {
        sku: Cypress.env('SKU').sku,
        qty: Cypress.env('SKU').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-11'
      }
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId1') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: AddSKU
      }).then((response) => {
        expect(response.status).to.eq(201)
        const items = response.body.data.items
        const itemss = response.body.data.items[0]
        Cypress.env('qty', itemss.qty)
        Cypress.env('product', itemss.product)
        const ubdDetails = itemss.ubdDetail

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )

        Cypress.env('price', Cypress.env('product').multi_price.price)
        Cypress.env('SubTotalPaymnetDetail', subtotalDetail.total)
        Cypress.env('SubTotalProduct', itemss.sub_total)

        ubdDetails.forEach((ubdItem) => {
          const ubdDate = ubdItem.ubd.slice(0, 7)
          Cypress.env('ubdDate', ubdDate)
          Cypress.env('ubdTotal', ubdItem.total)

          expect(items, 'jumlah data Items').to.have.length(1)

          expect(Cypress.env('product')).to.have.property(
            'sku',
            Cypress.env('SKU').sku
          )

          expect(Cypress.env('product')).to.have.property(
            'name',
            Cypress.env('SKU').name
          )
          expect(AddSKU.qty, 'Qty Produk').to.eq(Cypress.env('qty'))
          expect(Cypress.env('ubdDate')).to.eq(AddSKU.ubd)
          expect(Cypress.env('product')).to.have.property('price', 319000)
          expect(Cypress.env('ubdDate')).to.eq(AddSKU.ubd)
          expect(Cypress.env('price')).to.eq(Cypress.env('SubTotalProduct'))

          cy.log('Name SKU1:', Cypress.env('SKU').name)
          cy.log('UBD SKU 1:', Cypress.env('ubdDate'))
          cy.log('Total UBD SKU-1:', Cypress.env('ubdTotal'))
        })
      })
    })
  })

  afterEach(() => {
    cy.api({
      method: 'DELETE',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId1'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false // Memastikan bahwa Cypress tidak menghentikan eksekusi jika tidak ditemukan cart
    }).then((response) => {
      if (response.status === 200) {
        cy.log('Cart has been successfully deleted after the test.')
      } else if (
        response.status === 400 &&
        response.body.message === 'No cart found !'
      ) {
        cy.log('No cart found, skipping deletion.')
      } else {
        cy.log('Unexpected error: ', response.body.message)
      }
    })

    cy.api({
      method: 'DELETE',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId1B'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false // Memastikan bahwa Cypress tidak menghentikan eksekusi jika tidak ditemukan cart
    }).then((response) => {
      if (response.status === 200) {
        cy.log('Cart has been successfully deleted after the test.')
      } else if (
        response.status === 400 &&
        response.body.message === 'No cart found !'
      ) {
        cy.log('No cart found, skipping deletion.')
      } else {
        cy.log('Unexpected error: ', response.body.message)
      }
    })
  })
})

describe('Add Multiple Items', () => {
  it('Should be able to add many products to cart', () => {
    cy.fixture('skus').then((data) => {
      const sku1 = data.skuPOS[0]
      const sku2 = data.skuPOS[1]
      const sku3 = data.skuPOS[2]
      const sku1_Name = data.skuPOSName[0]
      const sku2_Name = data.skuPOSName[1]
      const sku3_Name = data.skuPOSName[2]

      Cypress.env('SKU1', { sku: sku1, qty: 1, name: sku1_Name })
      Cypress.env('SKU2', { sku: sku2, qty: 1, name: sku2_Name })

      const requestAddSKU1 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU1').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-07'
      }
      const requestAddSKU2 = {
        sku: Cypress.env('SKU2').sku,
        qty: Cypress.env('SKU2').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-03'
      }

      const requestAddSKU3 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU1').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-09'
      }

      //add sku 1
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId2') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU1
      }).then((response) => {
        expect(response.status).to.eq(201)
        const items = response.body.data.items
        const items1 = response.body.data.items[0]
        Cypress.env('qty1', items1.qty)
        Cypress.env('product1', items1.product)
        const ubdDetails = items1.ubdDetail

        const subtotalDetail = response.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )

        Cypress.env('price1', Cypress.env('product1').multi_price.price)
        Cypress.env('SubTotalPaymnetDetail-1', subtotalDetail.total)
        Cypress.env('SubTotalProduct1', items1.sub_total)

        ubdDetails.forEach((ubdItem) => {
          const ubdDate = ubdItem.ubd.slice(0, 7)
          Cypress.env('ubdDate1', ubdDate)
          Cypress.env('ubdTotal1', ubdItem.total)

          expect(items, 'jumlah data Items').to.have.length(1)

          expect(Cypress.env('product1')).to.have.property(
            'sku',
            Cypress.env('SKU1').sku
          )

          expect(Cypress.env('product1')).to.have.property(
            'name',
            Cypress.env('SKU1').name
          )
          expect(requestAddSKU1.qty, 'Qty Produk ke 1').to.eq(
            Cypress.env('qty1')
          )
          expect(Cypress.env('ubdDate1')).to.eq(requestAddSKU1.ubd)
          expect(Cypress.env('product1')).to.have.property('price', 319000)
          expect(Cypress.env('ubdDate1')).to.eq(requestAddSKU1.ubd)
          expect(Cypress.env('price1')).to.eq(Cypress.env('SubTotalProduct1'))

          cy.log('Name SKU1:', Cypress.env('SKU1').name)
          cy.log('UBD SKU 1:', Cypress.env('ubdDate1'))
          cy.log('Total UBD SKU-1:', Cypress.env('ubdTotal1'))
        })
      })
      //add sku - 2
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId2') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU2
      }).then((response2) => {
        expect(response2.status).to.eq(201)
        const items = response2.body.data.items
        const items2 = response2.body.data.items[1]
        const ubdDetails2 = items2.ubdDetail

        ubdDetails2.forEach((ubdItem2) => {
          expect(ubdItem2).to.have.property('ubd')
          expect(ubdItem2).to.have.property('total')

          // Mengambil tahun dan bulan dari ubd
          // const ubdDate2 = ubdItem2.ubd.slice(0, 7)
          // const ubdTotal2 = ubdItem2.total
          Cypress.env('ubdDate2', ubdItem2.ubd.slice(0, 7))
          Cypress.env('ubdTotal2', ubdItem2.total)

          Cypress.env('product2', items2.product)
          Cypress.env('price2', Cypress.env('product2').multi_price.price)
          Cypress.env('SubTotalProduct2', items2.sub_total)

          const subtotalDetail = response2.body.data.paymentDetails.find(
            (detail) => detail.label === 'Subtotal'
          )
          Cypress.env('SubTotal2', subtotalDetail.total)

          const expectedSubtotal =
            Cypress.env('SubTotalProduct1') + Cypress.env('SubTotalProduct2')
          const ubdDetails2 = items2.ubdDetail

          expect(items, 'jumlah data Items').to.have.length(2)

          expect(Cypress.env('product1')).to.have.property(
            'name',
            Cypress.env('SKU1').name
          )
          expect(requestAddSKU2.qty, 'Qty Produk ke 2').to.eq(items2.qty)
          expect(Cypress.env('product1')).to.have.property('price', 319000)
          expect(ubdDetails2).to.be.an('array')
          expect(Cypress.env('ubdDate1')).to.eq(requestAddSKU1.ubd)
          expect(Cypress.env('product2')).to.have.property(
            'name',
            Cypress.env('SKU2').name
          )
          expect(Cypress.env('product2')).to.have.property(
            'sku',
            Cypress.env('SKU2').sku
          )
          expect(Cypress.env('product2')).to.have.property('price', 449000)
          expect(ubdDetails2).to.be.an('array')
          expect(Cypress.env('ubdDate2'), 'UBD SKU 2 sesuai').to.eq(
            requestAddSKU2.ubd
          )
          expect(Cypress.env('price2')).to.eq(Cypress.env('SubTotalProduct2'))
          expect(Cypress.env('SubTotal2'), 'SubTotal Cart').to.eq(
            expectedSubtotal
          )
          cy.log('Name SKU2:', Cypress.env('SKU2').name)
          cy.log('price SKU-2', Cypress.env('price2'))
          cy.log('UBD SKU 2:', Cypress.env('ubdDate2'))
          cy.log('ubdTotal SKU 2', Cypress.env('Total2'))
        })
      })

      //add sku - 3 dengan sku yg sama seperti sku 1 namun UBD Berbeda
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId2') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU3
      }).then((response3) => {
        expect(response3.status).to.eq(201)
        const items = response3.body.data.items
        const items3 = response3.body.data.items[0]
        Cypress.env('qty3', items3.qty)

        Cypress.env('product3', items3.product)
        Cypress.env('price3', Cypress.env('product3').multi_price.price)
        Cypress.env('SubTotalProduct3', items3.sub_total)

        const subtotalDetail3 = response3.body.data.paymentDetails.find(
          (detail) => detail.label === 'Subtotal'
        )
        Cypress.env('SubTotal3', subtotalDetail3.total)

        const expectedQTY = Cypress.env('qty1') + Cypress.env('qty3')

        Cypress.env(
          'expectedSubtotalProduk3',
          Cypress.env('SubTotalProduct1') * items3.qty
        )
        Cypress.env(
          'expectedQTYProduk3',
          Cypress.env('SubTotalProduct1') * items3.qty
        )

        const expectedSubtotalCart =
          Cypress.env('SubTotalProduct2') + Cypress.env('SubTotalProduct3')

        const ubdDetail = items3.ubdDetail
        const ubdDetails3 = items3.ubdDetail[1]
        const ubdDate = ubdDetails3.ubd.slice(0, 7)
        const ubdTotal = ubdDetails3.total

        Cypress.env('ubdDate3', ubdDate)
        Cypress.env('ubdTotal3', ubdTotal)

        expect(items, 'jumlah data Items').to.have.length(2)
        expect(ubdDetail, 'jumlah data UbdDetail').to.have.length(2)

        expect(Cypress.env('product3')).to.have.property(
          'sku',
          requestAddSKU3.sku
        )
        expect(Cypress.env('product3')).to.have.property(
          'name',
          Cypress.env('SKU1').name
        )
        expect(items3.qty, 'Qty Produk ke 3').to.eq(Cypress.env('qty3'))
        expect(Cypress.env('product3')).to.have.property('price', 319000)
        expect(Cypress.env('ubdDate3'), 'UBD SKU 3 sesuai').to.eq(
          requestAddSKU3.ubd
        )
        expect(Cypress.env('SubTotalProduct3')).to.eq(
          Cypress.env('expectedSubtotalProduk3')
        )
        expect(Cypress.env('SubTotal3'), 'SubTotal Cart').to.eq(
          expectedSubtotalCart
        )

        cy.log('Price SKU-3', Cypress.env('price3'))
        cy.log('qty', items3.qty)
        cy.log('UBD SKU-3', Cypress.env('ubdDate3'))
        cy.log('UBD total SKU-3', Cypress.env('ubdTotal3'))
        cy.log('Subtotal produk', Cypress.env('expectedSubtotalProduk3'))
      })
    })
  })
})

describe('Add - Negatif Test', () => {
  it('Should be unable to add invalid sku to cart', () => {
    Cypress.env('SKU1', { sku: '123456789', qty: 1, name: 'asal' })
    const AddSKU = {
      sku: Cypress.env('SKU1').sku,
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      requiredUbd: true,
      ubd: '2025-07'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found.')
    })
  })

  it('Should be unable to add wrong format sku to cart', () => {
    Cypress.env('SKU1', { sku: '190252185 ', qty: 1, name: 'asal' })
    const AddSKU = {
      sku: Cypress.env('SKU1').sku,
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      requiredUbd: true,
      ubd: '2025-07'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found.')
    })
  })

  it('Should be unable to add wrong format UBD', () => {
    Cypress.env('SKU1', { sku: '190252185 ', qty: 1, name: 'asal' })
    const AddSKU = {
      sku: Cypress.env('SKU1').sku,
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      requiredUbd: true,
      ubd: ''
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message[0]).to.eq('ubd must be a Date instance')
    })
  })

  it('Should be unable to add sku null to cart', () => {
    Cypress.env('SKU1', { sku: '123456789', qty: 1, name: 'asal' })
    const AddSKU = {
      sku: '',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      requiredUbd: true,
      ubd: '2025-07'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message[0]).to.eq('sku should not be empty')
    })
  })

  it('Should be unable to add if delete field ubd ', () => {
    Cypress.env('SKU1', { sku: '123456789', qty: 1, name: 'asal' })
    const AddSKU = {
      sku: '190252185',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      requiredUbd: true
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message[0]).to.eq('ubd should not be empty')
    })
  })

  it('Should be able to add if delete field Required ubd', () => {
    const AddSKU = {
      sku: '190238933',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      notes: '',
      ubd: '2026-02'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(201)
      const items = response.body.data.items
      const itemss = response.body.data.items[0]
      Cypress.env('qty', itemss.qty)
      Cypress.env('product', itemss.product)
      const ubdDate = itemss.ubdDetail[0].ubd
      const ubdTotal = itemss.ubdDetail[0].total
      Cypress.env('ubdDate', ubdDate)
      Cypress.env('ubdTotal', ubdTotal)

      const subtotalDetail = response.body.data.paymentDetails.find(
        (detail) => detail.label === 'Subtotal'
      )

      Cypress.env('price', Cypress.env('product').multi_price.price)
      Cypress.env('SubTotalPaymnetDetail', subtotalDetail.total)
      Cypress.env('SubTotalProduct', itemss.sub_total)

      // ubdDetails.forEach((ubdItem) => {
      //   const ubdDate = ubdItem.ubd.slice(0, 7)

      expect(items, 'jumlah data Items').to.have.length(1)

      expect(Cypress.env('product')).to.have.property('sku', AddSKU.sku)
      expect(Cypress.env('ubdDate')).to.eq(null)
    })
  })

  it('Should be unable to add if delete field notes', () => {
    const AddSKU = {
      sku: '190238933',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      requiredUbd: true,
      ubd: '2026-02'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(201)
      const items = response.body.data.items
      const itemss = response.body.data.items[0]
      Cypress.env('qty', itemss.qty)
      const product = itemss.product
      const ubdItems = itemss.ubdDetail[0]
      const ubdDate = ubdItems.ubd.slice(0, 7)

      expect(items, 'jumlah data Items').to.have.length(1)

      expect(product).to.have.property('sku', AddSKU.sku)
      expect(ubdDate).to.eq(AddSKU.ubd)
      expect(itemss.notes).to.eq(null)
    })
  })

  it('Should be unable to add if invalid token', () => {
    const AddSKU = {
      sku: '190238933',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      requiredUbd: true,
      ubd: '2026-02'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      headers: {
        ...Cypress.env('REQUEST_HEADERS_ADMIN')
      },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(403)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Forbidden resource')
      expect(body.error).to.eq('Forbidden')
    })
  })

  it('Should be unable to add without token', () => {
    const AddSKU = {
      sku: '190238933',
      qty: Cypress.env('SKU1').qty,
      customPrice: 0,
      requiredUbd: true,
      ubd: '2026-02'
    }
    cy.api({
      method: 'POST',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/add',
      // headers: {
      //   ...Cypress.env('REQUEST_HEADERS_ADMIN')
      // },
      failOnStatusCode: false,
      body: AddSKU
    }).then((response) => {
      expect(response.status).to.eq(401)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Unauthorized')
    })
  })

  // afterEach(() => {
  //   cy.api({
  //     method: 'DELETE',
  //     url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId2'),
  //     headers: {
  //       ...Cypress.env('REQUEST_HEADERS')
  //     }
  //   }).then((response) => {
  //     expect(response.status).to.eq(200)
  //     cy.log('Cart has been successfully deleted after the test.')
  //   })
  // })
  afterEach(() => {
    cy.api({
      method: 'DELETE',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId2'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false // Memastikan bahwa Cypress tidak menghentikan eksekusi jika tidak ditemukan cart
    }).then((response) => {
      if (response.status === 200) {
        cy.log('Cart has been successfully deleted after the test.')
      } else if (
        response.status === 400 &&
        response.body.message === 'No cart found !'
      ) {
        cy.log('No cart found, skipping deletion.')
      } else {
        cy.log('Unexpected error: ', response.body.message)
      }
    })
  })
})
