const URL_USER = Cypress.config('baseUrlUser')
const url = URL_USER + '/employee/login'
const pin_emp = Cypress.env('PIN_BXC')
const store_code = Cypress.env('STORE_CODE_BXC')
const nik_employee = Cypress.env('NIK_BXC')

describe('API Test Group Employee Login', function () {
  it('Should be able to login with valid data', () => {
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee,
        storeCode: store_code,
        pin: pin_emp
      }
    }).should((response) => {
      expect(response.status, 'Response status should be 201').to.equal(201)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('data')
      expect(body.statusCode, 'Status Code should be 201').to.equal(201)
      expect(body.message, 'Message should be Success').to.equal('Success')
      const data = body.data
      expect(data).to.haveOwnProperty('accessToken')
    })
  })

  it('Should return error if login with empty data', () => {
    cy.api({
      method: 'POST',
      url,
      body: {
        nik: '',
        storeCode: '',
        pin: ''
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body).to.haveOwnProperty('error')
      expect(body.statusCode).to.equal(400)
    })
  })

  it('Should return error if login with invalid NIK', () => {
    const invalid_nik = '0123'

    cy.api({
      method: 'POST',
      url,
      body: {
        nik: invalid_nik,
        storeCode: store_code,
        pin: pin_emp
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode).to.equal(400)
      expect(
        body.message,
        'Message should be NIK dan store id tidak sesuai'
      ).to.equal('NIK dan store id tidak sesuai')
    })
  })

  it('Should return error if login with invalid Store Code', () => {
    const invalid_storeCode = '01298'

    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee,
        storeCode: invalid_storeCode,
        pin: pin_emp
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode).to.equal(400)
      expect(
        body.message,
        'Message should be NIK dan store id tidak sesuai'
      ).to.equal('NIK dan store id tidak sesuai')
    })
  })

  it('Should return error if login with invalid pin', () => {
    const invalid_pin = '0099'

    cy.api({
      method: 'POST',
      url,
      body: {
        nik: nik_employee,
        storeCode: store_code,
        pin: invalid_pin
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(400)
      const body = response.body
      expect(body).to.haveOwnProperty('statusCode')
      expect(body).to.haveOwnProperty('message')
      expect(body.statusCode).to.equal(400)
      expect(body.message, 'Invalid credentials login').to.equal(
        'Invalid credentials login'
      )
    })
  })
})
