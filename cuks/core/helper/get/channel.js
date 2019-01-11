'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return function (name) {
    let names = helper('core:nameSplit')(name, false, 'Invalid amqp channel (%s)')
    let conn = _.get(cuk.pkg[names[0]], `cuks.amqp.channel.${names[1]}`)
    if (!conn) return
    return conn
  }
}
