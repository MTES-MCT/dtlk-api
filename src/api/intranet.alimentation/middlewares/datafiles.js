let mongoService = require('../../../services/mongodb/service')
let udataApi = require('../../../services/udata/api')
let queueService = require('../../../services/queue/service')
let { api: apiErrors } = require('../../../services/errors')
let { toAlimentationApi: transformForApi, toUdata: transformForUdata } = require('../../../services/transform')

let middlewares = {
  get: async (req, res, next) => {
    try {
      res.locals.datafile = res.locals.dataset.datafiles.find(datafile => datafile.rid === res.locals.datafileRid)
      if(!res.locals.datafile) return next(new apiErrors.NotFoundError(`Impossible de trrouver un fichier de données avec le rid ${ res.locals.datafileRid } dans le jeux de données ${ res.locals.dataset.id }`))
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  update: {
    metadata: async (req, res, next) => {
      try {
        let { rid, millesimes, millesimes_info, url } = res.locals.datafile
        res.locals.datafilePayload = { ...res.locals.datafilePayload, rid, millesimes, millesimes_info, url }
        let udataDatafile = await udataApi.datafiles.update.metadata(res.locals.apiKey, res.locals.dataset.id, res.locals.datafileRid, transformForUdata.alimentationApi.datafile(res.locals.datafilePayload))
        res.locals.datafile = transformForApi.udata.datafiles(udataDatafile)
        mongoService.logs.datafile.update.metadata(res.locals.user, res.locals.dataset, res.locals.datafile)
        next()
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur interne au serveur`))
      }
    }
  },
  millesimes: {
    delete: async (req, res, next) => {
      try {
        if (res.locals.datafile.millesimes == 1) throw new apiErrors.BusinessRulesError(`Il n'y a qu'un millésime dans le fichier de données, vous ne pouvez pas le supprimer. Sinon vous pouvez supprimer entièrement le fichier de données`)
        mongoService.datafiles.millesime.delete(res.locals.datafileRid, res.locals.datafileMillesime)
        res.locals.datafile.millesimes_info = res.locals.datafile.millesimes_info.filter( millesime_info => millesime_info.millesime != res.locals.datafileMillesime)
        res.locals.datafile.millesimes = res.locals.datafile.millesimes - 1
        let udataDatafile = await udataApi.datafiles.update.metadata(res.locals.apiKey, res.locals.dataset.id, res.locals.datafileRid, transformForUdata.alimentationApi.datafile(res.locals.datafile))
        res.locals.datafile = transformForApi.udata.datafiles(udataDatafile)
        mongoService.logs.datafile.millesime.delete(res.locals.user, res.locals.dataset, res.locals.datafile, res.locals.datafileMillesime)
        mongoService.jobs.remove.ofDatafileMillesime(res.locals.datafile.rid, res.locals.datafileMillesime)
        return next()
      } catch (error) {
        next(error)
      }
    }
  },
  delete: async (req, res, next) => {
    try {
      await mongoService.datafiles.delete(res.locals.datafileRid, res.locals.datafile.millesimes, res.locals.datafile.millesimes_info)
      await udataApi.datafiles.delete(res.locals.apiKey, res.locals.dataset.id, res.locals.datafileRid)
      mongoService.logs.datafile.delete(res.locals.user, res.locals.dataset, res.locals.datafile)
      mongoService.jobs.remove.ofDatafile(res.locals.datafileRid)
      next()
    }
    catch (error) {
      next(error)
    }
  },
  logs: async (req, res, next) => {
    try {
      res.locals.logs = transformForApi.mongo.logs(await mongoService.logs.datafile.get(res.locals.datasetId, res.locals.datafileRid))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkNoAddDatafileMillesimeJobInQueue: async (req, res, next) => {
    try {
      if (await queueService.addDatafileMillesimeJob.inQueueForDatafile(res.locals.dataset, res.locals.datafile)) return next(new apiErrors.BusinessRulesError(`Une tâche d'ajout de millesime pour ce fichier de données est actuellement en cours. Vous devez attendre qu'elle se termine.`))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkNoReplaceDatafileMillesimeJobInQueue: async (req, res, next) => {
    try {
      if (await queueService.replaceDatafileMillesimeJob.inQueueForDatafileMillesime(res.locals.dataset, res.locals.datafile, res.locals.datafileMillesime)) return next(new apiErrors.BusinessRulesError(`Une tâche de remplacement de ce millesime du fichier de données est actuellement en cours. Vous devez attendre qu'elle se termine.`))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkNoAddOrReplaceDatafileMillesimeJobInQueue: async (req, res, next) => {
    try {
      if (await queueService.datafileJobs.inQueueForDatafile(res.locals.dataset, res.locals.datafile)) return next(new apiErrors.BusinessRulesError(`Une tâche pour ce fichier de données est actuellement en cours. Vous devez attendre qu'elle se termine.`))
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}

module.exports = middlewares
