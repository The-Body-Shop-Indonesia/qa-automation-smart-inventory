// const tokenAdmin = Cypress.env('TOKEN_ADMIN')
// const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config('baseUrlUser')
const URL_PRODUCT = Cypress.config('baseUrlProduct')
const urlCust = URL_USER + '/otp/validate'

describe('General API Test Group', () => {
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
        console.log(Cypress.env('CUSTOMER_REQ_HEADERS'))
        const URL_USER = Cypress.config('baseUrlUser')
        const url = URL_USER + '/membership/point'

        cy.api({
          method: 'GET',
          url,
          headers: Cypress.env('CUSTOMER_REQ_HEADERS')
        }).then((response) => {
          const URL_PRODUCT = Cypress.config('baseUrlProduct')
          const redeemUrl = URL_PRODUCT + '/online-voucher-redemption/redeem'
          const urlAdm = URL_USER + '/admin/login'
          const redeemVoucherList =
            URL_PRODUCT + '/online-voucher-redemption/list'
          const urlVMS = URL_PRODUCT + '/admin/voucher/vms/voucher-program'

          Cypress.env('REDEEM_URL', redeemUrl)
          Cypress.env('REDEEM_VOCUHER_LIST', redeemVoucherList)
          Cypress.env('VMS_URL', urlVMS)
          Cypress.env('ADMN_URL', urlAdm)
          Cypress.env('CUSTOMER_POINT', response.body.data.currentPoint)
          cy.log({ point: response.body.data.currentPoint })
        })
      })
  })

  // ---- technical sections
  // validate all payload
  it('Shows error 401 when customer token is not available', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer ',
        channel: 'web'
      },
      body: {
        voucherId: 'undefined'
      },
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.equal(401)
    })
  })

  it('Shows error 400 when request voucherId is not exist', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: ''
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })

  it('Shows error 400 when request voucherId is random string', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: 'asdasdass'
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })

  it('Shows error 400 when request voucherId is not the right mongoID', () => {
    cy.api({
      method: 'POST',
      url: Cypress.env('REDEEM_URL'),
      failOnStatusCode: false,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
      body: {
        voucherId: '64fee72345cad5f619c6ab69'
      }
    }).should((response) => {
      expect(response.status, 'expect errorCode 400').to.equal(400)
    })
  })
})

// describe('Voucher Partnership Purchase Attempt Testing', () => {
//   // ---- business sections
//   // success to buy voucher with sufficient point
//   it('Success to buy voucher with sufficient point', () => {
//     const myPoint = Cypress.env('CUSTOMER_POINT')
//     cy.log({ point: myPoint })

//     // get voucher to buy
//     const URL_PRODUCT = Cypress.config('baseUrlProduct')
//     cy.api({
//       method: 'GET',
//       url: Cypress.env('REDEEM_VOCUHER_LIST'),
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).then((response) => {
//       const affordableVouchers = response.body.data.filter((vcr) => {
//         const redeemable = vcr.isDisplay
//         const sufficientPoint = vcr.redeemPoint <= myPoint
//         const partnershipVcr = vcr.isPartnerShip
//         return redeemable && sufficientPoint && partnershipVcr
//       })
//       const voucherToBuy = affordableVouchers[0]
//       Cypress.env('VOUCHER_TO_BUY', affordableVouchers[0])

//       cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
//       // purchase voucher
//       cy.api({
//         method: 'POST',
//         url: Cypress.env('REDEEM_URL'),
//         headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
//         failOnStatusCode: false,
//         body: {
//           voucherId: voucherToBuy._id
//         }
//       }).should((_response) => {
//         expect(_response.status, 'Expect Http status 201').to.equal(201)
//         expect(_response.body.message, 'Message should be Success').to.equal(
//           'Success'
//         )
//         expect(
//           _response.body.data,
//           'Data should be Success Redeem Voucher'
//         ).to.equal('Success Redeem Voucher')
//       })
//     })
//   })

//   it('My Point should correctly deducted', () => {
//     // check point deduction!
//     const myPoint = Cypress.env('CUSTOMER_POINT')
//     const URL_USER = Cypress.config('baseUrlUser')
//     cy.api({
//       method: 'GET',
//       url: URL_USER + '/membership/point',
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).should((response) => {
//       const pointAfterDeduction = response.body.data.currentPoint
//       const purchasedVoucher = Cypress.env('VOUCHER_TO_BUY')
//       console.log(purchasedVoucher.redeemPoint)
//       const voucherPrice = purchasedVoucher.redeemPoint
//       const pointAfterPurchase = myPoint - voucherPrice
//       expect(pointAfterDeduction, 'My Point is correctly deducted').to.be.equal(
//         pointAfterPurchase
//       )
//       Cypress.env('CUSTOMER_POINT', pointAfterPurchase)
//     })
//   })

//   it('Shows Purchased Voucher in My Voucher List', () => {
//     // check my vouchers
//     //check my voucher partnership
//     const URL_PRODUCT = Cypress.config('baseUrlProduct')
//     cy.api({
//       method: 'GET',
//       url: URL_PRODUCT + '/voucher/my-voucher',
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).should((response) => {
//       expect(response.status).to.equal(200)
//       const partnership_voucher = response.body.data.partnershipVouchers

//       expect(
//         partnership_voucher.length,
//         'Purchased Voucher exist in my voucher'
//       ).to.be.greaterThan(0)
//       partnership_voucher.forEach(function (item) {
//         expect(item).to.haveOwnProperty('voucherCode')
//         expect(item).to.haveOwnProperty('tbsCodeVoucherProgram')
//         expect(item).to.haveOwnProperty('type')
//         expect(item).to.haveOwnProperty('title')
//         expect(item).to.haveOwnProperty('expiryDate')
//         expect(item).to.haveOwnProperty('redeemDate')

//         if (
//           partnership_voucher.tbsCodeVoucherProgram ===
//           Cypress.env('VOUCHER_TO_BUY').tbsCodeVoucherProgram
//         ) {
//           expect(partnership_voucher.redeemDate).to.be.null
//           expect(partnership_voucher.available).to.be.true
//           expect(partnership_voucher.status).to.equal('available')
//         }
//       })
//       //const purchasedVoucher = redeemedVoucherExist[0]
//     })
//   })

//   it('Quota voucher deducted', () => {
//     // quota from voucher redemption list
//     const URL_PRODUCT = Cypress.config('baseUrlProduct')
//     const voucher_program = Cypress.env('VOUCHER_TO_BUY').tbsCodeVoucherProgram
//     //https://sit-products.tbsgroup.co.id/api/v1/online-voucher-redemption/list?search=Ketiga%20QA%20Partnership

//     cy.api({
//       method: 'GET',
//       url:
//         URL_PRODUCT +
//         `/online-voucher-redemption/list?search=${voucher_program}`,
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).should((response) => {
//       const data = response.body.data[0]
//       const quota_awal = Cypress.env('VOUCHER_TO_BUY').quota
//       const quota_calculate = quota_awal - 1
//       expect(data.quota).to.be.equal(quota_calculate)
//     })
//   })

//   // failed to boy voucher with insufficient point
//   it('Failed to buy voucher with insufficient point', () => {
//     const myPoint = Cypress.env('CUSTOMER_POINT')
//     cy.log({ point: myPoint })

//     // get voucher to buy
//     cy.api({
//       method: 'GET',
//       url: Cypress.env('REDEEM_VOCUHER_LIST'),
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).then((response) => {
//       const unaffordableVouchers = response.body.data.filter((vcr) => {
//         const insufficientPoint = vcr.redeemPoint > myPoint
//         return insufficientPoint
//       })
//       const voucherToBuy = unaffordableVouchers[0]
//       console.log(voucherToBuy)

//       Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])

//       cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
//       // purchase voucher
//       cy.api({
//         method: 'POST',
//         url: Cypress.env('REDEEM_URL'),
//         headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
//         failOnStatusCode: false,
//         body: {
//           voucherId: voucherToBuy._id
//         }
//       }).should((_response) => {
//         expect(_response.status, 'Expect Http status 400').to.equal(400)
//       })
//     })
//   })

//   it('failed to buy voucher when voucher quota limit is exceeded', () => {
//     cy.api({
//       method: 'GET',
//       url: Cypress.env('REDEEM_VOCUHER_LIST'),
//       headers: Cypress.env('CUSTOMER_REQ_HEADERS')
//     }).then((response) => {
//       const unaffordableVouchers = response.body.data.filter((vcr) => {
//         const quotaLimit = vcr.quota < 1
//         return quotaLimit
//       })
//       const voucherToBuy = unaffordableVouchers[0]
//       console.log(voucherToBuy)

//       Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])

//       cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
//       // purchase voucher
//       cy.api({
//         method: 'POST',
//         url: Cypress.env('REDEEM_URL'),
//         headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
//         failOnStatusCode: false,
//         body: {
//           voucherId: voucherToBuy._id
//         }
//       }).should((_response) => {
//         expect(_response.status, 'Expect Http status 400').to.equal(400)
//       })
//     })
//   })

//   it('failed to buy voucher when voucher is expired', () => {
//     //get expired voucher program
//     cy.api({
//       method: 'POST',
//       url: Cypress.env('ADMN_URL'),
//       body: {
//         username: Cypress.env('ADMIN_USERNAME'),
//         password: Cypress.env('ADMIN_PASSWORD')
//       }
//     }).then((response) => {
//       const adminToken = response.body.data.accessToken
//       Cypress.env('REQUEST_HEADERS_ADMIN', {
//         Authorization: 'Bearer ' + adminToken
//       })

//       cy.api({
//         method: 'GET',
//         url: Cypress.env('VMS_URL') + '?page=1&limit=50&sort=-updatedAt',
//         headers: Cypress.env('REQUEST_HEADERS_ADMIN')
//       }).then((vcrresponse) => {
//         const now = new Date() - 1
//         console.log(now)
//         const unaffordableVouchers = vcrresponse.body.data.docs.filter(
//           (vcr) => {
//             const redeemable = vcr.isRedeemable
//             const partnership = vcr.isPartnerShip
//             const expiredVcr = new Date(vcr.periodEnd)
//             const expiredVoucher = expiredVcr < now
//             console.log(
//               'expired: ',
//               expiredVoucher,
//               'redeemable: ',
//               redeemable,
//               'partnership: ',
//               partnership
//             )
//             return expiredVoucher && redeemable === true && partnership === true
//           }
//         )
//         const voucherToBuy = unaffordableVouchers[0]
//         console.log(voucherToBuy)
//         Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])
//         cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)

//         // purchase voucher with expired voucher program
//         cy.api({
//           method: 'POST',
//           url: Cypress.env('REDEEM_URL'),
//           headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
//           failOnStatusCode: false,
//           body: {
//             voucherId: voucherToBuy._id
//           }
//         }).should((_response) => {
//           expect(_response.status, 'Expect Http status 400').to.equal(400)
//         })
//       })
//     })
//   })
// })

describe('Voucher TBS Purchase Attempt Testing', () => {
  // ---- business sections
  // success to buy voucher with sufficient point
  it('Success to buy voucher with sufficient point', () => {
    const myPoint = Cypress.env('CUSTOMER_POINT')
    cy.log({ point: myPoint })

    // get voucher to buy
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    cy.api({
      method: 'GET',
      url: Cypress.env('REDEEM_VOCUHER_LIST'),
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).then((response) => {
      const affordableVouchers = response.body.data.filter((vcr) => {
        const redeemable = vcr.isDisplay
        const sufficientPoint = vcr.redeemPoint <= myPoint
        const partnershipVcr = vcr.isPartnerShip
        return redeemable && sufficientPoint && partnershipVcr == false
      })
      const voucherToBuy = affordableVouchers[0]
      Cypress.env('VOUCHER_TO_BUY', affordableVouchers[0])

      cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
      // purchase voucher
      cy.api({
        method: 'POST',
        url: Cypress.env('REDEEM_URL'),
        headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
        failOnStatusCode: false,
        body: {
          voucherId: voucherToBuy._id
        }
      }).should((_response) => {
        expect(_response.status, 'Expect Http status 201').to.equal(201)
        expect(_response.body.message, 'Message should be Success').to.equal(
          'Success'
        )
        expect(
          _response.body.data,
          'Data should be Success Redeem Voucher'
        ).to.equal('Success Redeem Voucher')
      })
    })
  })

  it('My Point should correctly deducted', () => {
    // check point deduction!
    const myPoint = Cypress.env('CUSTOMER_POINT')
    const URL_USER = Cypress.config('baseUrlUser')
    cy.api({
      method: 'GET',
      url: URL_USER + '/membership/point',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      const pointAfterDeduction = response.body.data.currentPoint
      const purchasedVoucher = Cypress.env('VOUCHER_TO_BUY')
      console.log(purchasedVoucher.redeemPoint)
      const voucherPrice = purchasedVoucher.redeemPoint
      const pointAfterPurchase = myPoint - voucherPrice
      expect(pointAfterDeduction, 'My Point is correctly deducted').to.be.equal(
        pointAfterPurchase
      )
      Cypress.env('CUSTOMER_POINT', pointAfterPurchase)
    })
  })

  it('Shows Purchased Voucher in My Voucher List', () => {
    // check my vouchers
    //check my voucher partnership
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    cy.api({
      method: 'GET',
      url: URL_PRODUCT + '/voucher/my-voucher',
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      expect(response.status).to.equal(200)
      const partnership_voucher = response.body.data.partnershipVouchers
      expect(
        partnership_voucher.length,
        'Purchased Voucher exist in my voucher'
      ).to.be.greaterThan(0)
      partnership_voucher.forEach(function (item) {
        expect(item).to.haveOwnProperty('voucherCode')
        expect(item).to.haveOwnProperty('tbsCodeVoucherProgram')
        expect(item).to.haveOwnProperty('type')
        expect(item).to.haveOwnProperty('title')
        expect(item).to.haveOwnProperty('expiryDate')
        expect(item).to.haveOwnProperty('redeemDate')

        if (
          partnership_voucher.tbsCodeVoucherProgram ===
          Cypress.env('VOUCHER_TO_BUY').tbsCodeVoucherProgram
        ) {
          expect(partnership_voucher.redeemDate).to.be.null
          expect(partnership_voucher.available).to.be.false
          expect(partnership_voucher.status).to.equal('available')
        }
      })
      //const purchasedVoucher = redeemedVoucherExist[0]
    })
  })

  it('Quota voucher deducted', () => {
    // quota from voucher redemption list
    const URL_PRODUCT = Cypress.config('baseUrlProduct')
    const voucher_program = Cypress.env('VOUCHER_TO_BUY').tbsCodeVoucherProgram
    //https://sit-products.tbsgroup.co.id/api/v1/online-voucher-redemption/list?search=Ketiga%20QA%20Partnership

    cy.api({
      method: 'GET',
      url:
        URL_PRODUCT +
        `/online-voucher-redemption/list?search=${voucher_program}`,
      headers: Cypress.env('CUSTOMER_REQ_HEADERS')
    }).should((response) => {
      const data = response.body.data[0]
      const quota_awal = Cypress.env('VOUCHER_TO_BUY').quota
      const quota_calculate = quota_awal - 1
      expect(data.quota).to.be.equal(quota_calculate)
    })
  })

  //   // failed to boy voucher with insufficient point
  //   // it('Failed to buy voucher with insufficient point', () => {
  //   //   const myPoint = Cypress.env('CUSTOMER_POINT')
  //   //   cy.log({ point: myPoint })

  //   //   // get voucher to buy
  //   //   cy.api({
  //   //     method: 'GET',
  //   //     url: Cypress.env('REDEEM_VOCUHER_LIST'),
  //   //     headers: Cypress.env('CUSTOMER_REQ_HEADERS')
  //   //   }).then((response) => {
  //   //     const unaffordableVouchers = response.body.data.filter((vcr) => {
  //   //       const insufficientPoint = vcr.redeemPoint > myPoint
  //   //       return insufficientPoint
  //   //     })
  //   //     const voucherToBuy = unaffordableVouchers[0]
  //   //     console.log(voucherToBuy)

  //   //     Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])

  //   //     cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
  //   //     // purchase voucher
  //   //     cy.api({
  //   //       method: 'POST',
  //   //       url: Cypress.env('REDEEM_URL'),
  //   //       headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
  //   //       failOnStatusCode: false,
  //   //       body: {
  //   //         voucherId: voucherToBuy._id
  //   //       }
  //   //     }).should((_response) => {
  //   //       expect(_response.status, 'Expect Http status 400').to.equal(400)
  //   //     })
  //   //   })
  //   // })

  //   // it('failed to buy voucher when voucher quota limit is exceeded', () => {
  //   //   cy.api({
  //   //     method: 'GET',
  //   //     url: Cypress.env('REDEEM_VOCUHER_LIST'),
  //   //     headers: Cypress.env('CUSTOMER_REQ_HEADERS')
  //   //   }).then((response) => {
  //   //     const unaffordableVouchers = response.body.data.filter((vcr) => {
  //   //       const quotaLimit = vcr.quota < 1
  //   //       return quotaLimit
  //   //     })
  //   //     const voucherToBuy = unaffordableVouchers[0]
  //   //     console.log(voucherToBuy)

  //   //     Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])

  //   //     cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)
  //   //     // purchase voucher
  //   //     cy.api({
  //   //       method: 'POST',
  //   //       url: Cypress.env('REDEEM_URL'),
  //   //       headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
  //   //       failOnStatusCode: false,
  //   //       body: {
  //   //         voucherId: voucherToBuy._id
  //   //       }
  //   //     }).should((_response) => {
  //   //       expect(_response.status, 'Expect Http status 400').to.equal(400)
  //   //     })
  //   //   })
  //   // })

  //   // it('failed to buy voucher when voucher is expired', () => {
  //   //   //get expired voucher program
  //   //   cy.api({
  //   //     method: 'POST',
  //   //     url: Cypress.env('ADMN_URL'),
  //   //     body: {
  //   //       username: Cypress.env('ADMIN_USERNAME'),
  //   //       password: Cypress.env('ADMIN_PASSWORD')
  //   //     }
  //   //   }).then((response) => {
  //   //     const adminToken = response.body.data.accessToken
  //   //     Cypress.env('REQUEST_HEADERS_ADMIN', {
  //   //       Authorization: 'Bearer ' + adminToken
  //   //     })

  //   //     cy.api({
  //   //       method: 'GET',
  //   //       url: Cypress.env('VMS_URL') + '?page=1&limit=50&sort=-updatedAt',
  //   //       headers: Cypress.env('REQUEST_HEADERS_ADMIN')
  //   //     }).then((vcrresponse) => {
  //   //       const now = new Date() - 1
  //   //       console.log(now)
  //   //       const unaffordableVouchers = vcrresponse.body.data.docs.filter(
  //   //         (vcr) => {
  //   //           const redeemable = vcr.isRedeemable
  //   //           const partnership = vcr.isPartnerShip
  //   //           const expiredVcr = new Date(vcr.periodEnd)
  //   //           const expiredVoucher = expiredVcr < now
  //   //           console.log(
  //   //             'expired: ',
  //   //             expiredVoucher,
  //   //             'redeemable: ',
  //   //             redeemable,
  //   //             'partnership: ',
  //   //             partnership
  //   //           )
  //   //           return expiredVoucher && redeemable === true && partnership === true
  //   //         }
  //   //       )
  //   //       const voucherToBuy = unaffordableVouchers[0]
  //   //       console.log(voucherToBuy)
  //   //       Cypress.env('VOUCHER_TO_BUY', unaffordableVouchers[0])
  //   //       cy.log(`attempt to purchase voucherID ${voucherToBuy._id}`)

  //   //       // purchase voucher with expired voucher program
  //   //       cy.api({
  //   //         method: 'POST',
  //   //         url: Cypress.env('REDEEM_URL'),
  //   //         headers: Cypress.env('CUSTOMER_REQ_HEADERS'),
  //   //         failOnStatusCode: false,
  //   //         body: {
  //   //           voucherId: voucherToBuy._id
  //   //         }
  //   //       }).should((_response) => {
  //   //         expect(_response.status, 'Expect Http status 400').to.equal(400)
  //   //       })
  //   //     })
  //   //   })
  //   // })
})

//kalo quota abis
//kalo expired
