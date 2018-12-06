'use strict'

module.exports = function (cuk) {
  const { helper, _ } = cuk.pkg.core.lib
  const trace = cuk.pkg.amqp.trace
  const base = require('./base')(cuk)

  return (connSrc, queueName, handler, opts) => {
    if (!connSrc) throw new Error('Invalid AMQP connector')
    const qid = helper('core:makeId')()
    const relId = helper('core:makeId')()
    const initOpts = _.cloneDeep(connSrc.initOpts)
    initOpts.name += ':' + qid
    const conn = helper('amqp:connect')(initOpts)

    opts = opts || {}
    opts.assertQueue = helper('core:merge')(opts.assertQueue || {}, { exclusive: true })
    opts.consume = helper('core:merge')(opts.consume || {}, { noAck: true })

    const setupFunc = function (channel) {
      const fn = handler({ conn: conn, channel: channel })
      const fnWrapper = msg => {
        Promise.resolve(fn(msg))
          .then(result => {
            if (msg.properties.correlationId === relId) {
              trace('RPC:CLIENT => %s <<< Recv JobID: %s, Result: %s', queueName, relId, JSON.stringify(result))
              setTimeout(() => {
                conn.close()
                // should be done on conn.onClose but it doesn't exist yet
                trace('EVENT:CONN => %s:%s -> disconnected', initOpts.pkgId, initOpts.name)
              }, 500)
            }
          })
          .catch(err => {
            throw err
          })
      }
      return Promise.all([
        channel.assertQueue(qid, opts.assertQueue),
        channel.consume(qid, fnWrapper, opts.consume)
      ])
    }

    const wrapper = base(conn, queueName, setupFunc)

    wrapper.send = (msg, opts) => {
      opts = helper('core:merge')(opts || {}, {
        correlationId: relId,
        replyTo: qid
      })
      trace('RPC:CLIENT => %s >>> Send JobID: %s, Arg: %s', queueName, relId, JSON.stringify(msg))
      return wrapper.sendToQueue(queueName, msg, opts)
    }

    return wrapper
  }
}
