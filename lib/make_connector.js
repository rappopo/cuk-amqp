'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

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
            result.pkgId = opt.pkg.id
            result.name = opt.key
            if (result.redirectTo) {
              helper('core:trace')('|  |  |- %s:%s => %s', opt.pkg.id, opt.key, result.redirectTo)
              return
            }
            const conn = helper('amqp:connect')(result)
            conn.initOpts = _.cloneDeep(result)
            _.set(opt.pkg, 'cuks.amqp.connector.' + opt.key, conn)
            helper('core:trace')('|  |  |- %s:%s ', opt.pkg.id, opt.key)
          })
      }
    })
    resolve(true)
  })
}
