const { defineConfig } = require("cypress");
const validateEnv = require("./utils/validate-env");
const { MongoClient } = require('mongodb');
require('dotenv').config();


// validateEnv()
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        async 'mongodb:findOne'({ uri, database, collection, query }) {
          const dbURL = process.env.MONGO_DB_URL
          const client = await MongoClient.connect(dbURL);
          const db = client.db(database);
          const result = await db.collection(collection).findOne(query);
          client.close();
          return result;
        },
      });
    },
    baseUrlProduct: process.env.BASEURLPRODUCT,
    baseUrlUser: process.env.BASEURLUSER,
    baseUrlPayment: process.env.BASEURLPAYMENT,
    baseUrlMP: process.env.BASEURLMP
  },
  env: {
    TOKEN_ADMIN: process.env.TOKEN_ADMIN,
    TOKEN_POS: process.env.TOKEN_POS,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    EMP_NIK: process.env.NIK_ARTOS,
    EMP_STORECODE: process.env.STORECODE_ARTOS,
    EMP_PIN: process.env.PIN_ARTOS,
    MP_KEY: process.env.MP_KEY,
    DB_MP: process.env.DB_MP,
    DB_COLLECTION_FORSTOKORDER: process.env.DB_COLLECTION_FORSTOKORDER,
    DB_PRODUCTS: process.env.DB_PRODUCTS,
    DB_COLLECTION_ORDERS: process.env.DB_COLLECTION_ORDERS,
    STORE_CODE_BXC: process.env.STORE_CODE_BXC,
    NIK_BXC: process.env.NIK_BXC,
    PIN_BXC: process.env.PIN_BXC,
    FIRST_NAME: process.env.FIRST_NAME,
    LAST_NAME: process.env.LAST_NAME,
    CARD_NUMBER: process.env.CARD_NUMBER
  }
});


// /products/v1/search-v2/product/search?keyword=&sort=name_asc&price_gt=0&price_lt=9999999&page=1&size=20