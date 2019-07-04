let { api: apiErrors } = require('../../../services/errors')

module.exports = {
  checkUserOnOrganisation: async (req, res, next) => {
    try {
      let authorized = res.locals.user.organizations.find(organization => organization.id === res.locals.datasetPayload.organization)
      if (!authorized) return next(new apiErrors.ForbiddenError(`Vous n'êtes pas membre de l'organisation avec l'id ${ res.locals.datasetPayload.organization }`))
      return next()
    }
    catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkUserOnDataset: async (req, res, next) => {
    try {
      let authorized = res.locals.user.organizations.find(organization => organization.id === res.locals.dataset.organization.id)
      if (!authorized) return next(new apiErrors.ForbiddenError(`Vous n'avez pas le droit d'accéder au dataset avec l'id ${ res.locals.dataset.id }`))
      return next()
    } catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkUserOnUploadedFile: async (req, res, next) => {
    try {
      let authorized = res.locals.apiKey === res.locals.uploadedFile.user.apiKey
      if (!authorized) return next(new apiErrors.ForbiddenError(`Vous n'avez pas le droit d'accéder' fichier avec le token ${ res.locals.tokenFile }`))
      return next()
    } catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkUserOnMessage: async (req, res, next) => {
    try {
      let authorized = res.locals.user.id === res.locals.message.owner.toString()
      if (!authorized) return next(new apiErrors.ForbiddenError(`Vous n'avez pas le droit de consulter le message avec l'id ${ res.locals.message.id }`))
      return next()
    } catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  },
  checkUserOnJob: async (req, res, next) => {
    try {
      let authorized = res.locals.user.id === res.locals.job.owner.toString()
      if (!authorized) return next(new apiErrors.ForbiddenError(`Vous n'avez pas le droit de consulter la tâche avec l'id ${ res.locals.job.id }`))
      return next()
    } catch (error) {
      next(new apiErrors.ServerError(`Erreur interne au serveur`))
    }
  }
}
