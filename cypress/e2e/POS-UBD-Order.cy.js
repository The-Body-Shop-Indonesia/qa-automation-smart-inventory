const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

describe('Admin check stock product before transaction', function() {
    it('Login admin', () => {
        const url = URL_USER + "/admin/login"
        cy.api({
            method: "POST",
            url,
            // headers,
            body: {
                username: "admin-tbs",
                password: "TBSIcms@Desember2022"
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
            if (data.length === 0) {
                qty_awal = 0
            } else {
                qty_awal = data[0].qty
            }
            Cypress.env("qty_awal_112780193", qty_awal)
        })

        // check stock untuk sku 101080547
    })

})

describe('Staff create order with void item', function() {
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
            const data = response.body.data
            expect(data).to.haveOwnProperty("_id")
            expect(data).to.haveOwnProperty("omni_trx_type")
            expect(data).to.haveOwnProperty("is_omni")
            expect(data).to.haveOwnProperty("assignToStoreDispatcher")
            expect(data).to.haveOwnProperty("user")
            expect(data).to.haveOwnProperty("items")
            expect(data).to.haveOwnProperty("void_items")
            expect(data).to.haveOwnProperty("totalAmount")
            expect(data).to.haveOwnProperty("totalWeight")
            expect(data).to.haveOwnProperty("payments")
            expect(data).to.haveOwnProperty("multiPayments")
            expect(data).to.haveOwnProperty("billingAddress")
            expect(data).to.haveOwnProperty("shippingMethod")
            expect(data).to.haveOwnProperty("shippingAddress")
            expect(data).to.haveOwnProperty("shippingDetails")
            expect(data).to.haveOwnProperty("vouchers")
            expect(data).to.haveOwnProperty("paymentDetails")
            expect(data).to.haveOwnProperty("paymentAmount")
            expect(data).to.haveOwnProperty("currentPayment")
            expect(data).to.haveOwnProperty("isActive")
            expect(data).to.haveOwnProperty("isSendAsGift")
            expect(data).to.haveOwnProperty("greetingCartType")
            expect(data).to.haveOwnProperty("sendAsGiftDetail")
            expect(data).to.haveOwnProperty("storeCredit")
            expect(data).to.haveOwnProperty("store")
            expect(data).to.haveOwnProperty("store_dispatcher")
            expect(data).to.haveOwnProperty("point")
            expect(data).to.haveOwnProperty("cartRuleApplied")
            expect(data).to.haveOwnProperty("customer")
            expect(data).to.haveOwnProperty("createdBy")
            expect(data).to.haveOwnProperty("channel")
            expect(data).to.haveOwnProperty("freeProducts")
            expect(data).to.haveOwnProperty("freeProductOptions")
            expect(data).to.haveOwnProperty("vatAmount")
            expect(data).to.haveOwnProperty("discountDetail")
            expect(data).to.haveOwnProperty("assignTo")
            expect(data).to.haveOwnProperty("totalAmountVoid")
            expect(data).to.haveOwnProperty("type")
            expect(data).to.haveOwnProperty("isScanner")
            expect(data).to.haveOwnProperty("cartRuleOnSubtotal")
            expect(data).to.haveOwnProperty("freeProductOptionsSelected")
            expect(data).to.haveOwnProperty("dealsId")
            expect(data).to.haveOwnProperty("itemOrders")
            expect(data).to.haveOwnProperty("createdAt")
            expect(data).to.haveOwnProperty("updatedAt")
            expect(data).to.haveOwnProperty("__v")
            expect(data).to.haveOwnProperty("productCategoriesInternal")
            expect(data).to.haveOwnProperty("cashVoucher")
            data.items.forEach(function(item){
                expect(item).to.haveOwnProperty("product")
                expect(item).to.haveOwnProperty("qty")
                expect(item).to.haveOwnProperty("sub_total")
                expect(item).to.haveOwnProperty("sku")
                expect(item).to.haveOwnProperty("grandTotal")
                expect(item).to.haveOwnProperty("ubdDetail")
            })
        })
        .should(response => {
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




    // item + void tanpa promosi


})