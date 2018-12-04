'use strict'

module.exports = function (cuk) {
  return new Promise((resolve, reject) => {
    require('./lib/make_connector')(cuk)
      .then(() => {
        return require('./lib/make_channel')(cuk)
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}
