const tokenAdmin = Cypress.env('TOKEN_ADMIN')
const tokenPOS = Cypress.env('TOKEN_POS')
const URL_USER = Cypress.config("baseUrlUser")
const URL_PRODUCT = Cypress.config("baseUrlProduct")

describe('Staff add product to cart customer', function() {
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
            expect(status).to.equal(400)
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
            } else {
                
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

    it('Should able to add product to cart', () => {
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
        })
    })

    it('Should able to add product quantity to cart', () => {
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
            const item = response.body.data.items
            item.forEach((it) => {
                if (it.sku === sku) {
                    expect(it.qty).to.equal(qty+1)
                    expect(it.ubdDetail[0].total).to.equal(qty+1)
                }
            })
        })
    })

    it('Should able to add same product with different UBD to cart', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-07-25"
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
            const item = response.body.data.items
            item.forEach((it) => {
                if (it.sku === sku) {
                    const ubdTest = new Date(ubd)
                    const yearExpiredTest = ubdTest.getFullYear()
                    const monthExpiredTest = ubdTest.getMonth() + 1
                    const responseUbd = it.ubdDetail[1].ubd
                    const responseUbdDate = new Date(responseUbd)
                    const yearExpiredResponse = responseUbdDate.getFullYear()
                    const monthExpiredResponse = responseUbdDate.getMonth() + 1
                    //ubd 1
                    expect(it.qty).to.equal(qty+1+1)
                    expect(it.ubdDetail[0].total).to.equal(qty+1)
                    //ubd 2
                    expect(yearExpiredResponse).to.equal(yearExpiredTest)
                    expect(monthExpiredResponse).to.equal(monthExpiredTest)
                    expect(it.ubdDetail[1].total).to.equal(qty)
                }
            })
        })
    })

    it('Verify if add product without UBD', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "101050283"
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
            const item = response.body.data.items
            const jmlItem = []
            item.forEach((it) => {
                if (it.sku === sku) {
                    jmlItem.push(it.sku)
                }
            })
            expect(jmlItem.length).to.equal(1)
            item.forEach((it) => {
                if (it.sku === sku) {
                    expect(it.qty).to.equal(qty)
                    expect(it.ubdDetail[0].ubd).to.equal(null)
                    expect(it.ubdDetail[0].total).to.equal(qty)
                }
            })
        })
    })

    it('Check validation if add product without UBD', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "101050283"
        const qty = 1
        const ubd = ""
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
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
            expect(response.status).to.equal(400)
            expect(response.body.statusCode).to.equal(400)
        })
    })

    it('Should not able to add same product with quantity more than 10', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/add"
        const sku = "155060173"
        const qty = 1
        const quantity = 0
        const ubd = "2025-07-25"
        for (let index = 0; index < 5; index++) {
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
        }
        const ubd2 = "2025-08-25"
        for (let index = 0; index < 5; index++) {
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
                    ubd: ubd2
                }
            })
        }
        //input ke 11
        cy.api({
            method: "POST",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            failOnStatusCode: false,
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
            expect(response.status).to.equal(400)
            expect(response.body.statusCode).to.equal(400)
        })
    })
})

describe('Staff update product in cart customer', function() {
    it('Should able to edit note in product ', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/edit"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-05-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: qty,
                customPrice: 0,
                notes: "Menambahkan note di produk 112780193 ubd 2025-05",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const item = response.body.data.items
            item.forEach((it) => {
                if (it.sku === sku) {
                    // const ubdTest = new Date(ubd)
                    // const yearExpiredTest = ubdTest.getFullYear()
                    // const monthExpiredTest = ubdTest.getMonth() + 1
                    // const responseUbd = it.ubdDetail[0].ubd
                    // const responseUbdDate = new Date(responseUbd)
                    // const yearExpiredResponse = responseUbdDate.getFullYear()
                    // const monthExpiredResponse = responseUbdDate.getMonth() + 1
                    //ubd 1
                    // expect(it.qty).to.equal(qty+1+1)
                    // expect(it.ubdDetail[0].total).to.equal(qty+1)
                    //ubd 2
                    // expect(yearExpiredResponse).to.equal(yearExpiredTest)
                    // expect(monthExpiredResponse).to.equal(monthExpiredTest)
                    // expect(it.ubdDetail[1].total).to.equal(qty)
                    //notes
                    expect(it.notes).to.equal("Menambahkan note di produk 112780193 ubd 2025-05")
                }
            })
        })
    })

    it('Edit note should not add quantity in product ', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/edit"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-05-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: 3,
                customPrice: 0,
                notes: "Menambahkan note di produk 112780193 ubd 2025-05, pastikan qty tidak bertambah",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const item = response.body.data.items
            item.forEach((it) => {
                if (it.sku === sku) {
                    const ubdTest = new Date(ubd)
                    const yearExpiredTest = ubdTest.getFullYear()
                    const monthExpiredTest = ubdTest.getMonth() + 1
                    const responseUbd = it.ubdDetail[0].ubd
                    const responseUbdDate = new Date(responseUbd)
                    const yearExpiredResponse = responseUbdDate.getFullYear()
                    const monthExpiredResponse = responseUbdDate.getMonth() + 1
                    //ubd 1
                    expect(it.qty).to.equal(qty+1+1)
                    expect(it.ubdDetail[0].total).to.equal(qty+1)
                    //ubd 2
                    expect(yearExpiredResponse).to.equal(yearExpiredTest)
                    expect(monthExpiredResponse).to.equal(monthExpiredTest)
                    expect(it.ubdDetail[1].total).to.equal(qty)
                    //notes
                    expect(it.notes).to.equal("Menambahkan note di produk 112780193 ubd 2025-05, pastikan qty tidak bertambah")
                }
            })
        })
    })

    it('Verify if edit custom price product that has not config is_customPrice=true in cart', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/edit"
        const sku = "112780193"
        const qty = 1
        const ubd = "2025-05-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                qty: 3,
                customPrice: 10000,
                notes: "Pastikan customPrice tetap 0",
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const item = response.body.data.items
            item.forEach((it) => {
                if (it.sku === sku) {
                    //notes
                    expect(it.notes).to.equal("Pastikan customPrice tetap 0")
                    expect(it.customPrice).to.equal(0)
                }
            })
        })
    })
})

describe('Staff remove product in cart customer', function() {
    it('Decrease quantity product', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/remove"
        const sku = "112780193"
        const ubd = "2025-05-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const item = response.body.data.items
            const jmlItem = []
            item.forEach((it) => {
                if (it.sku === sku) {
                    jmlItem.push(it.sku)
                }
            })
            expect(jmlItem.length).to.equal(1)
            item.forEach((it) => {
                if (it.sku === sku) {
                    expect(it.qty).to.equal(2)
                    expect(it.ubdDetail[0].total).to.equal(1)
                }
            })
        })

        const ubd2 = "2025-07-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                requiredUbd: true,
                ubd: ubd2
            }
        })
        .should(response => {
            const item = response.body.data.items
            const jmlItem = []
            item.forEach((it) => {
                if (it.sku === sku) {
                    jmlItem.push(it.sku)
                }
            })
            expect(jmlItem.length).to.equal(1)
            item.forEach((it) => {
                if (it.sku === sku) {
                    expect(it.qty).to.equal(1)
                    const ubdTest = new Date(ubd2)
                    const yearExpiredTest = ubdTest.getFullYear()
                    const monthExpiredTest = ubdTest.getMonth() + 1
                    const ubdData = []
                    it.ubdDetail.forEach((dataUbd) => {
                        const ubd3 = dataUbd.ubd
                        const ubdRes = new Date(ubd3)
                        const yearExpiredRes = ubdRes.getFullYear()
                        const monthExpiredRes = ubdRes.getMonth() + 1
                        if (yearExpiredTest === yearExpiredRes && monthExpiredTest === monthExpiredRes) {
                            ubdData.push(ubd3)
                        }
                    })
                    expect(ubdData.length).to.equal(0)
                }
            })
        })
    })

    it('Remove product from cart', () => {
        const url = URL_PRODUCT + "/employee/cart/pos-ubd/" +Cypress.env('customerId')+ "/item/remove"
        const sku = "112780193"
        const ubd = "2025-05-25"
        cy.api({
            method: "PATCH",
            url,
            headers: Cypress.env("REQUEST_HEADERS"),
            body: {
                sku: sku,
                requiredUbd: true,
                ubd: ubd
            }
        })
        .should(response => {
            const item = response.body.data.items
            const jmlItem = []
            item.forEach((it) => {
                if (it.sku === sku) {
                    jmlItem.push(it.sku)
                }
            })
            expect(jmlItem.length).to.equal(0)
            // const cekNull = []
            // item.forEach((it) => {
            //     if (null) {
            //         cekNull.push(null)
            //     }
            // })
            // expect(cekNull.length).to.equal(0)
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
            expect(response.status).to.equal(200)
            expect(response.body.statusCode).to.equal(200)
            expect(response.body.data).to.equal("Cart deleted")
        })
    })
    
})