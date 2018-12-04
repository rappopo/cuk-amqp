'use strict'

module.exports = function (cuk) {
  return Promise.resolve({
    id: 'amqp',
    lib: {
      amqp: require('amqp-connection-manager'),
      amqplib: require('amqplib')
    }
  })
}
