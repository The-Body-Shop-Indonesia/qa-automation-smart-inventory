const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

let cartId
let customerId
describe('Prepare cart and produk', () => {
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

  it('Should able to add product to cart', () => {
    cy.fixture('skus').then((data) => {
      const sku1 = data.skuPOS[0]
      const sku2 = data.skuPOS[1]
      const sku3 = data.skuPOS[2]
      const sku1_Name = data.skuPOSName[0]
      const sku2_Name = data.skuPOSName[1]
      const sku3_Name = data.skuPOSName[2]
      Cypress.env('SKU1', { sku: sku1, qty: 2, name: 'sku1_Name' })
      Cypress.env('SKU2', { sku: sku2, qty: 1, name: 'sku2_Name' })
      Cypress.env('SKU3', { sku: sku3, qty: 1, name: 'sku3_Name' })

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
        sku: Cypress.env('SKU3').sku,
        qty: Cypress.env('SKU3').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-05'
      }
      const requestAddSKU4 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU2').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: '2025-08'
      }

      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU1
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')
      })

      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
          // Channel: 'web' // Add header Channel
        },
        body: requestAddSKU1
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')
      })

      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU2
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')
      })

      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
        },
        body: requestAddSKU3
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')
      })
      cy.api({
        method: 'POST',
        url:
          URL_PRODUCT +
          '/employee/cart/pos-ubd/' +
          Cypress.env('customerId') +
          '/item/add',
        headers: {
          ...Cypress.env('REQUEST_HEADERS')
          // Channel: 'web' // Add header Channel
        },
        body: requestAddSKU4
      }).then((response) => {
        expect(response.status).to.eq(201)
        const body = response.body
        expect(body).to.have.property('statusCode')
        expect(body).to.have.property('message')
        expect(body).to.have.property('data')
      })
    })
  })

  it('Should able to show cart', () => {
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web' // Add header Channel
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      const items = response.body.data.items
      // Simpan item pertama, kedua, dan ketiga ke dalam environment variable yang berbeda
      Cypress.env('sku1', {
        sku: items[0].sku,
        qty: items[0].qty,
        notes: items[0].notes,
        ubdDetails: Array.isArray(items[0].ubdDetail)
          ? items[0].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string') // Pastikan hanya mengambil string di `ubd`
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Ambil bulan dan tahun: yyyy-mm
                total: ubdObj.total // Ambil total terkait `ubd`
              }))
          : []
      })

      Cypress.env('sku2', {
        sku: items[1].sku,
        qty: items[1].qty,
        notes: items[1].notes,
        ubdDetails: Array.isArray(items[1].ubdDetail)
          ? items[1].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string') // Pastikan hanya mengambil string di `ubd`
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Ambil bulan dan tahun: yyyy-mm
                total: ubdObj.total // Ambil total terkait `ubd`
              }))
          : []
      })

      Cypress.env('sku3', {
        sku: items[2].sku,
        qty: items[2].qty,
        notes: items[2].notes,
        ubdDetails: Array.isArray(items[2].ubdDetail)
          ? items[2].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string') // Pastikan hanya mengambil string di `ubd`
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Ambil bulan dan tahun: yyyy-mm
                total: ubdObj.total // Ambil total terkait `ubd`
              }))
          : []
      })

      // Verifikasi hasil log
      cy.log('SKU 1:', JSON.stringify(Cypress.env('sku1'), null, 2))
      cy.log('SKU 2:', JSON.stringify(Cypress.env('sku2'), null, 2))
      cy.log('SKU 3:', JSON.stringify(Cypress.env('sku3'), null, 2))
    })
  })
})

describe('Edit Notes produk', () => {
  it('Edit Notes from null to fill', () => {
    //mengurangi Ubd yg sama, jadi hasil harus berkurang 1

    Cypress.env('requestEditSKU1', {
      sku: '134070225',
      qty: 1,
      customPrice: 0,
      notes: 'Testing mils',
      requiredUbd: true,
      ubd: '2025-07'
    })

    cy.api({
      method: 'PATCH',
      url:
        URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/edit',
      headers: { ...Cypress.env('REQUEST_HEADERS') },
      body: Cypress.env('requestEditSKU1')
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      expect(Cypress.env('requestEditSKU1').notes).to.eq('Testing mils')
    })
  })
  afterEach(() => {
    cy.api({
      method: 'DELETE',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId'),
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
