'use strict'

module.exports = function (cuk) {
  const trace = cuk.pkg.core.trace

  return function (conn, name, setupFunc) {
    const wrapper = conn.createChannel({
      json: true,
      setup: setupFunc
    })

    wrapper.send = (msg, opts) => {
      trace('CHAN:SEND => %s -> %s', name, JSON.stringify(msg))
      return wrapper.sendToQueue(name, msg, opts)
    }

    return wrapper
  }
}
