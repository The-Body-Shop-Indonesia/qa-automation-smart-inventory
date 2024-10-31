const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('General API Test Group', () => {
  // ---- technical sections
  // validate all payload
  let currentCounter
  before(() => {
    // Ambil nilai counter saat ini
    cy.task('readCounter').then((counter) => {
      currentCounter = counter
      cy.log(`Current counter: ${currentCounter}`)
    })
  })

  before('Login admin', () => {
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

  it('Shows error 401 when admin token is not available', () => {
    const url = URL_PRODUCT + `/admin/voucher/vms/voucher-program`
    const today = new Date()
    // Mendapatkan tanggal 30 hari setelahnya
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    // Format tanggal menjadi `YYYY-MM-DD` jika diperlukan
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Tambahkan 1 karena bulan di JavaScript dimulai dari 0
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    // Menyimpan tanggal yang diformat ke dalam variable
    const todayFormatted = formatDate(today)
    const futureDateFormatted = formatDate(futureDate)
    const payload = {
      periodStart: todayFormatted,
      periodEnd: futureDateFormatted,
      programDescription: 'Test automation online voucher redemption',
      tbsCodeVoucherProgram: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      tbsVoucherType: '0',
      validityPeriod: 30,
      prevalidityPeriod: 0,
      validityStartDate: '',
      validityEndDate: '',
      image: 'https://assets.thebodyshop.co.idundefined',
      notif_title: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_body: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_img: 'https://assets.thebodyshop.co.idundefined',
      displayName: `QA-TEST-AUTO-PARTNER-${currentCounter} displayName`,
      tnc: `QA-TEST-AUTO-PARTNER-${currentCounter} tnc`,
      howToUse: `QA-TEST-AUTO-PARTNER-${currentCounter} howToUse`,
      title: `QA-TEST-AUTO-PARTNER-${currentCounter} Title`,
      isShowVoucherCode: true,
      isNewMember: false,
      quota: 100,
      isMultipleClaim: true,
      voucherRulesTrue: [],
      voucherRulesFalse: [],
      applicableToProduct: [],
      bgImageUrl: 'https://assets.thebodyshop.co.idundefined',

      isRedeemable: true,
      redeemPoint: 10,
      isPartnerShip: true
    }
    cy.api({
      method: 'POST',
      url,
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer '
      },
      body: payload
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  it('Shows error 401 when admin token is invalid', () => {
    const invalidToken = '1234567890abcdefghijklmnopqrstuv'
    const url = URL_PRODUCT + `/admin/voucher/vms/voucher-program`
    const today = new Date()
    // Mendapatkan tanggal 30 hari setelahnya
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    // Format tanggal menjadi `YYYY-MM-DD` jika diperlukan
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Tambahkan 1 karena bulan di JavaScript dimulai dari 0
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    // Menyimpan tanggal yang diformat ke dalam variable
    const todayFormatted = formatDate(today)
    const futureDateFormatted = formatDate(futureDate)
    const payload = {
      periodStart: todayFormatted,
      periodEnd: futureDateFormatted,
      programDescription: 'Test automation online voucher redemption',
      tbsCodeVoucherProgram: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      tbsVoucherType: '0',
      validityPeriod: 30,
      prevalidityPeriod: 0,
      validityStartDate: '',
      validityEndDate: '',
      image: 'https://assets.thebodyshop.co.idundefined',
      notif_title: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_body: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_img: 'https://assets.thebodyshop.co.idundefined',
      displayName: `QA-TEST-AUTO-PARTNER-${currentCounter} displayName`,
      tnc: `QA-TEST-AUTO-PARTNER-${currentCounter} tnc`,
      howToUse: `QA-TEST-AUTO-PARTNER-${currentCounter} howToUse`,
      title: `QA-TEST-AUTO-PARTNER-${currentCounter} Title`,
      isShowVoucherCode: true,
      isNewMember: false,
      quota: 100,
      isMultipleClaim: true,
      voucherRulesTrue: [],
      voucherRulesFalse: [],
      applicableToProduct: [],
      bgImageUrl: 'https://assets.thebodyshop.co.idundefined',

      isRedeemable: true,
      redeemPoint: 10,
      isPartnerShip: true
    }
    cy.api({
      method: 'POST',
      url,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${invalidToken}`
      },
      body: payload
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  // ---- business sections
  // sukses create program
  it('Successfully create voucher program', () => {
    const today = new Date()
    // Mendapatkan tanggal 30 hari setelahnya
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    // Format tanggal menjadi `YYYY-MM-DD` jika diperlukan
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Tambahkan 1 karena bulan di JavaScript dimulai dari 0
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    // Menyimpan tanggal yang diformat ke dalam variable
    const todayFormatted = formatDate(today)
    const futureDateFormatted = formatDate(futureDate)
    const payload = {
      periodStart: todayFormatted,
      periodEnd: futureDateFormatted,
      programDescription: 'Test automation online voucher redemption',
      tbsCodeVoucherProgram: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      tbsVoucherType: '0',
      validityPeriod: 30,
      prevalidityPeriod: 0,
      validityStartDate: '',
      validityEndDate: '',
      image: 'https://assets.thebodyshop.co.idundefined',
      notif_title: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_body: `QA-TEST-AUTO-PARTNER-${currentCounter}`,
      notif_img: 'https://assets.thebodyshop.co.idundefined',
      displayName: `QA-TEST-AUTO-PARTNER-${currentCounter} displayName`,
      tnc: `QA-TEST-AUTO-PARTNER-${currentCounter} tnc`,
      howToUse: `QA-TEST-AUTO-PARTNER-${currentCounter} howToUse`,
      title: `QA-TEST-AUTO-PARTNER-${currentCounter} Title`,
      isShowVoucherCode: true,
      isNewMember: false,
      quota: 100,
      isMultipleClaim: true,
      voucherRulesTrue: [],
      voucherRulesFalse: [],
      applicableToProduct: [],
      bgImageUrl: 'https://assets.thebodyshop.co.idundefined',

      isRedeemable: true,
      redeemPoint: 10,
      isPartnerShip: true
    }
    const url = URL_PRODUCT + `/admin/voucher/vms/voucher-program`
    cy.api({
      url,
      method: 'POST',
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      body: payload
    }).then((response) => {
      expect(response.status).to.equal(201)
      const body = response.body.data
      Cypress.env('VoucherProgram_id', body._id)
      Cypress.env('VoucherCodeProgram', body.tbsCodeVoucherProgram)
      const periodStart = body.periodStart
      const formattedPeriodStart = periodStart.split('T')[0]
      const periodEnd = body.periodEnd
      const formattedPeriodEnd = periodEnd.split('T')[0]
      expect(body.title, `title should be ${payload.title}`).to.equal(
        payload.title
      )
      expect(
        formattedPeriodStart,
        `periodStart should be ${payload.periodStart}`
      ).to.equal(payload.periodStart)
      expect(
        formattedPeriodEnd,
        `periodEnd should be ${payload.periodEnd}`
      ).to.equal(payload.periodEnd)
      expect(
        body.programDescription,
        `programDescription should be ${payload.programDescription}`
      ).to.equal(payload.programDescription)
      expect(
        body.tbsCodeVoucherProgram,
        `tbsCodeVoucherProgram should be ${payload.tbsCodeVoucherProgram}`
      ).to.equal(payload.tbsCodeVoucherProgram)
      expect(
        body.tbsVoucherType,
        `tbsVoucherType should be ${payload.tbsVoucherType}`
      ).to.equal(payload.tbsVoucherType)
      expect(
        body.validityPeriod,
        `validityPeriod should be ${payload.validityPeriod}`
      ).to.equal(payload.validityPeriod)
      expect(
        body.prevalidityPeriod,
        `prevalidityPeriod should be ${payload.prevalidityPeriod}`
      ).to.equal(payload.prevalidityPeriod)
      expect(
        body.validityStartDate,
        `validityStartDate should be null`
      ).to.equal(null)
      expect(body.validityEndDate, `validityEndDate should be null`).to.equal(
        null
      )
      expect(body.image, `image should be ${payload.image}`).to.equal(
        payload.image
      )
      expect(
        body.notification.title,
        `notification.title should be ${payload.notif_title}`
      ).to.equal(payload.notif_title)
      expect(
        body.notification.body,
        `notification.body should be ${payload.notif_body}`
      ).to.equal(payload.notif_body)
      expect(
        body.notification.img,
        `notification.image should be ${payload.notif_img}`
      ).to.equal(payload.notif_img)
      expect(
        body.displayName,
        `displayName should be ${payload.displayName}`
      ).to.equal(payload.displayName)
      expect(body.tnc, `tnc should be ${payload.tnc}`).to.equal(payload.tnc)
      expect(body.howToUse, `howToUse should be ${payload.howToUse}`).to.equal(
        payload.howToUse
      )
      expect(
        body.isShowVoucherCode,
        `isShowVoucherCode should be ${payload.isShowVoucherCode}`
      ).to.equal(payload.isShowVoucherCode)
      expect(
        body.isNewMember,
        `isNewMember should be ${payload.isNewMember}`
      ).to.equal(payload.isNewMember)
      expect(body.quota, `quota should be ${payload.quota}`).to.equal(
        payload.quota
      )
      expect(
        body.isMultipleClaim,
        `isMultipleClaim should be ${payload.isMultipleClaim}`
      ).to.equal(payload.isMultipleClaim)
      expect(
        body.bgImageUrl,
        `bgImageUrl should be ${payload.bgImageUrl}`
      ).to.equal(payload.bgImageUrl)
      expect(
        body.isRedeemable,
        `isRedeemable should be ${payload.isRedeemable}`
      ).to.equal(payload.isRedeemable)
      expect(
        body.redeemPoint,
        `redeemPoint should be ${payload.redeemPoint}`
      ).to.equal(payload.redeemPoint)
      expect(
        body.isPartnerShip,
        `isPartnerShip should be ${payload.isPartnerShip}`
      ).to.equal(payload.isPartnerShip)
      cy.log(`Voucher program id is ${body._id}`)
    })
    // Tambahkan counter setelah test selesai
    cy.task('incrementCounter')
  })

  it('Shows error 400 when voucher program code is already exist', () => {
    const existCounter = currentCounter - 1
    const url = URL_PRODUCT + `/admin/voucher/vms/voucher-program`
    const today = new Date()
    // Mendapatkan tanggal 30 hari setelahnya
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    // Format tanggal menjadi `YYYY-MM-DD` jika diperlukan
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Tambahkan 1 karena bulan di JavaScript dimulai dari 0
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    // Menyimpan tanggal yang diformat ke dalam variable
    const todayFormatted = formatDate(today)
    const futureDateFormatted = formatDate(futureDate)
    const payload = {
      periodStart: todayFormatted,
      periodEnd: futureDateFormatted,
      programDescription: 'Test automation online voucher redemption',
      tbsCodeVoucherProgram: `QA-TEST-AUTO-PARTNER-${existCounter}`,
      tbsVoucherType: '0',
      validityPeriod: 30,
      prevalidityPeriod: 0,
      validityStartDate: '',
      validityEndDate: '',
      image: 'https://assets.thebodyshop.co.idundefined',
      notif_title: `QA-TEST-AUTO-PARTNER-${existCounter}`,
      notif_body: `QA-TEST-AUTO-PARTNER-${existCounter}`,
      notif_img: 'https://assets.thebodyshop.co.idundefined',
      displayName: `QA-TEST-AUTO-PARTNER-${existCounter} displayName`,
      tnc: `QA-TEST-AUTO-PARTNER-${existCounter} tnc`,
      howToUse: `QA-TEST-AUTO-PARTNER-${existCounter} howToUse`,
      title: `QA-TEST-AUTO-PARTNER-${existCounter} Title`,
      isShowVoucherCode: true,
      isNewMember: false,
      quota: 100,
      isMultipleClaim: true,
      voucherRulesTrue: [],
      voucherRulesFalse: [],
      applicableToProduct: [],
      bgImageUrl: 'https://assets.thebodyshop.co.idundefined',

      isRedeemable: true,
      redeemPoint: 10,
      isPartnerShip: true
    }
    cy.api({
      method: 'POST',
      url,
      failOnStatusCode: false,
      headers: Cypress.env('REQUEST_HEADERS_ADMIN'),
      body: payload
    }).should((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.message).to.equal(
        `Voucher Program ${payload.tbsCodeVoucherProgram} already exist. Try different program code`
      )
    })
  })

  // newly created program should appear on customer's voucher redemption list
  before('Login customer', () => {
    const identifier = Cypress.env('IDENTIFIER_SDC')
    const otp = Cypress.env('OTP_SDC')
    const url = `${URL_USER}/otp/validate`
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        identifier: Cypress.env('IDENTIFIER_SDC'),
        otp: Cypress.env('OTP_SDC'),
        pageType: 'Login'
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenUser = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_USER', {
        Authorization: 'Bearer ' + tokenUser
      })
    })
  })
  it('newly created program should appear on customer`s voucher redemption list', () => {
    const url = `${URL_PRODUCT}/online-voucher-redemption/list?search=${Cypress.env('VoucherCodeProgram')}`
    cy.api({
      url,
      method: 'GET',
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      const data = response.body.data
      expect(data.length, `data should not be empty, should be 1`).to.equal(1)
      expect(
        data[0].tbsCodeVoucherProgram,
        `tbsVoucherCodeProgram should be ${Cypress.env('VoucherCodeProgram')}`
      ).to.equal(Cypress.env('VoucherCodeProgram'))
    })
  })

  // is redeemable? compared to my current point
  it('Should redeemable when current point more than voucher point', () => {
    const url = `${URL_USER}/otp/validate`
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        identifier: Cypress.env('IDENTIFIER2_SDC'),
        otp: Cypress.env('OTP_SDC'),
        pageType: 'Login'
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.statusCode).to.equal(201)
      expect(response.body.data.accessToken).to.not.be.empty
      const tokenUser = response.body.data.accessToken
      Cypress.env('REQUEST_HEADERS_USER', {
        Authorization: 'Bearer ' + tokenUser
      })
      // get current point
      const url = URL_USER + '/membership/point'
      cy.api({
        method: 'GET',
        url,
        headers: Cypress.env('REQUEST_HEADERS_USER')
      }).then((response) => {
        const URL_PRODUCT = Cypress.config('baseUrlProduct')
        const redeemUrl = URL_PRODUCT + '/online-voucher-redemption/redeem'
        Cypress.env('REDEEM_URL', redeemUrl)
        Cypress.env('USER_CURRENT_POINT', response.body.data.currentPoint)
        cy.log({ point: response.body.data.currentPoint })
      })

      const url2 = `${URL_PRODUCT}/online-voucher-redemption/list?search=${Cypress.env('VoucherCodeProgram')}`
      cy.api({
        url: url2,
        method: 'GET',
        headers: Cypress.env('REQUEST_HEADERS_USER')
      }).then((response) => {
        expect(response.status).to.equal(200)
        const data = response.body.data
        data.forEach((v) => {
          const redeemPoint = v.redeemPoint
          const isDisplay = v.isDisplay
          if (redeemPoint <= Cypress.env('USER_CURRENT_POINT')) {
            cy.log(
              `Redeem point ${v.redeemPoint} is less than current point ${Cypress.env('USER_CURRENT_POINT')} and redeemable`
            )
            expect(isDisplay, `isDisplay should be true`).to.equal(true)
          } else {
            cy.log(
              `Redeem point ${v.redeemPoint} is more than current point ${Cypress.env('USER_CURRENT_POINT')} and not redeemable`
            )
            expect(isDisplay, `isDisplay should be false`).to.equal(false)
          }
        })
      })
    })
  })
})
