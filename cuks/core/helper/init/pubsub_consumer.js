'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const base = require('./base')(cuk)

  return (conn, name, handler, opts) => {
    opts = opts || {}
    opts.assertExchange = helper('core:merge')(opts.assertExchange || {}, { durable: false })
    opts.assertQueue = helper('core:merge')(opts.assertQueue || {}, { exclusive: true })
    opts.consume = helper('core:merge')(opts.consume || {}, { noAck: true })

    const queue = helper('core:makeId')()
    const setupFunc = (channel) => {
      const fn = handler({ conn: conn, channel: channel })
      return Promise.all([
        channel.assertExchange(name, 'fanout', opts.assertExchange),
        channel.assertQueue(queue, opts.assertQueue),
        channel.bindQueue(queue, name, ''),
        channel.consume(queue, fn, opts.consume)
      ])
    }

    return base(conn, name, setupFunc)
  }
}
