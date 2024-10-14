const { defineConfig } = require("cypress");
const validateEnv = require("./utils/validate-env")
const { MongoClient } = require('mongodb');
require('dotenv').config()

// validateEnv()
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        async 'mongodb:findOne'({ uri, database, collection, query }) {
          const client = await MongoClient.connect('mongodb://tbsi-developer:VaVCrLxHD09u0121A3sd@mongo.development.tbsgroup.co.id:27017/tbs_be_products?authMechanism=SCRAM-SHA-256&authSource=admin');
          //const db = client.db('tbs_db_marketplaces');
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
  // env: {
  //   TOKEN_ADMIN: process.env.TOKEN_ADMIN,
  //   TOKEN_POS: process.env.TOKEN_POS
  // }
});


// /products/v1/search-v2/product/search?keyword=&sort=name_asc&price_gt=0&price_lt=9999999&page=1&size=20