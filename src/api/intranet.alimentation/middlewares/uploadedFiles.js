let uploadedFilesService = require('../../../services/uploadedFiles')
let queueService = require('../../../services/queue/service')
let { uploadedFiles: { maxAttachmentSize: maxAttachmentSize } } = require('../../../env')
let { api: apiErrors } = require('../../../services/errors')

let middlewares = {
  create: async (req, res, next) => {
    try {
      res.locals.tokenFile = await uploadedFilesService.create(req.body)
      let jobOfFile = await queueService.uploadedFileJob.create(res.locals.apiKey, res.locals.tokenFile, res.locals.uploadedFileName)
      res.locals.uploadedFile = { ...jobOfFile.data, jobId: jobOfFile.id }
      return next()
    } catch (error)  {
      next(new apiErrors.ServerError(`Erreur pendant l'écriture du fichier sur le serveur`))
    }
  },
  my: async (req, res, next) => {
    try {
      res.locals.uploadedFiles = await queueService.uploadedFileJob.byApiKey(res.locals.apiKey)
      return next()
    } catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant la recherche de fichiers d'un utilisateur sur le serveur`))
    }
  },
  get: async (req, res, next) => {
    try {
      let jobOfFile = await queueService.uploadedFileJob.byToken(res.locals.tokenFile)
      res.locals.uploadedFile = { ...jobOfFile.data, jobId: jobOfFile.id, secondsBeforeDeletion: Number.parseInt((jobOfFile.promote_at - Date.now()) / 1000) }
      return next()
    } catch (error)  {
      next(new apiErrors.NotFoundError(`Impossible de trouver un fichier avec le token ${ res.locals.tokenFile }`))
    }
  },
  delete: async (req, res, next) => {
    try {
      await uploadedFilesService.delete(res.locals.uploadedFile.file.token)
      try {
        queueService.uploadedFileJob.remove(res.locals.uploadedFile.jobId)
      }
      catch (error) {
        console.error(`uploadedFileJob Job not removed for file ${ res.locals.tokenFile }`, error)
      }
      return next()
    } catch (error)  {
      next(new apiErrors.ServerError(`Erreur pendant la suppression du fichier sur le serveur`))
    }
  },
  checkCsvWithWarnings: async (req, res, next) => {
    try {
      res.locals.checkCsvResult = await uploadedFilesService.csv.check(res.locals.uploadedFile.file.token, true)
      next()
    }
    catch (error)  {
      next(new apiErrors.ServerError(`Erreur pendant le contrôle du fichier`))
    }
  },
  checkCsvWithoutWarning: async (req, res, next) => {
    try {
      res.locals.checkCsvResult = await uploadedFilesService.csv.check(res.locals.uploadedFile.file.token, false)
      if (res.locals.checkCsvResult.result === 'invalid') {
        return next(new apiErrors.ValidationError(`Le fichier csv n'est pas valide`))
      }
      next()
    }
    catch (error)  {
      next(new apiErrors.ServerError(`Erreur pendant le contrôle du fichier`))
    }
  },
  checkAttachmentSize: async (req, res, next) => {
    try {
      let size = await uploadedFilesService.size(res.locals.uploadedFile.file.token)
      if (size > maxAttachmentSize.value) {
        return next(new apiErrors.ValidationError(`La taille du fichier est supérieure à la taille maximale autorisée (${ maxAttachmentSize.display }).`))
      }
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur pendant le contrôle de la taille du fichier`))
    }
  }
}

module.exports = middlewares
