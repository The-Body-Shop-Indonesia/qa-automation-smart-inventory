const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://sit-products.tbsgroup.co.id/api/v1'
  },
});


// /products/v1/search-v2/product/search?keyword=&sort=name_asc&price_gt=0&price_lt=9999999&page=1&size=20