const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')

describe('General API Test Group', () => {
  // login customer
  before('Login customer', () => {
    const identifier = Cypress.env('IDENTIFIER2_SDC')
    const otp = Cypress.env('OTP_SDC')
    const url = `${URL_USER}/otp/validate`
    cy.api({
      method: 'POST',
      url,
      // headers,
      body: {
        identifier: Cypress.env('IDENTIFIER2_SDC'),
        // identifier: Cypress.env('USER_EMAIL'),
        otp: Cypress.env('USER_OTP'),
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

  //redeem voucher dulu atau tidak?

  it('Shows My voucher yg sudah diredeem', () => {
    const url = `${URL_PRODUCT}/voucher/my-voucher`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(response.body.data).to.haveOwnProperty('partnershipVouchers')
      // check in partnershipVouchers
      const data = response.body.data.partnershipVouchers
      expect(data.length).to.not.equal(0)
      Cypress.env('voucherCode', data[0].voucherCode)
      expect(
        Cypress._.every(data, ['isPartnership', true]),
        `In partnershipVouchers, isPartnership should be true`
      ).to.deep.equal(true)
      expect(
        Cypress._.every(data, ['available', true]),
        `In partnershipVouchers, available should be true`
      ).to.deep.equal(true)
      expect(
        Cypress._.every(data, ['status', 'available']),
        `status should be available`
      ).to.deep.equal(true)
    })
  })
  it('Shows My voucher yg sudah dipake', () => {
    //redeem voucher
    const url = `${URL_PRODUCT}/voucher/redeem`
    cy.api({
      method: 'POST',
      url,
      body: { voucherCode: Cypress.env('voucherCode') },
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(201)
    })

    //check voucher status
    const url2 = `${URL_PRODUCT}/voucher/my-voucher`
    cy.api({
      method: 'GET',
      url: url2,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    })
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.statusCode).to.equal(200)
        expect(response.body.data).to.haveOwnProperty('inactiveVouchers')
        //check in inactiveVoucher
        const data = response.body.data.inactiveVouchers
        const voucherCode = Cypress.env('voucherCode')
        const dat = []
        data.forEach((voucher) => {
          if (voucher.voucherCode === voucherCode) {
            dat.push(voucher.voucherCode)
            expect(voucher.available, `available should be false`).to.equal(
              false
            )
            expect(voucher.status, `status should be used`).to.equal('used')
          }
        })
        expect(
          dat.length,
          `Voucher ${voucherCode} should be exist in inactiveVouchers`
        ).to.equal(1)
      })
      .then((response) => {
        //check in activeVouchers
        const data = response.body.data.activeVouchers
        const voucherCode = Cypress.env('voucherCode')
        const dat = []
        data.forEach((voucher) => {
          if (voucher.voucherCode === voucherCode) {
            dat.push(voucher.voucherCode)
          }
        })
        expect(
          dat.length,
          `Voucher ${voucherCode} should not exist in activeVouchers`
        ).to.equal(0)
      })
      .then((response) => {
        //check in partnershipVouchers
        const data = response.body.data.partnershipVouchers
        const voucherCode = Cypress.env('voucherCode')
        const dat = []
        data.forEach((voucher) => {
          if (voucher.voucherCode === voucherCode) {
            dat.push(voucher.voucherCode)
          }
        })
        expect(
          dat.length,
          `Voucher ${voucherCode} should not exist in partnershipVouchers`
        ).to.equal(0)
      })
  })
  it('Shows My voucher yg sudah expired, harusnya masuk ke tab Past Voucher', () => {
    const url = `${URL_PRODUCT}/voucher/my-voucher`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    })
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.statusCode).to.equal(200)
        expect(response.body.data).to.haveOwnProperty('inactiveVouchers')
        // check in partnershipVouchers
        const data = response.body.data.inactiveVouchers
        const datExp = []
        if (data.length > 0) {
          data.forEach((expire) => {
            const status = expire.status
            if (status === 'expired') {
              datExp.push(status)
            }
          })
        }
        //jika ada data expired
        expect(datExp.length).to.not.equal(0)
      })
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.statusCode).to.equal(200)
        expect(response.body.data).to.haveOwnProperty('activeVouchers')
        // check in partnershipVouchers
        const data = response.body.data.activeVouchers
        const datExp = []
        if (data.length > 0) {
          data.forEach((expire) => {
            const status = expire.status
            if (status === 'expired') {
              datExp.push(status)
            }
          })
        }
        //jangan boleh ada voucher expired di activeVouchers
        expect(datExp.length).to.equal(0)
      })
      .then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.statusCode).to.equal(200)
        expect(response.body.data).to.haveOwnProperty('partnershipVouchers')
        // check in partnershipVouchers
        const data = response.body.data.partnershipVouchers
        const datExp = []
        if (data.length > 0) {
          data.forEach((expire) => {
            const status = expire.status
            if (status === 'expired') {
              datExp.push(status)
            }
          })
        }
        //jangan boleh ada voucher expired di partnershipVouchers
        expect(datExp.length).to.equal(0)
      })
  })

  // ---- technical sections
  // wrong ID format: non-MongoDB, undefined, empty
  //   it('', () => {})

  // not found ID
  //   it('', () => {})

  // ---- business sections
  // what data to show?
  it('Should has required data', () => {
    const url = `${URL_PRODUCT}/voucher/my-voucher`
    cy.api({
      method: 'GET',
      url,
      headers: Cypress.env('REQUEST_HEADERS_USER')
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body.statusCode).to.equal(200)
      expect(response.body.data).to.haveOwnProperty('partnershipVouchers')
      // check in partnershipVouchers
      const data = response.body.data.partnershipVouchers
      data.slice(0, 3).forEach((partnership) => {
        expect(partnership).to.haveOwnProperty('voucherCode')
        expect(partnership).to.haveOwnProperty('title')
        expect(partnership).to.haveOwnProperty('description')
        expect(partnership).to.haveOwnProperty('image')
        expect(partnership).to.haveOwnProperty('tnc')
        expect(partnership).to.haveOwnProperty('expiryDate')
        expect(partnership).to.haveOwnProperty('howToUse')
        expect(partnership).to.haveOwnProperty('bgImgUrl')
        expect(partnership).to.haveOwnProperty('status')
        const image = partnership.image
        if (image != '') {
          cy.request({
            method: 'GET',
            url: image
          }).then((response) => {
            expect(response.status, `Should return valid image`, {
              timeout: 60000
            }).to.equal(200)
          })
        }
      })
      const dataActive = response.body.data.activeVouchers
      dataActive.slice(0, 3).forEach((active) => {
        expect(active).to.haveOwnProperty('voucherCode')
        expect(active).to.haveOwnProperty('title')
        expect(active).to.haveOwnProperty('description')
        expect(active).to.haveOwnProperty('image')
        expect(active).to.haveOwnProperty('tnc')
        expect(active).to.haveOwnProperty('expiryDate')
        expect(active).to.haveOwnProperty('howToUse')
        expect(active).to.haveOwnProperty('bgImgUrl')
        expect(active).to.haveOwnProperty('status')
        const image = active.image
        if (image != '') {
          cy.request({
            method: 'GET',
            url: image
          }).then((response) => {
            expect(response.status, `Should return valid image`, {
              timeout: 60000
            }).to.equal(200)
          })
        }
      })
      const dataInactive = response.body.data.inactiveVouchers
      dataInactive.slice(0, 3).forEach((inactive) => {
        expect(inactive).to.haveOwnProperty('voucherCode')
        expect(inactive).to.haveOwnProperty('title')
        expect(inactive).to.haveOwnProperty('description')
        expect(inactive).to.haveOwnProperty('image')
        expect(inactive).to.haveOwnProperty('tnc')
        expect(inactive).to.haveOwnProperty('expiryDate')
        expect(inactive).to.haveOwnProperty('howToUse')
        expect(inactive).to.haveOwnProperty('bgImgUrl')
        expect(inactive).to.haveOwnProperty('status')
        const image = inactive.image
        if (image != '') {
          cy.request({
            method: 'GET',
            url: image
          }).then((response) => {
            expect(response.status, `Should return valid image`, {
              timeout: 60000
            }).to.equal(200)
          })
        }
      })
    })
    // .then((response) => {
    //   // check in activeVouchers
    //   const data = response.body.data.activeVouchers
    //   data.slice(0, 3).forEach((active) => {
    //     expect(active).to.haveOwnProperty('voucherCode')
    //     expect(active).to.haveOwnProperty('title')
    //     expect(active).to.haveOwnProperty('description')
    //     expect(active).to.haveOwnProperty('image')
    //     expect(active).to.haveOwnProperty('tnc')
    //     expect(active).to.haveOwnProperty('expiryDate')
    //     expect(active).to.haveOwnProperty('howToUse')
    //     expect(active).to.haveOwnProperty('bgImgUrl')
    //     expect(active).to.haveOwnProperty('status')
    //     const image = active.image
    //     if (image != '') {
    //       cy.request({
    //         method: 'GET',
    //         url: image
    //       }).then((response) => {
    //         expect(response.status, `Should return valid image`, {
    //           timeout: 60000
    //         }).to.equal(200)
    //       })
    //     }
    //   })
    // })
    // .then((response) => {
    //   // check in inactiveVouchers
    //   const data = response.body.data.inactiveVouchers
    //   data.slice(0, 3).forEach((inactive) => {
    //     expect(inactive).to.haveOwnProperty('voucherCode')
    //     expect(inactive).to.haveOwnProperty('title')
    //     expect(inactive).to.haveOwnProperty('description')
    //     expect(inactive).to.haveOwnProperty('image')
    //     expect(inactive).to.haveOwnProperty('tnc')
    //     expect(inactive).to.haveOwnProperty('expiryDate')
    //     expect(inactive).to.haveOwnProperty('howToUse')
    //     expect(inactive).to.haveOwnProperty('bgImgUrl')
    //     expect(inactive).to.haveOwnProperty('status')
    //     const image = inactive.image
    //     if (image != '') {
    //       cy.request({
    //         method: 'GET',
    //         url: image
    //       }).then((response) => {
    //         expect(response.status, `Should return valid image`, {
    //           timeout: 60000
    //         }).to.equal(200)
    //       })
    //     }
    //   })
    // })
  })

  // is the price right?
  //   it('', () => {})

  // is redeemable? compared to my current point
  //   it('', () => {})

  //   it('', () => {})
  //   it('', () => {})
})
