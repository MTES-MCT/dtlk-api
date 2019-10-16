const httpStatus = require('http-status')

module.exports = {
  deleted: async (req, res, next) => {
    try {
      res.status(httpStatus.NO_CONTENT)
      res.end()
    }
    catch (error) { next(error) }
  },
  licenses: async (req, res, next) => {
    try { res.json(res.locals.licenses) }
    catch (error) { next(error) }
  },
  topics: (req, res, next) => {
    try { res.json(res.locals.topics) }
    catch (error) { next(error) }
  },
  frequencies: (req, res, next) => {
    try { res.json(res.locals.frequencies) }
    catch (error) { next(error) }
  },
  tags: (req, res, next) => {
    try { res.json(res.locals.tags) }
    catch (error) { next(error) }
  },
  allTags: (req, res, next) => {
    try { res.json(res.locals.allTags) }
    catch (error) { next(error) }
  },
  granularities: (req, res, next) => {
    try { res.json(res.locals.granularities) }
    catch (error) { next(error) }
  },
  zones: (req, res, next) => {
    try { res.json(res.locals.zones) }
    catch (error) { next(error) }
  },
  zone: (req, res, next) => {
    try { res.json(res.locals.zone) }
    catch (error) { next(error) }
  },
  organizations: (req, res, next) => {
    try { res.json(res.locals.organizations) }
    catch (error) { next(error) }
  },
  me: (req, res, next) => {
    try { res.json(res.locals.user) }
    catch (error) { next(error) }
  },
  userInfo: (req, res, next) => {
    try {
      res.json({
        datasets: res.locals.datasets.length,
        alerts: res.locals.datasetsInAlert.length,
        jobs: res.locals.jobs.length,
        messages: {
          read: res.locals.messages.filter(message => message.read).length,
          unread: res.locals.messages.filter(message => !message.read).length
        }
      })
    }
    catch (error) { next(error) }
  },
  uploadedFiles: (req, res, next) => {
    try {
      res.json(res.locals.uploadedFiles.map(job => ({ ...job.data.file, secondsBeforeDeletion: Number.parseInt((job.promote_at - Date.now()) / 1000) })))
    }
    catch (error) { next(error) }
  },
  uploadedFile: (req, res, next) => {
    try {
      res.json({...res.locals.uploadedFile.file, secondsBeforeDeletion: res.locals.uploadedFile.secondsBeforeDeletion })
    }
    catch (error) { next(error) }
  },
  logs: (req, res, next) => {
    try { res.json(res.locals.logs) }
    catch (error) { next(error) }
  },
  datasets: (req, res, next) => {
    try { res.json(res.locals.datasets) }
    catch (error) { next(error) }
  },
  datasetsInAlert: (req, res, next) => {
    try { res.json(res.locals.datasetsInAlert) }
    catch (error) { next(error) }
  },
  newDataset: (req, res, next) => {
    try {
      res.status(httpStatus.CREATED)
      res.json(res.locals.dataset)
    }
    catch (error) { next(error) }
  },
  dataset: (req, res, next) => {
    try { res.json(res.locals.dataset) }
    catch (error) { next(error) }
  },
  newTokenFile: (req, res, next) => {
    try {
      res.status(httpStatus.CREATED)
      res.json({ tokenFile: res.locals.tokenFile })
    }
    catch (error) { next(error) }
  },
  checkCsvResult: (req, res, next) => {
    try { res.json(res.locals.checkCsvResult) }
    catch (error) { next(error) }
  },
  attachments: (req, res, next) => {
    try { res.json(res.locals.dataset.attachments) }
    catch (error) { next(error) }
  },
  newAttachment: (req, res, next) => {
    try {
      res.status(httpStatus.CREATED)
      res.json(res.locals.attachment)
    }
    catch (error) { next(error) }
  },
  attachment: (req, res, next) => {
    try { res.json(res.locals.attachment) }
    catch (error) { next(error) }
  },
  datafiles: (req, res, next) => {
    try { res.json(res.locals.dataset.datafiles) }
    catch (error) { next(error) }
  },
  newJob: (req, res, next) => {
    try {
      res.status(httpStatus.ACCEPTED)
      res.json(res.locals.newJob)
    }
    catch (error) { next(error) }
  },
  datafile: (req, res, next) => {
    try { res.json(res.locals.datafile) }
    catch (error) { next(error) }
  },
  jobs: (req, res, next) => {
    try { res.json(res.locals.jobs) }
    catch (error) { next(error) }
  },
  job: (req, res, next) => {
    try { res.json(res.locals.job) }
    catch (error) { next(error) }
  },
  messages: (req, res, next) => {
    try { res.json(res.locals.messages) }
    catch (error) { next(error) }
  },
  message: (req, res, next) => {
    try { res.json(res.locals.message) }
    catch (error) { next(error) }
  }
}
