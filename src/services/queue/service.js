let kue = require('kue')
let moment = require('moment-timezone')
let queue = require('./instance')
let { queue: errors } = require('../errors')
let { uploadedFiles: { maxRetentionTime: uploadedFilesMaxRetentionTime } } = require('../../env')

let handleError = (error, defaultError) => {
  if (error.constructor.name === 'QueueJobNotFoundError') {
   throw error
  }
  if (error.constructor.name === 'QueueJobRejectError') {
   throw error
  }
  if (error.constructor.name === 'QueueJobRemoveError') {
   throw error
  }
  if (error.constructor.name === 'QueueNotAvailableError') {
   throw error
  }
  if (error.constructor.name === 'QueueServerError') {
   throw error
  }
  throw new errors[defaultError.type](defaultError.message)
}

let queueAvailable = async () => {
  await require('../../utils/pause')(1000)
  if (!queue.client || !queue.client.status || (queue.client.status != 'ready'))  return false
  return true
}
// return empty Array if error
let getDatafileSubJobs = async (parentJobId) => {
  return await new Promise((resolve, reject) => {
    kue.Job.range(0, -1, 'desc', (err, jobs) => resolve(err ? [] : jobs.filter(job => job.data.parentJobId && (job.data.parentJobId === parentJobId))))
  })
}


let service = {
  job: {
    add: async (jobType, removeOnComplete, jobData, jobDelay) => {
      try {
        // Check if queue is available
        if (await queueAvailable() == false) {
          throw new errors.NotAvailableError(`La file de traitement n'est pas disponible`)
        }

        let job = await queue.create(jobType, jobData)
        job.delay(jobDelay || 3000)

        job.removeOnComplete(removeOnComplete)

        return await new Promise((resolve, reject) => {
          job.save( async (err) => {
            if (err) reject(new errors.JobRejectError(`La tâche ${ jobType } n'a pas été acceptée dans la file de traitement`))
            resolve(job)
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: ajout Job` })
      }
    },
    remove: async (id) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.remove(id, err => {
            if (err) {
              reject(new errors.JobRemoveError(`Erreur de suppression de la tâche avec l'id ${ id }`))
            }
            else {
              resolve()
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression Job` })
      }
    },
    byId: async (id) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.get(id, (err, job) => {
            if (err) {
              reject(new errors.JobNotFoundError(`Pas de tâche avec l'id ${ id }`))
            } else {
              resolve(job)
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job par id` })
      }
    }
  },
  uploadedFileJob: {
    create: async (apiKey, tokenFile, nameFile) => {
      let data = {
        title: `Job uploadedFile for file with token ${ tokenFile } `,
        file: { name: nameFile, token: tokenFile },
        user: { apiKey: apiKey }
      }
      return await service.job.add('uploadedFile', true, data, uploadedFilesMaxRetentionTime)
    },
    byToken: async (tokenFile) => {
      try {
        return await new Promise((resolve, reject) => {
          queue.delayed(async (err, ids) => {
            for (let id of ids) {
              let job = await service.job.byId(id)
              if (job && (job.data.file.token === tokenFile)) {
                resolve(job)
              }
            }
            reject(new errors.JobNotFoundError(`Impossible de trouver un fichier avec le token donné`))
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job par token` })
      }
    },
    byApiKey: async (apiKey) => {
      try {
        let jobs = []
        return await new Promise((resolve, reject) => {
          queue.delayed(async (err, ids) => {
            for (let id of ids) {
              let job = await service.job.byId(id)
              if (job && (job.data.user.apiKey === apiKey)) {
                jobs.push(job)
              }
            }
            resolve(jobs)
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job par apiKey` })
      }
    },
    remove: async id => service.job.remove(id)
  },
  datafileSubJobs: {
    remove: async (parentJobId) => {
      try {
        let subJobs = await getDatafileSubJobs(parentJobId)
        return await Promise.all(subJobs.map(subJob => service.job.remove(subJob.id)))
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression Subjobs Fichier de données` })
      }
    }
  },
  sendMailJob: {
    create: async (user, content) => {
      let data = {
        title: `Job sendMail ${ content.subject } to ${ user.email } `,
        to: user,
        content: content
      }
      return await service.job.add('sendMail', true, data)
    }
  },
  datafileJobs: {
    byUser: async (userId) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job d'un utilisateur`))
            } else {
              resolve(jobs.filter(job => job.data.idUser === userId))
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job d'un utilisateur` })
      }
    },
    inQueueForDataset: async (dataset) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job Datafile pour un jeu de données`))
            } else {
              resolve(jobs.find(job => job.data.idDataset === dataset.id.toString()))
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job Datafile pour un jeu de données` })
      }
    },
    inQueueForDatafile: async (dataset, datafile) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job Datafile pour un fichier de données`))
            } else {
              resolve(jobs.find(job => (job.data.idDataset === dataset.id.toString()) && (job.data.ridDatafile === datafile.rid)) ? true : false)
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job Datafile pour un fichier de données` })
      }
    }
  },
  createDatafileJob: {
    create: async (user, dataset, millesime, datafilePayload, file) => {
      let data = {
        title: `Job createDatafile on dataset ${ dataset.id }`,
        tokenFile: file.token,
        nameFile: file.name,
        idDataset: dataset.id,
        idUser: user.id,
        millesimeDatafile: moment(millesime).format('YYYY-MM'),
        metadataDatafile: datafilePayload
      }
      return await service.job.add('createDatafile', false, data)
    },
    inQueueForDataset: async (dataset) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job de type createDatafile pour un jeu de données`))
            } else {
              resolve(jobs.find(job => (job.data.idDataset === dataset.id.toString()) && (job.type === 'createDatafile')) ? true : false)
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job de type createDatafile pour un jeu de données` })
      }
    }
  },
  addDatafileMillesimeJob: {
    create: async (user, dataset,millesime, datafile, file) => {
      let data = {
        title: `Job addDatafileMillesime on dataset ${ dataset.id } and datafile ${ datafile.rid }`,
        tokenFile: file.token,
        nameFile: file.name,
        idDataset: dataset.id,
        idUser: user.id,
        ridDatafile: datafile.rid,
        millesimeDatafile: moment(millesime).format('YYYY-MM')
      }
      return await service.job.add('addDatafileMillesime', false, data)
    },
    inQueueForDatafile: async (dataset, datafile) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job de type addDatafileMillesime pour un fichier de données`))
            } else {
              resolve(jobs.find(job => (job.data.idDataset === dataset.id.toString()) && (job.data.ridDatafile === datafile.rid) && (job.type === 'addDatafileMillesime')) ? true : false)
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job de type addDatafileMillesime pour un fichier de données` })
      }
    }
  },
  replaceDatafileMillesimeJob: {
    create: async (user, dataset, datafile, millesime, file) => {
      let data = {
        title: `Job replaceDatafileMillesime on dataset ${ dataset.id }, datafile ${ datafile.rid } and millesime ${ millesime }`,
        tokenFile: file.token,
        nameFile: file.name,
        idDataset: dataset.id,
        idUser: user.id,
        ridDatafile: datafile.rid,
        millesimeDatafile: millesime
      }
      return await service.job.add('replaceDatafileMillesime', false, data)
    },
    inQueueForDatafileMillesime: async (dataset, datafile, millesime) => {
      try {
        return await new Promise((resolve, reject) => {
          kue.Job.range(0, -1, 'asc', async (err, jobs) => {
            if (err) {
              reject(new errors.ServerError(`Erreur interne: Recherche Job de type replaceDatafileMillesime pour le millésime d'un fichier de données`))
            } else {
              resolve(jobs.find(job => (job.data.idDataset === dataset.id.toString()) && (job.data.ridDatafile === datafile.rid) && (job.data.millesimeDatafile === millesime) && (job.type === 'replaceDatafileMillesime')) ? true : false)
            }
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche Job de type replaceDatafileMillesime pour le millésime d'un fichier de données` })
      }
    }
  }
}

 module.exports = service
