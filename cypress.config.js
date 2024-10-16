const { defineConfig } = require("cypress");
const validateEnv = require("./utils/validate-env");
const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log('DBNAME from .env:', process.env.DB_MP);;

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
    baseUrlProduct: 'https://sit-products.tbsgroup.co.id/api/v1',
    baseUrlUser: 'https://sit-users.tbsgroup.co.id/api/v1',
    baseUrlPayment: 'https://sit-payments.tbsgroup.co.id/api/v1',
    baseUrlMP: 'https://sit-marketplaces.tbsgroup.co.id/api/v1/callback/create'
  },
  env: {
    TOKEN_ADMIN: process.env.TOKEN_ADMIN,
    TOKEN_POS: process.env.TOKEN_POS,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    STORE_CODE_BXC: process.env.STORE_CODE_BXC,
    NIK_BXC: process.env.NIK_BXC,
    NIK_STAFF: process.env.NIK_STAFF,
    STORE_CODE_STAFF: process.env.STORE_CODE_STAFF,
    PIN_STAFF: process.env.PIN_STAFF,
    PIN_BXC: process.env.PIN_BXC,
    EMP_NIK: process.env.EMP_NIK,
    EMP_NIK: process.env.EMP_NIK,
    EMP_STORECODE: process.env.EMP_STORECODE,
    EMP_PIN: process.env.EMP_PIN,
<<<<<<< HEAD
    MP_KEY: process.env.MP_KEY,
    DB_MP: process.env.DB_MP,
    DB_COLLECTION_FORSTOKORDER: process.env.DB_COLLECTION_FORSTOKORDER,
    DB_PRODUCTS: process.env.DB_PRODUCTS,
    DB_COLLECTION_ORDERS: process.env.DB_COLLECTION_ORDERS,
    ADM_USERNAME: process.env.ADM_USERNAME,
    ADM_PASSWORD: process.env.ADM_PASSWORD,
    STORE_CODE_BXC: process.env.STORE_CODE_BXC,
    NIK_BXC: process.env.NIK_BXC,
    PIN_BXC: process.env.PIN_BXC
=======
    baseUrlProduct: process.env.BASEURLPRODUCT,
    baseUrlUser: process.env.BASEURLUSER,
    baseUrlPayment: process.env.BASEURLPAYMENT,
    baseUrlMP: process.env.BASEURLMP
>>>>>>> 50209a3 (UBD_Requsition-New)
  }
});


// /products/v1/search-v2/product/search?keyword=&sort=name_asc&price_gt=0&price_lt=9999999&page=1&size=20