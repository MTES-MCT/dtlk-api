
let mongoService = require('../../../services/mongodb/service')
let { toDiffusionApi: transform } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')
module.exports = {
    polluant_Eau: async (req, res, next) => {
        try {
          res.locals.polluant_Eau = transform.mongo.refPolluanteEau(await mongoService.referentiels.listPolluanteEau())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
    },
    port: async (req, res, next) => {
        try {
          res.locals.port = transform.mongo.refPort(await mongoService.referentiels.listPort())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
    },
    station_Air: async (req, res, next) => {
        try {
          res.locals.station_Air = transform.mongo.refStationAir(await mongoService.referentiels.listStationAir())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
    },
    station_Esu: async (req, res, next) => {
        try {
          res.locals.station_Esu = transform.mongo.refStationEsu(await mongoService.referentiels.listStationEsu())
          next()
        }
        catch (error) {
          next(new apiErrors.ServerError(`Erreur interne au serveur`))
        }
    },
}