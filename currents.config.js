require('dotenv').config()

module.exports = {
  projectId: 'icarus-cypress',
  recordKey: 'icarus',
  cloudServiceUrl: process.env.BASEURLCYPRESSCLOUD
}
