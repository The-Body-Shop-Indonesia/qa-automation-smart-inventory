const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const url_admin = URL_USER + '/admin/login'

let cartId
let customerId
describe('Prepare cart and produk', () => {
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

  it('Should able to add product to cart', () => {
    cy.fixture('skus').then((data) => {
      const sku1 = data.skuPOS[0]
      const sku2 = data.skuPOS[1]
      const sku3 = data.skuPOS[2]
      const sku1_Name = data.skuPOSName[0]
      const sku2_Name = data.skuPOSName[1]
      const sku3_Name = data.skuPOSName[2]
      // Inisialisasi jumlah kumulatif untuk SKU1
      let cumulativeQtySKU1 = 0

      Cypress.env('SKU1', { sku: sku1, qty: 1, name: sku1_Name })
      Cypress.env('SKU2', { sku: sku2, qty: 1, name: sku2_Name })
      Cypress.env('SKU3', { sku: sku3, qty: 1, name: sku3_Name })

      const requestAddSKU1 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU1').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: Cypress.env('UBDSKU1', '2025-07')
      }
      const requestAddSKU2 = {
        sku: Cypress.env('SKU2').sku,
        qty: Cypress.env('SKU2').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: Cypress.env('UBDSKU2', '2025-03')
      }
      const requestAddSKU3 = {
        sku: Cypress.env('SKU3').sku,
        qty: Cypress.env('SKU3').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: Cypress.env('UBDSKU3', '2025-05')
      }
      const requestAddSKU4 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU1').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: Cypress.env('UBDSKU4', '2025-08')
      }
      const requestAddSKU5 = {
        sku: Cypress.env('SKU1').sku,
        qty: Cypress.env('SKU1').qty,
        customPrice: 0,
        notes: '',
        requiredUbd: true,
        ubd: Cypress.env('UBDSKU5', null) //jika null UBD=1970-01
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
        cumulativeQtySKU1 += requestAddSKU1.qty // Tambahkan ke jumlah kumulatif
        Cypress.env('SKU1').qty = cumulativeQtySKU1 // Perbarui qty SKU1 di variabel lingkungan
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
        body: requestAddSKU1
      }).then((response) => {
        expect(response.status).to.eq(201)
        cumulativeQtySKU1 += requestAddSKU1.qty // Tambahkan ke jumlah kumulatif
        Cypress.env('SKU1').qty = cumulativeQtySKU1
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
        cumulativeQtySKU1 += requestAddSKU1.qty
        Cypress.env('SKU1').qty = cumulativeQtySKU1
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
        body: requestAddSKU5
      }).then((response) => {
        expect(response.status).to.eq(201)
        cumulativeQtySKU1 += requestAddSKU1.qty
        Cypress.env('SKU1').qty = cumulativeQtySKU1
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
          Cypress.env('customerId2') +
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
    })
  })

  it('Should able to show cart-1', () => {
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId2'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
        // Channel: 'web' // Add header Channel
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      const items = response.body.data.items
      Cypress.env('Before-remove-QTY-SKU1', items[0].qty)

      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      //validasi SKU1
      expect(items[0].sku, 'SKU3').to.eq(Cypress.env('SKU3').sku)
      expect(items[0].product.name_gold, 'name SKU').to.eq(
        Cypress.env('SKU3').name
      )
      expect(items[0].qty, 'Total QTY SKU').to.eq(Cypress.env('SKU3').qty)

      // Simpan item pertama
      Cypress.env('sku01', {
        sku: items[0].sku,
        qty: items[0].qty,
        ubdDetails: Array.isArray(items[0].ubdDetail)
          ? items[0].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string')
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7),
                total: ubdObj.total
              }))
          : []
      })

      // Verifikasi hasil log
      cy.log('SKU:', JSON.stringify(Cypress.env('sku01'), null, 2))
    })
  })

  it('Should able to show cart-2', () => {
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
      const items = response.body.data.items
      Cypress.env('Before-remove-QTY-SKU1', items[0].qty)
      Cypress.env('Before-remove-QTY-SKU2', items[0].qty)
      Cypress.env('Before-remove-QTY-SKU3', items[0].qty)

      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      //validasi SKU1
      expect(items[0].sku, 'SKU1').to.eq(Cypress.env('SKU1').sku)
      expect(items[0].product.name_gold, 'name SKU1').to.eq(
        Cypress.env('SKU1').name
      )
      expect(items[0].qty, 'Total QTY SKU1').to.eq(Cypress.env('SKU1').qty) // Memeriksa qty kumulatif

      //validasi SKU2
      expect(items[1].sku, 'SKU2').to.eq(Cypress.env('SKU2').sku)
      expect(items[1].product.name_gold, 'name SKU2').to.eq(
        Cypress.env('SKU2').name
      )
      expect(items[1].qty, 'Total QTY SKU2').to.eq(Cypress.env('SKU2').qty)

      //validasi SKU3
      expect(items[2].sku, 'SKU3').to.eq(Cypress.env('SKU3').sku)
      expect(items[2].product.name_gold, 'name SKU3').to.eq(
        Cypress.env('SKU3').name
      )
      expect(items[2].qty, 'Total QTY SKU3').to.eq(Cypress.env('SKU3').qty)

      // Simpan item pertama, kedua, dan ketiga ke dalam environment variable yang berbeda
      Cypress.env('sku1', {
        sku: items[0].sku,
        qty: items[0].qty,
        ubdDetails: Array.isArray(items[0].ubdDetail)
          ? items[0].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string')
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Ambil bulan dan tahun: yyyy-mm
                total: ubdObj.total
              }))
          : []
      })

      Cypress.env('sku2', {
        sku: items[1].sku,
        qty: items[1].qty,
        ubdDetails: Array.isArray(items[1].ubdDetail)
          ? items[1].ubdDetail
              .filter((ubdObj) => typeof ubdObj.ubd === 'string')
              .map((ubdObj) => ({
                ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Ambil bulan dan tahun: yyyy-mm
                total: ubdObj.total // Ambil total terkait `ubd`
              }))
          : []
      })

      Cypress.env('sku3', {
        sku: items[2].sku,
        qty: items[2].qty,
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

describe('Remove SKU condition single Item in Carts', () => {
  it('Should be able to remove sku condition single in cart', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId2') +
        '/item/remove'
    )
    const url_remove_items = Cypress.env('url_remove_items')
    const Remove_Request = {
      sku: Cypress.env('sku3').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU3')
    }

    cy.api({
      method: 'PATCH',
      url: url_remove_items, //Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      const items = body.data.items
      const updatedSku = items.find(
        (item) => item.sku === Cypress.env('sku3').sku
      )

      // Validasi bahwa sku3 tidak ada lagi di cart karena qty = 1
      if (!updatedSku) {
        cy.log('SKU sudah tidak ada di cart karena qty = 1')
      } else {
        cy.log('SKU masih ada di cart:', JSON.stringify(updatedSku, null, 2))
      }

      // Validasi UBD detail yang dihapus
      const initialSkuUbdDetails = Cypress.env('sku3').ubdDetails
      const removedUbd = Remove_Request.ubd
      const removedUbdDetail = initialSkuUbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      const remainingUbdDetails = updatedSku
        ? updatedSku.ubdDetail
          ? updatedSku.ubdDetail.map((ubdObj) => ({
              ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Format menjadi yyyy-mm
              total: ubdObj.total
            }))
          : [] // Pastikan ubdDetail ada sebelum diproses
        : []

      const updatedUbdDetail = remainingUbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      if (removedUbdDetail && removedUbdDetail.total > 1) {
        // Jika total lebih dari 1, validasi pengurangan total
        expect(
          updatedUbdDetail,
          'UBD masih ada di UBD details karena total awal > 1'
        ).to.exist
        expect(
          updatedUbdDetail.total,
          'Total UBD yang dihapus berkurang 1'
        ).to.eq(removedUbdDetail.total - 1)
      } else {
        // Jika total = 1, UBD tidak boleh ada lagi di daftar
        expect(
          updatedUbdDetail,
          'UBD yang dihapus tidak ada lagi karena total awal = 1'
        ).to.not.exist
      }

      cy.log(
        'Remaining UBD SKU3 Details:',
        JSON.stringify(remainingUbdDetails, null, 2)
      )

      // Validasi jumlah data item
      expect(items, 'jumlah data Items').to.have.length(0)

      // Validasi item yang tersisa di cart
      items.forEach((item) => {
        cy.log(
          'Item in Cart: ',
          JSON.stringify(
            {
              sku: item.sku,
              qty: item.qty,
              ubdDetail: item.ubdDetail
                ? item.ubdDetail.map((ubd) => ({
                    ubd: ubd.ubd,
                    total: ubd.total
                  }))
                : [] // Pastikan ubdDetail ada sebelum diproses
            },
            null,
            2
          )
        )
      })
    })
  })
})

describe('Remove SKU condition Many Item in Carts', () => {
  it('Should able to remove sku with sku >1 and same UBD total >1', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )
    const url_remove_items = Cypress.env('url_remove_items')
    const Remove_Request = {
      sku: Cypress.env('sku1').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: url_remove_items, //Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')
      // })

      // cy.api({
      //   method: 'GET',
      //   url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId'),
      //   headers: {
      //     ...Cypress.env('REQUEST_HEADERS')
      //   }
      // }).then((response) => {
      //   expect(response.status).to.eq(200)
      const items = body.data.items
      const updatedSku1 = items.find(
        (item) => item.sku === Cypress.env('sku1').sku
      )

      // Validasi pengurangan QTY
      const expectedQTY = Cypress.env('Before-remove-QTY-SKU1') - 1
      expect(updatedSku1.qty, 'Total QTY SKU1 setelah remove').to.eq(
        expectedQTY
      )

      // Validasi pengurangan UBD detail
      const remainingUbdDetails = updatedSku1.ubdDetail.map((ubdObj) => ({
        ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Format menjadi yyyy-mm
        total: ubdObj.total
      }))

      // Validasi UBD detail yang dihapus
      const initialSku1UbdDetails = Cypress.env('sku1').ubdDetails
      const removedUbd = Remove_Request.ubd
      const removedUbdDetail = initialSku1UbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      const updatedUbdDetail = remainingUbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      if (removedUbdDetail.total > 1) {
        // Jika total lebih dari 1, validasi pengurangan total
        expect(
          updatedUbdDetail,
          'UBD masih ada di UBD details karena total awal > 1'
        ).to.exist
        expect(
          updatedUbdDetail.total,
          'Total UBD yang dihapus berkurang 1'
        ).to.eq(removedUbdDetail.total - 1)
      } else {
        // Jika total = 1, UBD tidak boleh ada lagi di daftar
        expect(
          updatedUbdDetail,
          'UBD yang dihapus tidak ada lagi karena total awal = 1'
        ).to.not.exist
      }

      cy.log(
        'Remaining UBD SKU1 Details:',
        JSON.stringify(remainingUbdDetails, null, 2)
      )

      items.forEach((item) => {
        // cy.log('Item in Cart: ', JSON.stringify(item, null, 2))
        cy.log(
          'Item in Cart: ',
          JSON.stringify(
            {
              sku: item.sku,
              qty: item.qty,
              ubdDetail: item.ubdDetail.map((ubd) => ({
                ubd: ubd.ubd,
                total: ubd.total
              }))
            },
            null,
            2
          )
        )
        // Validasi SKU
        // expect(item.sku).to.exist
        // expect(item.qty).to.be.greaterThan(0)

        // item.ubdDetail.forEach((ubd) => {
        //   // Validasi UBD detail
        //   expect(ubd.ubd).to.exist
        //   expect(ubd.total).to.be.greaterThan(0)
        // })
      })
    })
  })

  it('Should be able to remove sku with qty = 1', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )
    const url_remove_items = Cypress.env('url_remove_items')
    const Remove_Request = {
      sku: Cypress.env('sku2').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU2')
    }

    cy.api({
      method: 'PATCH',
      url: url_remove_items, //Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('data')

      const items = body.data.items
      const updatedSku2 = items.find(
        (item) => item.sku === Cypress.env('sku2').sku
      )

      // Validasi bahwa sku2 tidak ada lagi di cart karena qty = 1
      if (!updatedSku2) {
        cy.log('SKU2 sudah tidak ada di cart karena qty = 1')
      } else {
        cy.log('SKU2 masih ada di cart:', JSON.stringify(updatedSku2, null, 2))
      }

      // Validasi UBD detail yang dihapus
      const initialSku2UbdDetails = Cypress.env('sku2').ubdDetails
      const removedUbd = Remove_Request.ubd
      const removedUbdDetail = initialSku2UbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      const remainingUbdDetails = updatedSku2
        ? updatedSku2.ubdDetail.map((ubdObj) => ({
            ubd: ubdObj.ubd.split('T')[0].slice(0, 7), // Format menjadi yyyy-mm
            total: ubdObj.total
          }))
        : []

      const updatedUbdDetail = remainingUbdDetails.find(
        (ubdDetail) => ubdDetail.ubd === removedUbd
      )

      if (removedUbdDetail.total > 1) {
        // Jika total lebih dari 1, validasi pengurangan total
        expect(
          updatedUbdDetail,
          'UBD masih ada di UBD details karena total awal > 1'
        ).to.exist
        expect(
          updatedUbdDetail.total,
          'Total UBD yang dihapus berkurang 1'
        ).to.eq(removedUbdDetail.total - 1)
      } else {
        // Jika total = 1, UBD tidak boleh ada lagi di daftar
        expect(
          updatedUbdDetail,
          'UBD yang dihapus tidak ada lagi karena total awal = 1'
        ).to.not.exist
      }

      cy.log(
        'Remaining UBD SKU2 Details:',
        JSON.stringify(remainingUbdDetails, null, 2)
      )

      // Validasi item yang tersisa di cart
      items.forEach((item) => {
        cy.log(
          'Item in Cart: ',
          JSON.stringify(
            {
              sku: item.sku,
              qty: item.qty,
              ubdDetail: item.ubdDetail.map((ubd) => ({
                ubd: ubd.ubd,
                total: ubd.total
              }))
            },
            null,
            2
          )
        )
      })
    })
  })

  //   afterEach(() => {
  //     cy.api({
  //       method: 'DELETE',
  //       url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId1'),
  //       headers: {
  //         ...Cypress.env('REQUEST_HEADERS')
  //       },
  //       failOnStatusCode: false // Memastikan bahwa Cypress tidak menghentikan eksekusi jika tidak ditemukan cart
  //     }).then((response) => {
  //       if (response.status === 200) {
  //         cy.log('Cart has been successfully deleted after the test.')
  //       } else if (
  //         response.status === 400 &&
  //         response.body.message === 'No cart found !'
  //       ) {
  //         cy.log('No cart found, skipping deletion.')
  //       } else {
  //         cy.log('Unexpected error: ', response.body.message)
  //       }
  //     })

  //     cy.api({
  //       method: 'DELETE',
  //       url: URL_PRODUCT + '/employee/cart/' + Cypress.env('customerId2'),
  //       headers: {
  //         ...Cypress.env('REQUEST_HEADERS')
  //       },
  //       failOnStatusCode: false // Memastikan bahwa Cypress tidak menghentikan eksekusi jika tidak ditemukan cart
  //     }).then((response) => {
  //       if (response.status === 200) {
  //         cy.log('Cart has been successfully deleted after the test.')
  //       } else if (
  //         response.status === 400 &&
  //         response.body.message === 'No cart found !'
  //       ) {
  //         cy.log('No cart found, skipping deletion.')
  //       } else {
  //         cy.log('Unexpected error: ', response.body.message)
  //       }
  //     })
  //   })
})

describe('Remove SKU - Negative Test', () => {
  it('Should not be able to remove sku that are not in cart', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )
    const url_remove_items = Cypress.env('url_remove_items')
    const Remove_Request = {
      sku: '190141534',
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU2')
    }

    cy.api({
      method: 'PATCH',
      url: url_remove_items, //Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found on cart')
    })
  })

  it('Should not be able to remove sku with unavailable ubd', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU2')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found on cart')
    })
  })

  it('Should not be able to remove sku if delete field sku in request', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      // sku: Cypress.env('SKU1').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU2')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('error')
      expect(body.message[0]).to.eq('sku must be a string')
      expect(body.error).to.eq('Bad Request')
    })
  })

  it('Should not be able to remove sku if delete field required ubd in request', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      // requiredUbd: true,
      ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found on cart')
    })
  })

  it('Should not be able to remove sku if required ubd = false in request', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: false,
      ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Product not found on cart')
    })
  })

  it('Should not be able to remove sku if delete field ubd', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: true
      // ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('error')
      expect(body.message[0]).to.eq('ubd should not be empty')
      expect(body.error).to.eq('Bad Request')
    })
  })

  it('Should not be able to remove sku if wrong ubd format', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: true,
      ubd: '07-2025'
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(400)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('error')
      expect(body.message[0]).to.eq('ubd must be a Date instance')
      expect(body.error).to.eq('Bad Request')
    })
  })

  it('Should not be able to remove sku if invalid token', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      headers: {
        ...Cypress.env('REQUEST_HEADERS_ADMIN')
      },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(403)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Forbidden resource')
      expect(body.error).to.eq('Forbidden')
    })
  })

  it('Should not be able to remove sku without token', () => {
    Cypress.env(
      'url_remove_items',
      URL_PRODUCT +
        '/employee/cart/pos-ubd/' +
        Cypress.env('customerId') +
        '/item/remove'
    )

    const Remove_Request = {
      sku: Cypress.env('SKU1').sku,
      requiredUbd: true,
      ubd: Cypress.env('UBDSKU1')
    }

    cy.api({
      method: 'PATCH',
      url: Cypress.env('url_remove_items'),
      // headers: {
      //   ...Cypress.env('REQUEST_HEADERS_ADMIN')
      // },
      failOnStatusCode: false,
      body: Remove_Request
    }).then((response) => {
      expect(response.status).to.eq(401)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Unauthorized')
    })
  })
})
