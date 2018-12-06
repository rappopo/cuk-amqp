'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const base = require('./base')(cuk)
  const { trace } = cuk.pkg.amqp

  return (conn, name, opts) => {
    opts = helper('core:merge')(opts || {}, { durable: false })

    const setupFunc = function (channel) {
      return channel.assertExchange(name, 'fanout', opts)
    }

    const wrapper = base(conn, name, setupFunc)

    wrapper.send = (msg, opts) => {
      trace('PUBSUB:SEND => %s -> %s', name, JSON.stringify(msg))
      return wrapper.sendToQueue(name, msg, opts)
    }

    return wrapper
  }
}
