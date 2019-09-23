let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let queueService = require('../../../services/queue/service')
let { api: apiErrors } = require('../../../services/errors')
let { toAlimentationApi: transformForApi, toUdata: transformForUdata } = require('../../../services/transform')

let middlewares = {
  my: async (req, res, next) => {
    try {
      res.locals.datasets = transformForApi.udata.datasets(await udataApi.datasets.my(res.locals.apiKey))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  alerts: (req, res, next) => {
    try {
      res.locals.datasetsInAlert = res.locals.datasets
        .filter(dataset => {
          if (!dataset.frequency_date) return false
          return ((new Date(dataset.frequency_date)).getTime() - (new Date()).getTime()) < (7 * 24 * 3600 * 1000)
        })
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  create: async (req, res, next) => {
    try {
      let udataDataset = await udataApi.datasets.new(res.locals.apiKey, transformForUdata.alimentationApi.dataset(res.locals.datasetPayload))
      res.locals.dataset = transformForApi.udata.datasets(udataDataset)
      mongoService.logs.dataset.create(res.locals.user, res.locals.dataset)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  get: async (req, res, next) => {
    try {
      let udataDataset = await udataApi.datasets.byId(res.locals.apiKey, res.locals.datasetId)
      res.locals.dataset = transformForApi.udata.datasets(udataDataset)
      next()
    }
    catch (error) {
      if (error.constructor.name === 'UdataNotFoundError') return next(new apiErrors.NotFoundError(`Pas de jeu de données avec l'id ${ res.locals.datasetId }`))
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  update: async (req, res, next) => {
    try {
      let udataDataset = await udataApi.datasets.update(res.locals.apiKey, res.locals.datasetId, transformForUdata.alimentationApi.dataset(res.locals.datasetPayload))
      res.locals.dataset = transformForApi.udata.datasets(udataDataset)
      mongoService.logs.dataset.update(res.locals.user, res.locals.dataset)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  delete: async (req, res, next) => {
    try {
      for (let datafile of res.locals.dataset.datafiles) await mongoService.datafiles.delete(datafile.rid, datafile.millesimes, datafile.millesimes_info)
      await udataApi.datasets.delete(res.locals.apiKey, res.locals.dataset.id)
      mongoService.logs.dataset.delete(res.locals.user, res.locals.dataset)
      mongoService.jobs.remove.ofDataset(res.locals.dataset.id)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  logs: async (req, res, next) => {
    try {
      res.locals.logs = transformForApi.mongo.logs(await mongoService.logs.dataset.get(res.locals.datasetId))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkNoCreateDatafileJobInQueue: async (req, res, next) => {
    try {
      if (await queueService.createDatafileJob.inQueueForDataset(res.locals.dataset)) return next(new apiErrors.BusinessRulesError(`Une tâche d'ajout de fichier de données dans ce jeu de données est actuellement en cours. Vous devez attendre qu'elle se termine.`))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkNoDatafileJobInQueue: async (req, res, next) => {
    try {
      if (await queueService.datafileJobs.inQueueForDataset(res.locals.dataset)) return next(new apiErrors.BusinessRulesError(`Une tâche d'ajout de fichier de données dans ce jeu de données est actuellement en cours. Vous devez attendre qu'elle se termine.`))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}

module.exports = middlewares
