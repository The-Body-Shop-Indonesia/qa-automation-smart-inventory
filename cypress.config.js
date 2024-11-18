const { defineConfig } = require('cypress')
const { cloudPlugin } = require('cypress-cloud/plugin')
// const validateEnv = require('./utils/validate-env')
const { MongoClient } = require('mongodb')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
// Import Redis
const redis = require('redis')

// validateEnv()
module.exports = defineConfig({
  projectId: 'pprtz3',
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        async 'mongodb:findOne'({ uri, database, collection, query }) {
          const dbURL = process.env.MONGO_DB_URL
          const client = await MongoClient.connect(dbURL)
          const db = client.db(database)
          const result = await db.collection(collection).findOne(query)
          client.close()
          return result
        },
        readCounter() {
          const data = JSON.parse(
            fs.readFileSync(
              path.join(__dirname, 'cypress/fixtures/counter.json'),
              'utf-8'
            )
          )
          return data.counter
        },
        addStock({ key, amount }) {
          return new Promise((resolve, reject) => {
            const client = redis.createClient({
              url: process.env.BASEURLREDISDEV
            })

            client
              .connect()
              .then(() => {
                // Set nilai kunci 'key' menjadi amount (mengabaikan nilai sebelumnya)
                return client.set(key, amount)
              })
              .then(() => {
                // Mengambil nilai stok yang telah diset
                return client.get(key)
              })
              .then((newStock) => {
                client.quit()
                resolve(newStock) // Kembalikan hasil stok baru
              })
              .catch((error) => {
                client.quit()
                reject(error) // Tangani error jika ada
              })
          })
        },

        incrementCounter() {
          const filePath = path.join(__dirname, 'cypress/fixtures/counter.json')
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          data.counter += 1
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
          return data.counter
        }
      })

      return cloudPlugin(on, config)
    },

    taskTimeout: 10000,
    baseUrlProduct: process.env.BASEURLPRODUCT,
    baseUrlUser: process.env.BASEURLUSER,
    baseUrlPayment: process.env.BASEURLPAYMENT,
    baseUrlMP: process.env.BASEURLMP,
    REDEEM_URL: process.env.REDEEM_URL
  },

  env: {
    TOKEN_ADMIN: process.env.TOKEN_ADMIN,
    TOKEN_POS: process.env.TOKEN_POS,
    TOKEN_CUSTOMER: process.env.TOKEN_CUSTOMER,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    STORE_CODE_BXC: process.env.STORE_CODE_BXC,
    NIK_BXC: process.env.NIK_BXC,
    NIK_STAFF: process.env.NIK_STAFF,
    STORE_CODE_STAFF: process.env.STORE_CODE_STAFF,
    PIN_STAFF: process.env.PIN_STAFF,
    PIN_BXC: process.env.PIN_BXC,
    EMP_NIK: process.env.NIK_ARTOS,
    EMP_STORECODE: process.env.STORECODE_ARTOS,
    EMP_PIN: process.env.PIN_ARTOS,
    MP_KEY: process.env.MP_KEY,
    DB_MP: process.env.DB_MP,
    DB_COLLECTION_FORSTOKORDER: process.env.DB_COLLECTION_FORSTOKORDER,
    DB_COLLECTION_FORSTOKERROR: process.env.DB_COLLECTION_FORSTOKERROR,
    DB_PRODUCTS: process.env.DB_PRODUCTS,
    DB_COLLECTION_ORDERS: process.env.DB_COLLECTION_ORDERS,
    STORE_CODE_BXC: process.env.STORE_CODE_BXC,
    NIK_BXC: process.env.NIK_BXC,
    PIN_BXC: process.env.PIN_BXC,
    FIRST_NAME: process.env.FIRST_NAME,
    LAST_NAME: process.env.LAST_NAME,
    CARD_NUMBER: process.env.CARD_NUMBER,
    USER_EMAIL: process.env.USER_EMAIL,
    USER_OTP: process.env.USER_OTP,
    FIRSTNAME: process.env.FIRSTNAME,
    LASTNAME: process.env.LASTNAME,
    CARDNUMBER: process.env.CARDNUMBER,
    IDENTIFIER_SDC: process.env.IDENTIFIER,
    OTP_SDC: process.env.OTP,
    identifier_user: process.env.identifier_user,
    otp_user: process.env.otp_user,
    IDENTIFIER2_SDC: process.env.IDENTIFIER2,
    USER_EMAIL: process.env.USER_EMAIL,
    USER_OTP: process.env.USER_OTP,
    TOKEN_CUSTOMER_BOB: process.env.TOKEN_CUSTOMER_BOB
  }
})
