const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const URL_PAYMENT = Cypress.config('baseUrlPayment')
const url_admin = URL_USER + '/admin/login'

let cartId
let customerId
describe('Prepare cart and produk', () => {
  before('User Login', () => {
    const url_user = URL_USER + '/otp/validate'

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
        Cypress.env('REQUEST_HEADERS_USER', {
          Authorization: 'Bearer ' + userToken
          // Channel: 'web'
        })
      })
  })

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
          Authorization: 'Bearer ' + adminToken,
          channel: 'pos'
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
          //   store: Cypress.env('STORE_CODE_BXC')
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

  //   it('Should able to create cart', () => {
  //     const url = URL_PRODUCT + '/employee/cart/create'
  //     cy.api({
  //       method: 'POST',
  //       url,
  //       headers: Cypress.env('REQUEST_HEADERS'),
  //       body: {
  //         isGuest: false,
  //         firstName: 'Mils',
  //         lastName: 'Jamils',
  //         cardNumber: '51716799227000317',
  //         nik: '',
  //         FamilyNumber: '',
  //         isFamily: false,
  //         customerGroup: 'STARTER',
  //         image:
  //           'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg',
  //         isScanner: true,
  //         isLapsed: false,
  //         isReactivated: false,
  //         isIcarusAppUser: false,
  //         autoEnroll: false,
  //         autoEnrollFrom: ''
  //       }
  //     }).should((response) => {
  //       expect(response.status).to.equal(201)
  //       expect(response.body.data).to.haveOwnProperty('_id')
  //       expect(response.body.data.customer).to.haveOwnProperty('_id')
  //       cartId = response.body.data._id
  //       Cypress.env('cartId', cartId)
  //       customerId = response.body.data.customer._id
  //       Cypress.env('customerId', customerId)
  //     })

  //     cy.api({
  //       method: 'POST',
  //       url,
  //       headers: Cypress.env('REQUEST_HEADERS'),
  //       body: {
  //         isGuest: false,
  //         firstName: 'Mils',
  //         lastName: 'Jamils',
  //         cardNumber: '51716799227000317',
  //         nik: '',
  //         FamilyNumber: '',
  //         isFamily: false,
  //         customerGroup: 'STARTER',
  //         image:
  //           'https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg',
  //         isScanner: true,
  //         isLapsed: false,
  //         isReactivated: false,
  //         isIcarusAppUser: false,
  //         autoEnroll: false,
  //         autoEnrollFrom: ''
  //       }
  //     }).should((response) => {
  //       expect(response.status).to.equal(201)
  //       expect(response.body.data).to.haveOwnProperty('_id')
  //       expect(response.body.data.customer).to.haveOwnProperty('_id')
  //       cartId = response.body.data._id
  //       Cypress.env('cartId2', cartId)
  //       customerId = response.body.data.customer._id
  //       Cypress.env('customerId2', customerId)
  //     })
  //   })
})

describe('Payment List - Positif Test', () => {
  it('Should able to show all Payment List if amount >10000', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=30000&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body

      // Validasi respons
      expect(body).to.have.property('data').and.to.be.an('array')

      // Ambil semua paymentMethods
      const allPaymentMethods = body.data.flatMap((item) => item.paymentMethods)

      // Ambil hanya `position`, `name`, dan `status`
      const simplifiedPayments = allPaymentMethods.map((method) => ({
        position: method.position,
        name: method.name,
        status: method.status
      }))

      // Log hasilnya
      cy.log(
        'Simplified Payment Methods:',
        JSON.stringify(simplifiedPayments, null, 2)
      )

      // Contoh: validasi hasil
      expect(simplifiedPayments).to.be.an('array').and.not.be.empty
    })
  })

  it('Should able to show all Payment List if total <10000', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=5000&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body

      // Validasi respons
      expect(body).to.have.property('data').and.to.be.an('array')

      // Ambil semua paymentMethods
      const allPaymentMethods = body.data.flatMap((item) => item.paymentMethods)

      // Ambil hanya `position`, `name`, dan `status`
      const simplifiedPayments = allPaymentMethods.map((method) => ({
        position: method.position,
        name: method.name,
        status: method.status
      }))

      // Log hasilnya
      cy.log(
        'Simplified Payment Methods:',
        JSON.stringify(simplifiedPayments, null, 2)
      )

      // Validasi hanya ada 1 metode pembayaran dan itu "Tunai"
      expect(
        simplifiedPayments,
        'Jumlah Payment Methode yang tersedia'
      ).to.have.length(1)
      expect(simplifiedPayments[0].name, 'Payment Methode yang tersedia').to.eq(
        'Tunai'
      )
      expect(simplifiedPayments[0].status).to.eq(1) // Pastikan status aktif
    })
  })

  it('Should able to show all Payment List if amount =0', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=0&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      const body = response.body

      // Validasi respons
      expect(body).to.have.property('data').and.to.be.an('array')

      // Ambil semua paymentMethods
      const allPaymentMethods = body.data.flatMap((item) => item.paymentMethods)

      // Ambil hanya `position`, `name`, dan `status`
      const simplifiedPayments = allPaymentMethods.map((method) => ({
        position: method.position,
        name: method.name,
        status: method.status
      }))

      // Log hasilnya
      cy.log(
        'Simplified Payment Methods:',
        JSON.stringify(simplifiedPayments, null, 2)
      )

      // Validasi hanya ada 1 metode pembayaran dan itu "Tunai"
      expect(
        simplifiedPayments,
        'Jumlah Payment Methode yang tersedia'
      ).to.have.length(1)
      expect(simplifiedPayments[0].name, 'Payment Methode yang tersedia').to.eq(
        'Tunai'
      )
      expect(simplifiedPayments[0].status).to.eq(1) // Pastikan status aktif
    })
  })
})

describe('Payment List - Negatif Test', () => {
  it('Should unable to show all Payment List if amount <0', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=-1000&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      }
    }).then((response) => {
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(400).to.eq(response.status)
    })
  })

  it('Should unable to show all Payment List if not amount ', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(400).to.eq(response.status) //TBC
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body).to.have.property('error')
      expect(body.message[0]).to.eq('amount should not be empty')
      expect(body.error).to.eq('Bad Request')
    })
  })

  it('Should unable to show all Payment List if amount wrong format', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=a10&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS')
      },
      failOnStatusCode: false
    }).then((response) => {
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(500).to.eq(response.status)
      expect(body.message).to.eq('Internal server error')
    })
  })

  it('Should not be able to show all payment list if invalid token(user token admin)', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method?amount=1000&store=${Cypress.env('STORE_CODE_BXC')}`,
      headers: {
        ...Cypress.env('REQUEST_HEADERS_ADMIN')
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Forbidden resource')
      expect(body.error).to.eq('Forbidden')
    })
  })

  it('Should not be able too show all payment list  if invalid channel(Token user)', () => {
    cy.api({
      method: 'GET',
      url: `${URL_PAYMENT}/payment-method`,
      qs: {
        channel: 'POS',
        amount: 100000,
        store: Cypress.env('STORE_CODE_BXC')
      },
      headers: {
        ...Cypress.env('REQUEST_HEADERS_USER')
      },
      // url: `${URL_PAYMENT}/payment-method?amount=1000&store=${Cypress.env('STORE_CODE_BXC')}`,
      // headers: {
      //   ...Cypress.env('REQUEST_HEADERS_USER')
      // },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403)
      const body = response.body
      expect(body).to.have.property('statusCode')
      expect(body).to.have.property('message')
      expect(body.message).to.eq('Forbidden resource')
      expect(body.error).to.eq('Forbidden')
    })
  })
})
