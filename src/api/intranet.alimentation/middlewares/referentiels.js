let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let { toAlimentationApi: transform } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')

module.exports = {
  referentiels: async (req, res, next) => {
    try {
      res.locals.referentiels = transform.mongo.referentiels(await mongoService.referentiels.list())
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  licenses: async (req, res, next) => {
    try {
      res.locals.licenses = transform.udata.licenses(await udataApi.licenses.all())
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  topics: (req, res, next) => {
    try {
      res.locals.topics = require('../../../models/topics')
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  frequencies: (req, res, next) => {
    try {
      res.locals.frequencies = require('../../../models/frequencies')
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  granularities: (req, res, next) => {
    try {
      res.locals.granularities = require('../../../models/granularities')
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  searchTags: async (req, res, next) => {
    try {
      res.locals.tags = transform.mongo.tags(await mongoService.tags.search(res.locals.tagSearchTerm, res.locals.tagSearchResults === 'all' ? 0 : res.locals.tagSearchResults))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  searchAllTags: async (req, res, next) => {
    try {
      res.locals.allTags = transform.mongo.tags(await mongoService.tags.findAll())
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  searchZones: async (req, res, next) => {
    try {
      res.locals.zones = transform.udata.zones(await udataApi.zones.search(res.locals.zoneSearchTerm))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  zoneById: async (req, res, next) => {
    try {
      res.locals.zone = transform.udata.zones(await udataApi.zones.byId(res.locals.zoneId))
      next()
    }
    catch (error) {
      if (error.constructor.name === 'UdataNotFoundError') return next(new apiErrors.NotFoundError(`Pas de zone avec l'id ${ res.locals.zoneId }`))
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  organizations: async (req, res, next) => {
    try {
      res.locals.organizations = transform.udata.organizations(await udataApi.organizations.list())
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}
