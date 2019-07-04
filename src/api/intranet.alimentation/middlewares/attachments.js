let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let uploadedFilesService = require('../../../services/uploadedFiles')
let { api: apiErrors } = require('../../../services/errors')
let { toAlimentationApi: transformForApi, toUdata: transformForUdata } = require('../../../services/transform')

let middlewares = {
  get: async (req, res, next) => {
    try {
      res.locals.attachment = res.locals.dataset.attachments.find(attachment => attachment.rid === res.locals.attachmentRid)
      if(!res.locals.attachment) return next(new apiErrors.NotFoundError(`Impossible de trrouver un fichier descriptif avec le rid ${ res.locals.attachmentRid } dans le jeux de données ${ res.locals.dataset.id }`))
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  create: async (req, res, next) => {
    try {
      let file = { stream: uploadedFilesService.stream(res.locals.uploadedFile.file.token), name: res.locals.uploadedFile.file.name }
      let udataAttachment = await udataApi.attachments.new(res.locals.apiKey, res.locals.dataset.id, file, transformForUdata.alimentationApi.attachment(res.locals.attachmentPayload))
      res.locals.attachment = transformForApi.udata.attachments(udataAttachment)
      mongoService.logs.attachment.create(res.locals.user, res.locals.dataset, res.locals.attachment)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  update: {
    metadata: async (req, res, next) => {
      try {
        res.locals.attachmentPayload.rid = res.locals.attachmentRid
        let udataAttachment = await udataApi.attachments.update.metadata(res.locals.apiKey, res.locals.dataset.id, res.locals.attachmentRid, transformForUdata.alimentationApi.attachment(res.locals.attachmentPayload))
        res.locals.attachment = transformForApi.udata.attachments(udataAttachment)
        mongoService.logs.attachment.update.metadata(res.locals.user, res.locals.dataset, res.locals.attachment)
        next()
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur interne au serveur`))
      }
    },
    file: async (req, res, next) => {
      try {
        let file = { stream: uploadedFilesService.stream(res.locals.uploadedFile.file.token), name: res.locals.uploadedFile.file.name }
        let udataAttachment = await udataApi.attachments.update.file(res.locals.apiKey, res.locals.dataset.id, res.locals.attachmentRid, file, transformForUdata.alimentationApi.attachment(res.locals.attachment))
        res.locals.attachment = transformForApi.udata.attachments(udataAttachment)
        mongoService.logs.attachment.update.file(res.locals.user, res.locals.dataset, res.locals.attachment)
        return next()
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur interne au serveur`))
      }
    }
  },
  delete: async (req, res, next) => {
    try {
      await udataApi.attachments.delete(res.locals.apiKey, res.locals.dataset.id, res.locals.attachment.rid)
      mongoService.logs.attachment.delete(res.locals.user, res.locals.dataset, res.locals.attachment)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  logs: async (req, res, next) => {
    try {
      res.locals.logs = transformForApi.mongo.logs(await mongoService.logs.attachment.get(res.locals.datasetId, res.locals.attachmentRid))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}

module.exports = middlewares
