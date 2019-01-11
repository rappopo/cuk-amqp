'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return function (name, follow = true) {
    let names = helper('core:splitName')(name, false, 'Invalid amqp connector (%s)')
    let conn = _.get(cuk.pkg[names[0]], `cuks.amqp.connector.${names[1]}`)
    if (!conn) return
    if (follow && _.isString(conn)) conn = helper('amqp:getConnector')(conn, follow)
    return conn
  }
}
