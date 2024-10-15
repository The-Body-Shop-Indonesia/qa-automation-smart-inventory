const { defineConfig } = require("cypress");
const validateEnv = require("./utils/validate-env");
require('dotenv').config();

// validateEnv()
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrlProduct: 'https://sit-products.tbsgroup.co.id/api/v1',
    baseUrlUser: 'https://sit-users.tbsgroup.co.id/api/v1',
    baseUrlPayment: 'https://sit-payments.tbsgroup.co.id/api/v1'
  },
  env: {
    TOKEN_ADMIN: process.env.TOKEN_ADMIN,
    TOKEN_POS: process.env.TOKEN_POS,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    EMP_NIK: process.env.EMP_NIK,
    EMP_STORECODE: process.env.EMP_STORECODE,
    EMP_PIN: process.env.EMP_PIN
  }
});


// /products/v1/search-v2/product/search?keyword=&sort=name_asc&price_gt=0&price_lt=9999999&page=1&size=20