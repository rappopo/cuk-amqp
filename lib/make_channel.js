'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib
  const trace = cuk.pkg.amqp.trace

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating channel...')
    helper('core:bootFlat')({
      pkgId: 'amqp',
      name: 'channel',
      ext: helper('core:configFileExt')(),
      action: opt => {
        const ext = path.extname(opt.file)
        helper('core:configLoad')(opt.dir, path.basename(opt.file, ext))
          .then(result => {
            const name = `${opt.pkg.id}:${opt.key}`
            const conn = helper('amqp:getConnector')(result.connector)
            if (!conn) throw helper('core:makeError')(`Unknown connector ("${result.connector}")`)
            let ch
            switch (result.type) {
              case 'producer':
                switch (result.method) {
                  case 'worker':
                    ch = helper('amqp:initWorkerProducer')(conn, result.queueName || name, result.opts)
                    break
                  case 'pubsub':
                    ch = helper('amqp:initPubsubProducer')(conn, result.queueName || name, result.opts)
                    break
                }
                break
              case 'consumer':
                switch (result.method) {
                  case 'worker':
                    ch = helper('amqp:initWorkerConsumer')(conn, result.queueName || name, result.handler, result.opts)
                    break
                  case 'pubsub':
                    ch = helper('amqp:initPubsubConsumer')(conn, result.queueName || name, result.handler, result.opts)
                    break
                  case 'rpc':
                    ch = helper('amqp:initRpcConsumer')(conn, result.queueName || name, result.handler, result.opts)
                    break
                }
            }
            if (!ch) return
            _.set(opt.pkg, 'cuks.amqp.channel.' + opt.key, ch)
            ch.on('connect', () => {
              trace(`EVENT:CHAN => ${name} -> connected/reconnected`)
            })
            ch.on('close', () => {
              trace(`EVENT:CHAN => ${name} -> closed`)
            })
            ch.on('error', err => {
              trace(`EVENT:CHAN => ${name} -> error: ${err.message}`)
            })
            if (result.queueName) {
              helper('core:trace')('|  |  |- %s:%s (%s, %s) => %s', opt.pkg.id, opt.key, result.type, result.method, result.queueName)
            } else {
              helper('core:trace')('|  |  |- %s:%s (%s, %s)', opt.pkg.id, opt.key, result.type, result.method)
            }
          })
      }
    })
    resolve(true)
  })
}
