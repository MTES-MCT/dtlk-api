let Joi = require('joi')
let { params, query, headers, body } = require('express-joi-validation')({ passError: true })
let topics  = require('../../../models/topics')
let frequencies  = require('../../../models/frequencies')
let granularities  = require('../../../models/granularities')
let udataApi = require('../../../services/udata/api')
let mongoService = require('../../../services/mongodb/service')
let { api: apiErrors } = require('../../../services/errors')

let tagSearch = {
  search: Joi.string().default('')
    .label('querystring.search')
    .error((errors) => { return { message: `Le champ "search" doit être une chaîne de caractère` } }),
  results: Joi.alternatives().try(Joi.number().integer().min(1), Joi.string().valid('all')).default(10)
    .label('querystring.results')
    .error((errors) => { return { message: `Le champ "results" doit être un entier supérieur à 1 ou la valeur littérale all` } })
}
let zoneSearchTerm = {
  search: Joi.string().required()
    .label('querystring.search')
    .error((errors) => { return { message: `Le champ "search" doit être une chaîne de caractère` } })
}
let zoneId = {
  id: Joi.string().required()
    .label('path.id')
    .error((errors) => { return { message: `Le champ "id" de l'url doit être rempli et correspondre à un identifiant geohisto` } })
}
let credentials = {
  'email': Joi.string().required()
    .label('body.email')
    .error((errors) => { return { message: `Le champ "email" doit être rempli avec une adresse électronique valide` } }),
  'password': Joi.string().required()
    .label('body.password')
    .error((errors) => { return { message: `Le champ "password" doit être rempli avec une chaîne de caractères` } })
}
let apiKey = {
  'x-api-key': Joi.string().required()
    .label('headers.x-api-key')
    .error((errors) => { throw new apiErrors.UnauthorizedError(`Action impossible: pas d'apiKey trouvée dans l'entête HTTP "x-api-key"`) })
}
let datasetMetadata = {
  title: Joi.string().required()
    .label('body.title')
    .error((errors) => { return { message: `Le champ "title" doit être rempli` } }),
  description: Joi.string().required()
    .label('body.description')
    .error((errors) => { return { message: `Le champ "description" doit être rempli` } }),
  organization: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    .label('body.organization')
    .error((errors) => { return { message: `Le champ "organization" doit être rempli et être au format des ObjectId mongo` } }),
  topic: Joi.string().required().valid(topics)
    .label('body.topic')
    .error((errors) => { return { message: `Le champ "topic" doit être rempli et faire partie des valeurs autorisées` } }),
  tags: Joi.array().items(Joi.string())
    .label('body.tags')
    .error((errors) => { return { message: `Le champ "tags" doit être un tableau de chaînes` } }),
  license: Joi.string().required()
    .label('body.license')
    .error((errors) => { return { message: `Le champ "license" doit être rempli` } }),
  frequency: Joi.string().required().valid(frequencies.map(frequency => frequency.id))
    .label('body.frequency')
    .error((errors) => { return { message: `Le champ "frequency" doit être rempli et faire partie des valeurs autorisées` } }),
  frequency_date: Joi.date().iso().when('frequency', { is: 'unknown', then: Joi.allow(null).optional(), otherwise: Joi.required() })
    .label('body.frequency_date')
    .error((errors) => { return { message: `Le champ "frequency_date" doit être une date valide (format ISO 8601). Il est obligatoire dès que le champ "frequency" n'a pas la valeur 'unknown'` } }),
  spatial: Joi.object({
    granularity: Joi.string().valid(granularities.map(granularity => granularity.id))
      .label('body.spatial.granularity')
      .error((errors) => { return { message: `Le champ "granularity" doit faire partie des valeurs autorisées` } }),
    zones: Joi.array().items(Joi.string())
      .label('body.spatial.zones')
      .error((errors) => { return { message: `Le champ "zones" doit être un tableau de chaînes` } })
  }).optional(),
  temporal_coverage: Joi.object({
    start: Joi.date().iso().required()
      .label('body.temporal_coverage.start')
      .error((errors) => { return { message: `Le champ "temporal_coverage.start" est requis, doit être une date valide (format ISO 8601)` } }),
    end: Joi.date().iso().min(Joi.ref('start')).required()
      .label('body.temporal_coverage.end')
      .error((errors) => { return { message: `Le champ "temporal_coverage.end" est requis et doit être une date valide (format ISO 8601) et doit être inférieur à "temporal_coverage.start"` } })
  }).optional(),
  caution: Joi.string().optional()
    .label('body.caution')
    .error((errors) => { return { message: `Le champ "caution" doit être une chaîne de caractères` } }),
}
let datasetId = {
  id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    .label('path.id')
    .error((errors) => { return { message: `Le champ "id" de l'url doit être rempli et être au format des ObjectId mongo` } })
}
let uploadedFileName = {
  'x-uploadedfile-name': Joi.string().required()
    .label('headers.x-uploadedfile-name')
    .error((errors) => { return { message: `L'entête HTTP "x-uploadedfile-name" doit être rempli avec le nom du fichier à téléverser` } })
}
let uploadedFileToken = {
  tokenFile: Joi.string().required().guid()
    .label('tokenFile')
    .error((errors) => { return { message: `Le champ "tokenFile" doit être rempli avec une chaîne correspondant à un identifant de fichier téléversé` } })
}
let attachmentMetadata = {
  title: Joi.string().required()
    .label('body.title')
    .error((errors) => { return { message: `Le champ "title" doit être rempli` } }),
  description: Joi.string().required()
    .label('body.description')
    .error((errors) => { return { message: `Le champ "description" doit être rempli` } }),
  published: Joi.date().iso().required()
    .label('body.published')
    .error((errors) => { return { message: `Le champ "published" doit être rempli avec une date valide (format ISO 8601)` } })
}
let resourceRid = {
  rid: Joi.string().required().guid()
    .label('path.rid')
    .error((errors) => { return { message: `Le champ "rid" de l'url doit être rempli et doit être au format guid` } })
}
let datafileMetadata = {
  title: Joi.string().required()
    .label('body.title')
    .error((errors) => { return { message: `Le champ "title" doit être rempli` } }),
  description: Joi.string().required()
    .label('body.description')
    .error((errors) => { return { message: `Le champ "description" doit être rempli` } }),
  published: Joi.date().iso().required()
    .label('body.published')
    .error((errors) => { return { message: `Le champ "published" doit être rempli avec une date valide (format ISO 8601)` } }),
  temporal_coverage_start: Joi.date().iso().optional()
    .label('body.temporal_coverage_start')
    .error((errors) => { return { message: `Le champ "temporal_coverage_start" doit être une date valide (format ISO 8601)` } }),
  temporal_coverage_end: Joi.when('temporal_coverage_start', { is: Joi.exist(), then: Joi.date().iso().min(Joi.ref('temporal_coverage_start')).required(), otherwise: Joi.forbidden() })
    .label('body.temporal_coverage_end')
    .error((errors) => { return { message: `Le champ "temporal_coverage_end" doit être une date valide (format ISO 8601) et doit être inférieur à "temporal_coverage_start"` } }),
  legal_notice: Joi.string().optional()
    .label('body.legal_notice')
    .error((errors) => { return { message: `Le champ "legal_notice" doit être une chaîne de caractères` } })
}
let datafileMillesime = {
  millesime: Joi.number().integer().required()
    .label('path.millesime')
    .error((errors) => { return { message: `Le champ "millesime" de l'url doit être un nombre entier` } })
}
let jobId = {
  id: Joi.number().integer().required()
    .label('path.id')
    .error((errors) => { return { message: `Le champ "id" de l'url doit être rempli avec un entier correspondant à l'identifiant de la tâche` } })
}
let messageId = {
  id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    .label('path.id')
    .error((errors) => { return { message: `Le champ "id" de l'url doit être rempli et être au format des ObjectId mongo` } })
}
let messageMetadata = {
  read: Joi.boolean().required()
    .label('body.read')
    .error((errors) => { return { message: `Le champ "read" doit être rempli` } })
}

module.exports = {
  tagSearchInQuery: [
    query(tagSearch),
    (req, res, next) => {
      res.locals.tagSearchTerm = req.query.search
      res.locals.tagSearchResults = req.query.results
      next()
    }
  ],
  zoneSearchTermInQuery: [
    query(zoneSearchTerm),
    (req, res, next) => {
      res.locals.zoneSearchTerm = req.query.search
      next()
    }
  ],
  zoneIdInPath: [
    params(zoneId),
    (req, res, next) => {
      res.locals.zoneId = req.params.id
      next()
    }
  ],
  credentialsInBody: [
    body(credentials),
    (req, res, next) => {
      res.locals.credentialsPayload = req.body
      next()
    }
  ],
  apiKeyInHeader: [
    headers(apiKey),
    (req, res, next) => {
      res.locals.apiKey = req.headers['x-api-key']
      next()
    }
  ],
  datasetInBody: [
    body(datasetMetadata),
    (req, res, next) => {
      res.locals.datasetPayload = req.body
      next()
    },
    async (req, res, next) => {
      try {
        if (!res.locals.datasetPayload.tags) return next()
        let tagsErrors = []
        for (let tag of res.locals.datasetPayload.tags) {
          if (! (await mongoService.tags.byValue(tag))) {
            tagsErrors.push(`${ tag } n'est pas un tag valide`)
          }
        }
        if (tagsErrors.length) {
          let validationError = new apiErrors.ValidationError('Erreur de validation')
          validationError.errors = tagsErrors
          return next(validationError)
        }
        next()
      } catch (error) {
        next(error)
      }
    },
    async (req, res, next) => {
      try {
        await udataApi.licenses.byId(res.locals.datasetPayload.license)
        next()
      } catch (udataApiError) {
        let validationError = new apiErrors.ValidationError('Erreur de validation')
        if (udataApiError.constructor.name === 'UdataServerError') validationError.errors = [`Erreur lors de la vérification de la licence`]
        if (udataApiError.constructor.name === 'UdataNotFoundError') validationError.errors = [`${ res.locals.datasetPayload.license } n'est pas une licence valide`]
        next(validationError)
      }
    },
    async (req, res, next) => {
      try {
        if (!res.locals.datasetPayload.spatial) return next()
        if (!res.locals.datasetPayload.spatial.zones) return next()
        let zonesErrors = []
        for (let zoneId of res.locals.datasetPayload.spatial.zones) {
          try { await udataApi.zones.byId(zoneId) }
          catch (udataApiError) {
            if (udataApiError.constructor.name === 'UdataServerError') zonesErrors.push(`Erreur lors de la vérification de la zone ${ zoneId }`)
            if (udataApiError.constructor.name === 'UdataNotFoundError') zonesErrors.push(`${ zoneId } n'est pas un identifiant de zone valide`)
          }
        }
        if (zonesErrors.length) {
          let validationError = new apiErrors.ValidationError('Erreur de validation')
          validationError.errors = zonesErrors
          return next(validationError)
        }
        next()
      } catch (error) {
        next(error)
      }
    }
  ],
  datasetIdInPath: [
    params(datasetId),
    (req, res, next) => {
      res.locals.datasetId = req.params.id
      next()
    }
  ],
  uploadedFileNameInHeader: [
    headers(uploadedFileName),
    (req, res, next) => {
      let re = /(?:\.([^.]+))?$/
      let ext = re.exec(req.headers['x-uploadedfile-name'])[1]
      let allowedExtensions = require('../../../env').uploadedFiles.allowedExtensions
      if (!allowedExtensions.includes(`.${ ext }`)) throw new apiErrors.ValidationError(`L'extension du fichier n'est pas autorisée`)
      next()
    },
    (req, res, next) => {
      res.locals.uploadedFileName = req.headers['x-uploadedfile-name']
      next()
    }
  ],
  tokenFileInPath: [
    params(uploadedFileToken),
    (req, res, next) => {
      res.locals.tokenFile = req.params.tokenFile
      next()
    }
  ],
  newAttachmentInBody: [
    body({ ...uploadedFileToken, ...attachmentMetadata }),
    (req, res, next) => {
      res.locals.attachmentPayload = req.body
      res.locals.tokenFile = req.body.tokenFile
      delete res.locals.attachmentPayload.tokenFile
      next()
    }
  ],
  attachmentRidInPath: [
    params(resourceRid, { joi: { allowUnknown: true }}),
    (req, res, next) => {
      res.locals.attachmentRid = req.params.rid
      next()
    }
  ],
  attachmentMetadataInBody: [
    body(attachmentMetadata),
    (req, res, next) => {
      res.locals.attachmentPayload = req.body
      next()
    }
  ],
  tokenFileInBody: [
    body(uploadedFileToken),
    (req, res, next) => {
      res.locals.tokenFile = req.body.tokenFile
      next()
    }
  ],
  newDatafileInBody: [
    body({ ...uploadedFileToken, ...datafileMetadata }),
    (req, res, next) => {
      res.locals.datafilePayload = req.body
      res.locals.tokenFile = req.body.tokenFile
      delete res.locals.datafilePayload.tokenFile
      next()
    }
  ],
  datafileRidInPath: [
    params(resourceRid, { joi: { allowUnknown: true }}),
    (req, res, next) => {
      res.locals.datafileRid = req.params.rid
      next()
    }
  ],
  datafileMetadataInBody: [
    body(datafileMetadata),
    (req, res, next) => {
      res.locals.datafilePayload = req.body
      next()
    }
  ],
  datafileMillesimeInPath: [
    params(datafileMillesime, { joi: { allowUnknown: true }}),
    (req, res, next) => {
      if (req.params.millesime > res.locals.datafile.millesimes) throw new apiErrors.NotFoundError(`Le millésime ${req.params.millesime} n'existe pas pour le fichier de données ${res.locals.datafile.rid}`)
      res.locals.datafileMillesime = req.params.millesime
      next()
    }
  ],
  jobIdInPath: [
    params(jobId),
    async (req, res, next) => {
      res.locals.jobId = req.params.id
      next()
    }
  ],
  messageIdInPath: [
    params(messageId),
    (req, res, next) => {
      res.locals.messageId = req.params.id
      next()
    }
  ],
  messageInBody: [
    body(messageMetadata),
    (req, res, next) => {
      res.locals.messagePayload = req.body
      next()
    }
  ]
}
