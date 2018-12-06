'use strict'

module.exports = function (cuk) {
  const { _ } = cuk.pkg.core.lib
  const { amqp } = cuk.pkg.amqp.lib
  const { trace } = cuk.pkg.amqp

  return function (params) {
    params = params || {}
    params.opts = params.opts || {}
    params.events = params.events || {}
    const conn = amqp.connect(params.dsn, params.opts)
    conn.on('connect', () => {
      trace('EVENT:CONN => %s:%s -> connected', params.pkgId, params.name)
      if (_.isFunction(params.events.onConnect)) params.events.onConnect()
    })
    conn.on('disconnect', args => {
      trace('EVENT:CONN => %s:%s -> disconnected', params.pkgId, params.name)
      if (_.isFunction(params.events.onDisconnect)) params.events.onDisconnect(args)
    })
    conn.on('blocked', args => {
      trace('EVENT:CONN => %s:%s -> blocked', params.pkgId, params.name)
      if (_.isFunction(params.events.onBlocked)) params.events.onBlocked(args)
    })
    conn.on('unblocked', () => {
      trace('EVENT:CONN => %s:%s -> unblocked', params.pkgId, params.name)
      if (_.isFunction(params.events.onUnblocked)) params.events.onUnblocked()
    })
    return conn
  }
}
