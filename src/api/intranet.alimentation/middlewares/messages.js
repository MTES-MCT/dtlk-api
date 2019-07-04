let mongoService = require('../../../services/mongodb/service')
let { toAlimentationApi: transformForApi } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')

let middlewares = {
  get: async (req, res, next) => {
    try {
      res.locals.message = transformForApi.mongo.messages(await mongoService.messages.get(res.locals.messageId))
      return next()
    }
    catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Pas de message avec l'id ${ res.locals.messageId }`))
      next(new apiErrors.ServerError(`Erreur pendant la récupération d'un message`))
    }
  },
  my: async (req, res, next) => {
    try {
      res.locals.messages = transformForApi.mongo.messages(await mongoService.messages.byOwner(res.locals.user.id))
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant la récupération des messages d'un utilisateur`))
    }
  },
  update: async (req, res, next) => {
    try {
      res.locals.message = transformForApi.mongo.messages(await mongoService.messages.update(res.locals.messageId, res.locals.messagePayload))
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant la mise-à-jour d'un message`))
    }
  },
  delete: async (req, res, next) => {
    try {
      await mongoService.messages.delete(res.locals.messageId)
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant la suppression d'un message`))
    }
  }
}

module.exports = middlewares
