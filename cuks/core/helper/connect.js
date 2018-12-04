'use strict'

module.exports = function (cuk) {
  const { amqp } = cuk.pkg.amqp.lib

  return function (dsn, opts) {
    opts = opts || {}
    const conn = amqp.connect(dsn, opts)
    return conn
  }
}
