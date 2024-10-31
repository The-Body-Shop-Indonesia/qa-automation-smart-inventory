const fs = require('fs')
const path = require('path')

module.exports = (on, config) => {
  on('task', {
    readCounter() {
      // Membaca nilai counter dari file
      const data = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../fixtures/counter.json'),
          'utf-8'
        )
      )
      return data.counter
    },
    incrementCounter() {
      // Membaca nilai counter, menambah 1, lalu menyimpannya kembali
      const filePath = path.join(__dirname, '../fixtures/counter.json')
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      data.counter += 1
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return data.counter
    }
  })
}
