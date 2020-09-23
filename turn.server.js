const Turn = require('node-turn')
const server = new Turn({
  authMechanism: "none",
  debugLevel: "ALL"
})
server.start()
