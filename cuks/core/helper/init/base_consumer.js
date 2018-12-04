'use strict'

module.exports = function (cuk) {
  const trace = cuk.pkg.core.trace

  return function (conn, name, setupFunc) {
    const wrapper = conn.createChannel({
      json: true,
      setup: function (channel) {
        return setupFunc(channel)
      }
    })
    wrapper.send = (msg, opts) => {
      trace('Sending to %s', name)
      return wrapper.sendToQueue(name, msg, opts)
    }
    return wrapper
  }
}
