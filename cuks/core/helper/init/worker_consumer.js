'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const base = require('./base')(cuk)

  return (conn, name, handler, opts) => {
    opts = opts || {}
    opts.assertQueue = helper('core:merge')(opts.assertQueue || {}, { durable: true })
    opts.consume = helper('core:merge')(opts.consume || {}, { noAck: false })

    const setupFunc = function (channel) {
      const fn = handler({ conn: conn, channel: channel })
      return Promise.all([
        channel.assertQueue(name, opts.assertQueue),
        channel.prefetch(1),
        channel.consume(name, fn, opts.consume)
      ])
    }

    return base(conn, name, setupFunc)
  }
}
