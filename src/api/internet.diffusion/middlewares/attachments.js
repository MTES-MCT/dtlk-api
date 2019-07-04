let mongoService = require('../../../services/mongodb/service')
let { api: apiErrors } = require('../../../services/errors')
let rp = require('request-promise')
let filenamify = require('filenamify')

module.exports = {
  sendFile: async (req, res, next) => {
    try {
      let mongoAttachment = await mongoService.attachments.byRid(res.locals.attachmentRid)
      let url = mongoAttachment.url
      let title = url.split('/').reverse()[0]
      let options = { url: url, method: 'GET' }
      rp(options).then(data => {
        res.set({ 'Content-Disposition': `attachment; filename="${ filenamify(title) }"` })
        res.send(data)
      })
    } catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Pas de fichier joint avec le rid ${ res.locals.attachmentRid }`))
      next(error)
    }
  }
}
