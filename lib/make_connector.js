'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib
  const trace = cuk.pkg.amqp.trace

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating connector...')
    helper('core:bootFlat')({
      pkgId: 'amqp',
      name: 'connector',
      ext: helper('core:configFileExt')(),
      action: opt => {
        const ext = path.extname(opt.file)
        helper('core:configLoad')(opt.dir, path.basename(opt.file, ext))
          .then(result => {
            result = result || {}
            result.opts = result.opts || {}
            result.events = result.events || {}
            if (result.redirectTo) {
              helper('core:trace')('|  |  |- %s:%s => %s', opt.pkg.id, opt.key, result.redirectTo)
              return
            }
            const conn = helper('amqp:connect')(result.dsn, result.opts)
            conn.on('connect', () => {
              trace('Connector %s:%s connected', opt.pkg.id, opt.key)
              if (_.isFunction(result.events.onConnect))result.events.onConnect()
            })
            conn.on('disconnect', params => {
              trace('Connector %s:%s disconnected', opt.pkg.id, opt.key)
              if (_.isFunction(result.events.onDisconnect))result.events.onDisconnect(params)
            })
            _.set(opt.pkg, 'cuks.amqp.connector.' + opt.key, conn)
            helper('core:trace')('|  |  |- %s:%s ', opt.pkg.id, opt.key)
          })
      }
    })
    resolve(true)
  })
}
