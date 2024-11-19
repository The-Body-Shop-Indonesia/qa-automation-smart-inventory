const crypto = require('crypto')

module.exports = (numOfChars) => {
  const randomString = crypto.randomBytes(numOfChars).toString('hex')
  return randomString
}
