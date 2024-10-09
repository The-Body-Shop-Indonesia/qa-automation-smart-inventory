const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

describe('Staff add void item to cart customer', function() {
    it('Successfully login', () => {
        const url = URL_USER + "/employee/login"
        cy.api({
            method: "POST",
            url,
            body: {
                nik: "13152",
                storeCode: "14216",
                pin: "1234"
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
        })
    })

    it('Check shift', () => {
        //close shift
        cy.api({
            method: "POST",
            url: URL_USER + "/employee/shift/close",
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
        })
        //cek shift
        const url = URL_USER + "/employee/shift"
        cy.api({
            method: "GET",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false
        })
        .then(response => {
            const status = response.body.statusCode
            // expect(status).to.equal(200)
            if (status === 400) {
                //open shift
                cy.api({
                    method: "POST",
                    url: URL_USER + "/employee/shift/open",
                    headers: Cypress.env("REQUEST_HEADERS")
                })
                .should(response => {
                    expect(response.status).to.equal(201)
                    expect(response.body.data.status).to.equal("open")
                })
            } 
        })
    })

    it('Should able to create cart', () => {
        const url = URL_PRODUCT + "/employee/cart/create"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                isGuest: false,
                firstName: "BE Automation",
                lastName: "User",
                cardNumber: "51727230398000325",
                nik: "",
                FamilyNumber: "",
                isFamily: false,
                customerGroup: "STARTER",
                image: "https://media-mobileappsdev.tbsgroup.co.id/mst/benefit/d4f31a39-5dab-4c50-a307-5d24282453ec.jpg",
                isScanner: true,
                isLapsed: false,
                isReactivated: false,
                isIcarusAppUser: false,
                autoEnroll: false,
                autoEnrollFrom: ""
            }
        })
        .should(response => {
            expect(response.status).to.equal(201)
            expect(response.body.data).to.haveOwnProperty("_id")
            expect(response.body.data.customer).to.haveOwnProperty("_id")
            const cartId = response.body.data._id
            Cypress.env("cartId", cartId)
            const customerId = response.body.data.customer._id
            Cypress.env("customerId", customerId)
        })
    })

    it('Should able to add product to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-05-25"
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
            expect(response.status).to.equal(201)
            const item = response.body.data.items
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
            //sub_total
            expect(item[0].sub_total).to.equal(price_112780193)
            expect(response.body.data.totalAmount).to.equal(price_112780193)
            expect(response.body.data.paymentAmount).to.equal(price_112780193)
        })
    })

    it('Should able to add void item to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const sku = "101080547"
        const qty = 1
        const ubd = "2025-02-25"
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
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
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
            const totalAmount = Cypress.env("price_112780193")
            const paymentAmount = Cypress.env("price_112780193") - price_101080547
            Cypress.env("paymentAmount", paymentAmount)
            expect(response.body.data.totalAmount).to.equal(totalAmount)
            expect(response.body.data.paymentAmount).to.equal(paymentAmount)
        })
    })

    it('Should able to add same void item to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const sku = "101080547"
        const qty = 1
        const ubd = "2025-03-25"
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
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
            const responseUbd = item[1].ubd
            const responseUbdDate = new Date(responseUbd)
            const yearExpiredResponse = responseUbdDate.getFullYear()
            const monthExpiredResponse = responseUbdDate.getMonth() + 1
            expect(item.length).to.equal(2)
            expect(item[1].sku).to.equal(sku)
            expect(item[1].qty).to.equal(qty)
            expect(yearExpiredResponse).to.equal(yearExpiredTest)
            expect(monthExpiredResponse).to.equal(monthExpiredTest)
            const price_101080547 = item[1].product.price
            Cypress.env("price_101080547", price_101080547)
            //sub_total
            expect(item[0].sub_total).to.equal(price_101080547)
            const totalAmount = Cypress.env("price_112780193")
            const paymentAmount = Cypress.env("paymentAmount") - price_101080547
            Cypress.env("paymentAmount", paymentAmount)
            expect(response.body.data.totalAmount).to.equal(totalAmount)
            expect(response.body.data.paymentAmount).to.equal(paymentAmount)
        })
    })

    it('Should able to add other void item to cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const sku = "190252218"
        const qty = 1
        const ubd = "2026-01-31"
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
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
            expect(item.length).to.equal(3)
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            // const formattedUbd = yearExpiredTest + '-' + monthExpiredTest + '-01T00:00:00.000Z'
            item.forEach((it) => {
                if (it.sku === sku) {
                    const responseUbd = it.ubd
                    const responseUbdDate = new Date(responseUbd)
                    const yearExpiredResponse = responseUbdDate.getFullYear()
                    const monthExpiredResponse = responseUbdDate.getMonth() + 1
                    expect(it.sku).to.equal(sku)
                    expect(it.qty).to.equal(qty)
                    expect(yearExpiredResponse).to.equal(yearExpiredTest)
                    expect(monthExpiredResponse).to.equal(monthExpiredTest)
                    const price_190252218 = it.product.price
                    Cypress.env("price_190252218", price_190252218)
                    //sub_total
                    expect(it.sub_total).to.equal(price_190252218)
                }
            });
            const totalAmount = Cypress.env("price_112780193")
            const paymentAmount = Cypress.env("paymentAmount") - Cypress.env("price_190252218")
            Cypress.env("paymentAmount", paymentAmount)
            expect(response.body.data.totalAmount).to.equal(totalAmount)
            expect(response.body.data.paymentAmount).to.equal(paymentAmount)
        })
    })

    it('Verify if add void item with invalid sku to cart', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const invalid_sku = "19025221"
        const qty = 1
        const ubd = "2026-01-31"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
            body: {
                sku: invalid_sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("Product not found.")
        })
    })

    it('Verify if add void item without ubd to cart', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const sku = "190252218"
        const qty = 1
        const ubd = ""
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: false,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
            expect(item.length).to.equal(4)
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            const jml = []
            item.forEach((it) => {
                if (it.sku === sku && it.ubd === null) {
                    expect(it.qty).to.equal(qty)
                    jml.push(it.sku)
                    const price_190252218 = it.product.price
                    Cypress.env("price_190252218", price_190252218)
                    //sub_total
                    expect(it.sub_total).to.equal(price_190252218)
                }
            });
            expect(jml.length).to.equal(1)
            const totalAmount = Cypress.env("price_112780193")
            const paymentAmount = Cypress.env("paymentAmount") - Cypress.env("price_190252218")
            Cypress.env("paymentAmount", paymentAmount)
            expect(response.body.data.totalAmount).to.equal(totalAmount)
            expect(response.body.data.paymentAmount).to.equal(paymentAmount)
        })
    })

    it('Check validation if add void item without UBD', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const invalid_sku = "190252218"
        const qty = 1
        const ubd = ""
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
            body: {
                sku: invalid_sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(400)
        })
    })

    it('Verify if add void item with invalid UBD format', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void"
        const invalid_sku = "190252218"
        const qty = 1
        const ubd = "2025"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
            body: {
                sku: invalid_sku,
                qty: qty,
                customPrice: 0,
                notes: "",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(400)
        })
    })

})

describe('Staff remove void item to cart customer', function() {
    it('Should able to remove void item in cart by scan QR', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void/remove"
        const sku = "101080547"
        const qty = 1
        const ubd = "2025-02-25"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(201)
            const item = response.body.data.void_items
            const ubdTest = new Date(ubd)
            const yearExpiredTest = ubdTest.getFullYear()
            const monthExpiredTest = ubdTest.getMonth() + 1
            const jml = []
            item.forEach((it) => {
                if (it.sku === sku) {
                    const responseUbd = it.ubd
                    const responseUbdDate = new Date(responseUbd)
                    const yearExpiredResponse = responseUbdDate.getFullYear()
                    const monthExpiredResponse = responseUbdDate.getMonth() + 1
                    if (yearExpiredResponse === yearExpiredTest && monthExpiredResponse === monthExpiredTest){
                        jml.push(it.sku)
                    }
                }
            });
            const totalAmount = Cypress.env("price_112780193")
            const paymentAmount = Cypress.env("paymentAmount") + Cypress.env("price_101080547")
            Cypress.env("paymentAmount", paymentAmount)
            // expect(response.body.data.totalAmount).to.equal(totalAmount)
            // expect(response.body.data.paymentAmount).to.equal(paymentAmount)
            expect(jml.length).to.equal(0)
        })
    })

    it('Verify remove void item in cart if ubd doesnt match', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void/remove"
        const sku = "101080547"
        const qty = 1
        const ubd = "2025-10-25"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
            body: {
                sku: sku,
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("Product not found on cart")
        })
    })

    it('Verify if remove void item with invalid sku', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/void/remove"
        const invalid_sku = "10108054"
        const qty = 1
        const ubd = "2025-10-25"
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
            body: {
                sku: invalid_sku,
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("Product not found on cart")
        })
    })

    it('Delete cart', () => {
        const url = URL_PRODUCT + "/employee/cart/" +Cypress.env('customerId')
        cy.api({
            method: "DELETE",
            url,
            headers: Cypress.env("REQUEST_HEADERS")
        })
        .should(response => {
            expect(response.status).to.equal(201)
            expect(response.body.statusCode).to.equal(200)
            expect(response.body.data).to.equal("Cart deleted")
        })
    })

})