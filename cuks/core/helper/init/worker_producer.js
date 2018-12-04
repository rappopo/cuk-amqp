'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const baseProducer = require('./base_producer')(cuk)

  return (conn, name, opts) => {
    opts = helper('core:merge')(opts || {}, { durable: true })

    const setupFunc = function (channel) {
      return channel.assertQueue(name, opts)
    }

    return baseProducer(conn, name, setupFunc)
  }
}
