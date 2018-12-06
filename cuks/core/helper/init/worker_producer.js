'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const { trace } = cuk.pkg.amqp
  const base = require('./base')(cuk)

  return (conn, name, opts) => {
    opts = helper('core:merge')(opts || {}, { durable: true })

    const setupFunc = function (channel) {
      return channel.assertQueue(name, opts)
    }

    const wrapper = base(conn, name, setupFunc)

    wrapper.send = (msg, opts) => {
      trace('WORKER:SEND => %s -> %s', name, JSON.stringify(msg))
      return wrapper.sendToQueue(name, msg, opts)
    }

    return wrapper
  }
}
