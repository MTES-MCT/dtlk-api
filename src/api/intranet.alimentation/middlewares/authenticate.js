let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let { toAlimentationApi: transform } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')

module.exports = {
  byApiKey: async (req, res, next) => {
    try {
      res.locals.user = transform.udata.users(await udataApi.users.me(res.locals.apiKey))
      next()
    } catch (error) {
      if (error.constructor.name === 'UdataNotFoundError') return next(new apiErrors.UnauthorizedError(`Pas d'utilisateur avec l'apikey' ${ res.locals.apiKey }`))
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  byCredentials: async (req, res, next) => {
    try {
      res.locals.apiKey = await mongoService.users.checkCredentials(res.locals.credentialsPayload)
      next()
    } catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Impossible de vous authentifier avec les identifiants fournis`))
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}
