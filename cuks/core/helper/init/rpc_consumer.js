'use strict'

module.exports = function (cuk) {
  const { helper } = cuk.pkg.core.lib
  const base = require('./base')(cuk)
  const trace = cuk.pkg.amqp.trace

  return (conn, queueName, handler, opts) => {
    opts = opts || {}
    opts.assertQueue = helper('core:merge')(opts.assertQueue || {}, { durable: false })
    opts.consume = helper('core:merge')(opts.consume || {}, {})

    const setupFunc = function (channel) {
      const me = this
      const fn = handler({ conn: conn, channel: channel })
      const fnWrapper = msg => {
        trace('RPC:SERVER => %s >>> From: %s, JobID: %s', queueName, msg.properties.replyTo, msg.properties.correlationId)
        Promise.resolve(fn(msg))
          .then(result => {
            trace('RPC:SERVER => %s <<< To: %s, JobID: %s, Msg: %s', queueName, msg.properties.replyTo, msg.properties.correlationId, JSON.stringify(result))
            me.sendToQueue(msg.properties.replyTo, result, {
              correlationId: msg.properties.correlationId
            })
            me.ack(msg)
          })
          .catch(e => {
            throw e
          })
      }
      trace('RPC:SERVER => %s -> Awaiting request', queueName)
      return Promise.all([
        channel.assertQueue(queueName, opts.assertQueue),
        channel.prefetch(1),
        channel.consume(queueName, fnWrapper, opts.consume)
      ])
    }

    return base(conn, queueName, setupFunc)
  }
}
