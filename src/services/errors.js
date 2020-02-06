let nameMyErrorClass = errorName => ({ [errorName]: class extends Error {
  constructor (message, argObject = {}) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    for (let [key, value] of Object.entries(argObject)) this[key] = value
  }
} })[errorName]

module.exports = {
  uploadedFiles: {
    NotFoundError: nameMyErrorClass('UploadedFilesNotFoundError'),
    ServerError: nameMyErrorClass('UploadedFilesServerError')
  },
  queue: {
    JobRejectError: nameMyErrorClass('QueueJobRejectError'),
    NotAvailableError: nameMyErrorClass('QueueNotAvailableError'),
    ServerError: nameMyErrorClass('QueueServerError'),
    JobNotFoundError: nameMyErrorClass('QueueJobNotFoundError'),
    JobRemoveError: nameMyErrorClass('QueueJobRemoveError'),
    JobDatafileParseCsvError: nameMyErrorClass('QueueJobDatafileParseCsvError'),
    JobTokenFileNotFoundError: nameMyErrorClass('QueueJobTokenFileNotFoundError')

  },
  transform: {
    KueToMongoError: nameMyErrorClass('TransformKueToMongoError'),
    UdataToAlimentationApiError: nameMyErrorClass('UdataToAlimentationApiError'),
    MongoToAlimentationApiError: nameMyErrorClass('TransformMongoToAlimentationApiError'),
    KueToAlimentationApiError: nameMyErrorClass('TransformKueToAlimentationApiError'),
    AlimentationApiToUdataError: nameMyErrorClass('TransformAlimentationApiToUdataError'),
    MongoToDiffusionApiError: nameMyErrorClass('TransformMongoToDiffusionApiError')
  },
  udata: {
    NotFoundError: nameMyErrorClass('UdataNotFoundError'),
    ServerError: nameMyErrorClass('UdataServerError')
  },
  mailer: {
    SendMailError: nameMyErrorClass('MailerSendMailError')
  },
  api: {
    ValidationError: nameMyErrorClass('ApiValidationError'),
    NotFoundError: nameMyErrorClass('ApiNotFoundError'),
    UnauthorizedError: nameMyErrorClass('ApiUnauthorizedError'),
    ForbiddenError: nameMyErrorClass('ApiForbiddenError'),
    BusinessRulesError: nameMyErrorClass('ApiBusinessRulesError'),
    ServerError: nameMyErrorClass('ApiServerError')
  },
  mongo: {
    NotFoundError: nameMyErrorClass('MongoNotFoundError'),
    ServerError: nameMyErrorClass('MongoServerError')
  }
}
