let mongoService = require('../../../services/mongodb/service')
let { toDiffusionApi: transform } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')
module.exports = {
      bilanEnergie: async (req, res, next) => {
        try {
          res.locals.bilanEnergie = transform.mongo.bilanEnergie(await mongoService.nomenclatures.listBilanenergie())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
      },

      csl_filiere: async (req, res, next) => {
        try {
          res.locals.csl_filiere = transform.mongo.cslFiliere(await mongoService.nomenclatures.listCslFiliere())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
      },

      csl_operation: async (req, res, next) => {
        try {
          res.locals.csl_operation = transform.mongo.cslOperation(await mongoService.nomenclatures.listCslOperation())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
      }
}