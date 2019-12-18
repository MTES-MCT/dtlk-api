let queueService = require('../../../services/queue/service')
let mongoService = require('../../../services/mongodb/service')
let { toAlimentationApi: transformForApi } = require('../../../services/transform')
let { api: apiErrors } = require('../../../services/errors')
let moment = require('moment-timezone')

let middlewares = {
  get: async (req, res, next) => {
    try {
      let mongoJob = await mongoService.jobs.byRedisId(res.locals.jobId)
      if (mongoJob) {
        res.locals.job = transformForApi.mongo.jobs(mongoJob)
        return next()
      }
      let redisJob = await queueService.job.byId(res.locals.jobId)
      if (redisJob) {
        res.locals.job = transformForApi.kue.jobs(redisJob)
        return next()
      }
      next(new apiErrors.NotFoundError(`pas de tâche avec l'id ${ res.locals.jobId }`))
    }
    catch (error) {
      if (error.constructor.name === 'QueueJobNotFoundError') return next(new apiErrors.NotFoundError(`Pas de tâche avec l'id ${ res.locals.jobId }`))
      next(new apiErrors.ServerError(`Erreur pendant la récupération de la tâche`))
    }
  },
  my: async (req, res, next) => {
    try {
      let mongoJobs = transformForApi.mongo.jobs(await mongoService.jobs.byUser(res.locals.user.id))
      let redisJobs = transformForApi.kue.jobs(await queueService.datafileJobs.byUser(res.locals.user.id))
      res.locals.jobs = [...mongoJobs, ...redisJobs].sort((a, b) => a.id < b.id)
      next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant la récupération des tâches de l'utilisateur`))
    }
  },
  create: {
    addDatafile: async (req, res, next) => {
      try {
        let kueJob = await queueService.createDatafileJob.create(res.locals.user, res.locals.dataset, res.locals.millesime, res.locals.datafilePayload, res.locals.uploadedFile.file)
        await queueService.uploadedFileJob.remove(res.locals.uploadedFile.jobId)
        res.locals.newJob = transformForApi.kue.jobs(kueJob)
        next()
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur pendant la création de la tâche d'intégration du fichier de données sur le serveur`))
      }
    },
    addDatafileMillesime: async (req, res, next) => {
      try {
        let listmillesime = []
        res.locals.datafile.millesimes_info.forEach( millesime =>
          listmillesime.push(millesime.millesime)
        )
        if (listmillesime.includes(moment(res.locals.millesime).format('YYYY-MM'))){
          return next(new apiErrors.ServerError(`Erreur: Le millésime que vous souhaitez ajouter existe déjà`))
        }else{
          let kueJob = await queueService.addDatafileMillesimeJob.create(res.locals.user,res.locals.dataset,res.locals.millesime, res.locals.datafile, res.locals.uploadedFile.file, res.locals.dateDiffusion)
          await queueService.uploadedFileJob.remove(res.locals.uploadedFile.jobId)
          res.locals.newJob = transformForApi.kue.jobs(kueJob)
          return next()
        }
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur pendant la création de la tâche d'intégration du fichier de données sur le serveur`))
      }
    },
    replaceDatafileMillesime: async (req, res, next) => {
      try {
        let kueJob = await queueService.replaceDatafileMillesimeJob.create(res.locals.user, res.locals.dataset, res.locals.datafile, res.locals.datafileMillesime, res.locals.uploadedFile.file, res.locals.dateDiffusion)
        await queueService.uploadedFileJob.remove(res.locals.uploadedFile.jobId)
        res.locals.newJob = transformForApi.kue.jobs(kueJob)
        next()
      }
      catch (error) {
        next(new apiErrors.ServerError(`Erreur pendant la création de la tâche d'intégration du fichier de données sur le serveur`))
      }
    }
  }
}

module.exports = middlewares
