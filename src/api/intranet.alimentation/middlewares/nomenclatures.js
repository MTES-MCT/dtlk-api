let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let { toAlimentationApi: transform } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')

module.exports = {
    nomenclatures: async (req, res, next) => {
        try {
          res.locals.nomenclatures = transform.mongo.nomenclatures(await mongoService.nomenclatures.list())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
      }

}