const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")
const URL_PAYMENT = Cypress.config("baseUrlPayment")

describe('Admin check stock product before transaction', function() {
    it('Login admin', () => {
        const url = URL_USER + "/admin/login"
        cy.api({
            method: "POST",
            url,
            // headers,
            body: {
                username: Cypress.env("ADMIN_USERNAME"),
                password: Cypress.env("ADMIN_PASSWORD")
            }
        })
        .then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.statusCode).to.equal(201)
            expect(response.body.data.accessToken).to.not.be.empty
            const tokenAdmin = response.body.data.accessToken
            // const employeeToken = response.body.data.accessToken
            Cypress.env("REQUEST_HEADERS_ADMIN", {
                Authorization: "Bearer " + tokenAdmin
            })
        })
    })
    
    it("Should return the correct SKU, Store Code, and UBD", () => {
        // check stock summary sku 112780193
        const url = URL_PRODUCT + '/admin/stock-summary'
        const sku = '112780193'
        const storeCode = '14216'
        const ubd = '2025-05-25'
        const urlFilter = url + `?sku=${sku}&storeCode=${storeCode}&ubd=${ubd}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            // const qty_awal = 0
            if (data.length === 0) {
                const qty_awal = 0
                Cypress.env("qty_awal_112780193", qty_awal)
                // cy.log('Quantity 112780193 before trx: ', qty_awal)
            } else if (data.length === 1) {
                const qty_awal = data[0].qty
                Cypress.env("qty_awal_112780193", qty_awal)
                // cy.log('Quantity 112780193 before trx: ', qty_awal)
            }
            // Cypress.env("qty_awal_112780193", qty_awal)
        })

        // check stock untuk sku 101080547
        const sku2 = '101080547'
        const ubd2 = '2025-02-25'
        const urlFilter2 = url + `?sku=${sku2}&storeCode=${storeCode}&ubd=${ubd2}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter2,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            const ubdTest = new Date(ubd2)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku2])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            // const qty_awal = 0
            if (data.length === 0) {
                const qty_awal = 0
                Cypress.env("qty_awal_101080547", qty_awal)
                // cy.log('Quantity 101080547 before trx: ', qty_awal)
            } else {
                const qty_awal = data[0].qty
                Cypress.env("qty_awal_101080547", qty_awal)
                // cy.log('Quantity 101080547 before trx: ', qty_awal)
            }
            // Cypress.env("qty_awal_101080547", qty_awal)
        })

        // check stock untuk sku 190252242
        const sku3 = '190252242'
        const ubd3 = '2025-02-25'
        const urlFilter3 = url + `?sku=${sku3}&storeCode=${storeCode}&ubd=${ubd3}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter3,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            const ubdTest = new Date(ubd3)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku3])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            // const qty_awal = 0
            if (data.length === 0) {
                const qty_awal = 0
                Cypress.env("qty_awal_190252242", qty_awal)
                // cy.log('Quantity 190252242 before trx: ', qty_awal)
            } else {
                const qty_awal = data[0].qty
                Cypress.env("qty_awal_190252242", qty_awal)
                // cy.log('Quantity 190252242 before trx: ', qty_awal)
            }
            // Cypress.env("qty_awal_101080547", qty_awal)
        })
    })

})

describe('Staff create order public customer with void item', function() {
    it('Successfully login', () => {
        const url = URL_USER + "/employee/login"
        cy.api({
            method: "POST",
            url,
            body: {
                nik: Cypress.env("EMP_NIK"),
                storeCode: Cypress.env("EMP_STORECODE"),
                pin: Cypress.env("EMP_PIN")
            }
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const body = response.body
            expect(body).to.haveOwnProperty("statusCode")
            expect(body).to.haveOwnProperty("message")
            expect(body).to.haveOwnProperty("data")
            expect(body.statusCode).to.equal(201)
            expect(body.message).to.equal("Success")
            const data = body.data
            expect(data).to.haveOwnProperty("accessToken")
        })
        .then(response => {
            const employeeToken = response.body.data.accessToken
            Cypress.env("REQUEST_HEADERS", {
                Authorization: "Bearer " + employeeToken,
                channel: "pos"
            })
            Cypress.env("emp_nik", response.body.data.user.nik)
            Cypress.env("storeCode", response.body.data.user.storeCode)
        })
    })

    it("Check shift", () => {
        const url = URL_USER + "/employee/shift"
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
        })
        .should(response => {
            const body = response.body
            expect(body).to.haveOwnProperty("statusCode")
            expect(body).to.haveOwnProperty("message")
        })
        .then(response => {
            Cypress.env("RESPONSE_BODY", response.body)
        })
    })
    
    it("Close shift", () => {
        const body = Cypress.env("RESPONSE_BODY")
        if (body.statusCode === 200 && body.data.shift.status === "expired") {
            const url = URL_USER + "/employee/shift/close"
            cy.api({
                method: "POST",
                url,
                headers: Cypress.env("REQUEST_HEADERS"),
                failOnStatusCode: false
            })
            .should(response => {
                expect(response.status).to.equal(201)
            })
            .then(response => {
                Cypress.env("RESPONSE_BODY", response.body)
            })
        } else if (body.statusCode === 500) {
            cy.log('Internal Server Error')
        } else {
            cy.log('tidak perlu close shift')
        }
    })

    it("Open shift", () => {
        const body = Cypress.env("RESPONSE_BODY")
        if (body.statusCode === 201) {
            const url = URL_USER + "/employee/shift/open"
            cy.api({
                method: "POST",
                url,
                headers: Cypress.env("REQUEST_HEADERS"),
                failOnStatusCode: false
            })
            .should(response => {
                expect(response.status).to.equal(201)
            })
        } else if (body.statusCode === 400) {
            const url = URL_USER + "/employee/shift/open"
            cy.api({
                method: "POST",
                url,
                headers: Cypress.env("REQUEST_HEADERS"),
                failOnStatusCode: false
            })
            .should(response => {
                expect(response.status).to.equal(201)
            })
        } else if (body.statusCode === 500) {
            cy.log('Internal Server Error')
        } else {
            cy.log('shift sedang berjalan')
        }
    })

    it("Shows all cart list", () => {
        const url = URL_PRODUCT + "/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0"
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .should(response => {
            expect(response.status).to.equal(200)
        })
    })
    
    it("Creates a public cart", () => {
        const { request: mockRequest, response: mockResponse } = require("../fixtures/generators").createPublicCartPayload_14216()
        const url = URL_PRODUCT + "/employee/cart/create"
        cy.api({
            method: "POST",
            url,
            body: mockRequest,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const data = response.body.data
            delete data.user
            delete data.customer.id
            delete data.customer._id
            delete data.createdBy.updatedAt
            delete data.createdBy.lastLogin
            delete data.createdBy.shiftAttendanceId
            delete data.createdBy.shiftCode
            delete data._id
            delete data.updatedAt
            delete data.createdAt
            expect(data).to.deep.equal(mockResponse)
            console.log(mockResponse)
            Cypress.env('PUBLIC_CUSTOMER_FIRSTNAME', mockRequest.firstName);
        })
    })
    
    it("Shows recently created public cart on the first list", () => {
        const url = URL_PRODUCT + "/employee/cart/list/all-v2?page=1&size=10&skipCart=0&skipRedemption=0"
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .should(response => {
            expect(response.status).to.equal(200)
            const data = response.body.data
            const firstItem = data.docs[0]
            Cypress.env("customerId", firstItem.customer_id)
            delete firstItem._id
            delete firstItem.customer_id
        
            const firstname = Cypress.env("PUBLIC_CUSTOMER_FIRSTNAME")
            const expected = require("../fixtures/generators").newlyCreatedPublicCart(firstname)
            expect(firstItem).to.deep.equal(expected)
        })
    })
    
    it("Shows empty cart details", () => {
        const url = URL_PRODUCT + `/employee/cart/${Cypress.env("customerId")}`
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.data.items.length).to.equal(0)
            expect(response.body.data.totalAmount).to.equal(0)
            expect(response.body.data.totalWeight).to.equal(0)
            expect(response.body.data.paymentAmount).to.equal(0)
            expect(response.body.data.currentPayment).to.equal(0)
            Cypress.env("CART", response.body.data)
        })
    })

    it("Should able to assign employee", () => {
        const url = URL_PRODUCT + "/employee/cart/" +Cypress.env('customerId')+ "/assign-to"
        const nik = Cypress.env('emp_nik')
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                nik: nik
            }
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const data = response.body.data
            expect(data.assignTo.nik).to.equal(nik)
            Cypress.env("CART", response.body.data)
        })
    })

    it('Should able to add 1 product to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-05"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const data = response.body.data
            expect(data.items.length).to.equal(1)
            expect(data.void_items.length).to.equal(0)
            Cypress.env("CART", data)
        })
        .should(response => {
            const item = response.body.data.items
            expect(item.length).to.equal(1)
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
            const responseUbd = item[0].ubdDetail[0].ubd
            const responseUbdDate = new Date(responseUbd)
            const yearExpiredResponse = responseUbdDate.getFullYear()
            const monthExpiredResponse = responseUbdDate.getMonth() + 1
            expect(item[0].sku).to.equal(sku)
            expect(item[0].qty).to.equal(qty)
            expect(item[0].ubdDetail[0].total).to.equal(qty)
            expect(yearExpiredResponse).to.equal(yearExpiredTest)
            expect(monthExpiredResponse).to.equal(monthExpiredTest)
            const price_112780193 = item[0].product.price
            Cypress.env("price_112780193", price_112780193)
            Cypress.env("totalAmount", price_112780193)
            Cypress.env("paymentAmount", price_112780193)
            //sub_total
            expect(item[0].sub_total).to.equal(price_112780193)
            expect(response.body.data.totalAmount).to.equal(Cypress.env("totalAmount"))
            expect(response.body.data.paymentAmount).to.equal(Cypress.env("paymentAmount"))
        })
    })

    it('Should able to add other product to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "190252242"
        const qty = 1
        const ubd = "2025-02"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const data = response.body.data
            expect(data.items.length).to.equal(2)
            expect(data.void_items.length).to.equal(0)
            Cypress.env("CART", data)
        })
        .should(response => {
            const item = response.body.data.items
            expect(item.length).to.equal(2)
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
            const responseUbd = item[1].ubdDetail[0].ubd
            const responseUbdDate = new Date(responseUbd)
            const yearExpiredResponse = responseUbdDate.getFullYear()
            const monthExpiredResponse = responseUbdDate.getMonth() + 1
            expect(item[1].sku).to.equal(sku)
            expect(item[1].qty).to.equal(qty)
            expect(item[1].ubdDetail[0].total).to.equal(qty)
            expect(yearExpiredResponse).to.equal(yearExpiredTest)
            expect(monthExpiredResponse).to.equal(monthExpiredTest)
            const price_190252242 = item[1].product.price
            Cypress.env("price_190252242", price_190252242)
            const totalAmount = Cypress.env("totalAmount") + price_190252242
            Cypress.env("totalAmount", totalAmount)
            Cypress.env("paymentAmount", totalAmount)
            //sub_total
            expect(item[1].sub_total).to.equal(price_190252242)
            expect(response.body.data.totalAmount).to.equal(Cypress.env("totalAmount"))
            expect(response.body.data.paymentAmount).to.equal(Cypress.env("paymentAmount"))
        })
    })

    it('Should able to add void item to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const sku = "101080547"
        const qty = 1
        const ubd = "2025-02"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const data = response.body.data
            expect(data.items.length).to.equal(2)
            expect(data.void_items.length).to.equal(1)
            Cypress.env("CART", data)
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
            expect(item.length).to.equal(1)
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
            const responseUbd = item[0].ubd
            const responseUbdDate = new Date(responseUbd)
            const yearExpiredResponse = responseUbdDate.getFullYear()
            const monthExpiredResponse = responseUbdDate.getMonth() + 1
            expect(item[0].sku).to.equal(sku)
            expect(item[0].qty).to.equal(qty)
            expect(yearExpiredResponse).to.equal(yearExpiredTest)
            expect(monthExpiredResponse).to.equal(monthExpiredTest)
            const price_101080547 = item[0].product.price
            Cypress.env("price_101080547", price_101080547)
            //sub_total
            expect(item[0].sub_total).to.equal(price_101080547)
            const totalAmount = Cypress.env("totalAmount")
            const paymentAmount = totalAmount - price_101080547
            Cypress.env("paymentAmount", paymentAmount)
            expect(response.body.data.totalAmount).to.equal(totalAmount)
            expect(response.body.data.paymentAmount).to.equal(paymentAmount)
        })
    })

    it('Should able to get available payment method', () => {
        const url = URL_PAYMENT + "/payment-method?amount=" + Cypress.env('paymentAmount')+ "&store=" + Cypress.env('storeCode')
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .then(response => {
            expect(response.status).to.equal(200)
            const paymentMethodsResponse = response.body.data
            const paymentMethods = paymentMethodsResponse[0].paymentMethods
            expect(paymentMethodsResponse).to.be.an('array');
            expect(paymentMethodsResponse.length).to.be.greaterThan(0)

            const payments = paymentMethodsResponse[0]
            expect(payments).to.haveOwnProperty("paymentMethods")
            expect(payments.paymentMethods).to.be.an('array');
            expect(payments.paymentMethods.length).to.be.greaterThan(0)
        })

    })

    it(`Successfully select "Tunai" as payment method`, () => {
        const cart = Cypress.env("CART")
        const mockPayload = {
            "method": "18",
            "isInstallment": false,
            "token": "",
            "installmentTenor": 0,
            "isOvo": false,
            "ovoNumber": "",
            "ovoRetryCount": 0,
            "bin_number": "",
            approvalCode: "AUT123",
            value: Cypress.env("paymentAmount")
        }
    
        const url = URL_PRODUCT + `/employee/cart/${Cypress.env("customerId")}/update-payment-v2`
        cy.api({
            url,
            method: "PATCH",
            headers: Cypress.env("REQUEST_HEADERS"),
            body: mockPayload
        }).should(response => {
            expect(response.status).to.equal(200)
        
            const body = response.body.data
            // validate payment field
            const { info, name, changeDue, ...paymentObjResponse } = body.payments
            expect(paymentObjResponse).to.deep.equal(mockPayload)
        
            // validate multipayment
            expect(body.multiPayments).to.be.an('array');
            expect(body.multiPayments.length).to.be.greaterThan(0)
            Cypress.env("CART", response.body.data)
        })
    })
    
    it("Successfully validates pre-order informations", () => {
        const url = URL_PRODUCT + `/employee/cart/${Cypress.env("customerId")}/validate-purchase`
        cy.api({
            url,
            method: "GET",
            headers: Cypress.env("REQUEST_HEADERS"),
        }).should(response => {
            expect(response.status).to.equal(200)
        })
    })

    it("Successfully create order", () => {
        const cart = Cypress.env("CART")
    
        // expect(cart.omni_trx_type).to.equal("WALK_IN")
        // expect(cart.is_omni).to.equal(false)
    
        const payload = {
            "cart": cart._id,
            "approvalCode": cart.payments.approvalCode,
            "notes": ""
        }
    
        const url = URL_PRODUCT + `/order/create-v2`
        cy.api({
            url,
            method: "POST",
            headers: Cypress.env("REQUEST_HEADERS"),
            body: payload
        }).should(response => {
            expect(response.status).to.equal(201)
            const body = response.body.data
    
            expect(body).to.haveOwnProperty("orderNumber")
            Cypress.env("orderNumber", response.body.data.orderNumber)
            expect(body.cartId).to.equal(cart._id)
    
            expect(body.items).to.be.an('array');
            expect(body.items.length).to.be.greaterThan(0);
            // let totalItemPrice = 0
            // body.items.forEach(item => {
            //     totalItemPrice += item.grandTotal
            //     const qty = item.qty
            //     const totalQtyFromUbdDetail = item.ubdDetail.reduce((total, ubd) => {
            //     total += ubd.total
            //     return total
            //     }, 0)
            //     expect(qty).to.equal(totalQtyFromUbdDetail)
            // })
        
            expect(body.totalAmount).to.equal(Cypress.env("totalAmount"))
            expect(body.paymentAmount).to.equal(Cypress.env("paymentAmount"))
            expect(body.payments.paymentStatus).to.equal('Paid')
            expect(body.paymentStatus).to.equal('Paid')
            expect(body.orderStatus).to.equal('PAID')
        })
    })

})

describe('Admin check stock product after transaction', function() {

    it('Should get stock movement data', () => {
        // check stock movement sku 112780193
        const url = URL_PRODUCT + '/stock-movement'
        const sku = '112780193'
        const ubd = '2025-05-25'
        const urlFilter = url + `?sku=${sku}&from=${Cypress.env("storeCode")}&event=sales&orderNumber=${Cypress.env("orderNumber")}&ubd=${ubd}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.be.greaterThan(0);
            expect(data.length).to.equal(1);
            expect(data).to.be.an('array');
            const movement = data[0]
            expect(movement.sku).to.equal(sku)
            expect(movement.from).to.equal(Cypress.env("storeCode"))
            expect(movement.orderNumber).to.equal(Cypress.env("orderNumber"))
            expect(movement.qty).to.equal(1)
            Cypress.env("qty_movement_112780193", movement.qty)
            // cy.log('Quantity movement 112780193 after trx: ', movement.qty)
        })

        // check stock movement sku 101080547 void
        const sku2 = '101080547'
        const ubd2 = '2025-02-25'
        const urlFilter2 = url + `?sku=${sku2}&from=${Cypress.env("storeCode")}&event=sales&orderNumber=${Cypress.env("orderNumber")}&ubd=${ubd2}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter2,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.be.greaterThan(0);
            expect(data.length).to.equal(1);
            expect(data).to.be.an('array');
            const movement = data[0]
            Cypress.env("qty_movement_101080547", movement.qty)
            expect(movement.sku).to.equal(sku2)
            expect(movement.from).to.equal(Cypress.env("storeCode"))
            expect(movement.orderNumber).to.equal(Cypress.env("orderNumber"))
            expect(movement.qty).to.equal(-1)
            // cy.log('Quantity movement 101080547 after trx: ', movement.qty)
        })

        // check stock movement sku 190252242
        const sku3 = '190252242'
        const ubd3 = '2025-02-25'
        const urlFilter3 = url + `?sku=${sku3}&from=${Cypress.env("storeCode")}&event=sales&orderNumber=${Cypress.env("orderNumber")}&ubd=${ubd3}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter3,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.be.greaterThan(0);
            expect(data.length).to.equal(1);
            expect(data).to.be.an('array');
            const movement = data[0]
            expect(movement.sku).to.equal(sku3)
            expect(movement.from).to.equal(Cypress.env("storeCode"))
            expect(movement.orderNumber).to.equal(Cypress.env("orderNumber"))
            expect(movement.qty).to.equal(1)
            Cypress.env("qty_movement_190252242", movement.qty)
            // cy.log('Quantity movement 190252242 after trx: ', movement.qty)
        })
    })
    
    it("Should return the correct SKU, Store Code, and UBD", () => {
        // check stock summary sku 112780193
        const url = URL_PRODUCT + '/admin/stock-summary'
        const sku = '112780193'
        const storeCode = Cypress.env("storeCode")
        const ubd = '2025-05-25'
        const urlFilter = url + `?sku=${sku}&storeCode=${storeCode}&ubd=${ubd}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.equal(1);
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            const qty_awal = Cypress.env("qty_awal_112780193")
            const qty_after = qty_awal - Cypress.env("qty_movement_112780193")
            expect(data[0].qty).to.equal(qty_after)
            // cy.log('Quantity stock 112780193 after trx: ', data[0].qty)
        })

        // check stock untuk sku 101080547
        const sku2 = '101080547'
        const ubd2 = '2025-02-25'
        const urlFilter2 = url + `?sku=${sku2}&storeCode=${storeCode}&ubd=${ubd2}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter2,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.equal(1);
            const ubdTest = new Date(ubd2)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku2])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            console.log(Cypress.env("qty_awal_101080547"),Cypress.env("qty_movement_101080547"))

            const qty_awal = Cypress.env("qty_awal_101080547")
            const qty_after = qty_awal - Cypress.env("qty_movement_101080547")
            expect(data[0].qty).to.equal(qty_after)
            // cy.log('Quantity stock 101080547 after trx: ', data[0].qty)
        })

        // check stock untuk sku 190252242
        const sku3 = '190252242'
        const ubd3 = '2025-02-25'
        const urlFilter3 = url + `?sku=${sku3}&storeCode=${storeCode}&ubd=${ubd3}&page=1&limit=100`
        cy.api({
            method: "GET",
            url: urlFilter3,
            headers: Cypress.env("REQUEST_HEADERS_ADMIN")
        })
        .should(response => {
            const data = response.body.data.docs
            expect(data.length).to.equal(1);
            const ubdTest = new Date(ubd3)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
    
            const matchingFunction = check => {
            const ubdResponse = new Date(check.ubd)
            const yearExpiredResponse = ubdResponse.getFullYear()
            const monthExpiredResponse = ubdResponse.getMonth() + 1
    
            const yearIsMatch = yearExpiredResponse === yearExpiredTest
            const monthIsMatch = monthExpiredResponse === monthExpiredTest
            return yearIsMatch && monthIsMatch
            }
    
            expect(Cypress._.every(data, matchingFunction)).to.deep.equal(true);
            expect(Cypress._.every(data, ["sku", sku3])).to.deep.equal(true);
            expect(Cypress._.every(data, ["storeCode", storeCode])).to.deep.equal(true);
            // expect(data.length).to.equal(1);
            console.log(Cypress.env("qty_awal_190252242"),Cypress.env("qty_movement_190252242"))

            const qty_awal = Cypress.env("qty_awal_190252242")
            const qty_after = qty_awal - Cypress.env("qty_movement_190252242")
            expect(data[0].qty).to.equal(qty_after)
            // cy.log('Quantity stock 190252242 after trx: ', data[0].qty)
        })
    })

})