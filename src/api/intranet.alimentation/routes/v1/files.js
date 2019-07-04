let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let uploadedFiles = require('../../middlewares/uploadedFiles')
let responses = require('../../middlewares/responses')
let authenticate = require ('../../middlewares/authenticate')
let authorize = require('../../middlewares/authorize')


/**
 * check authentication for all routes ${basepath_intra}/v1/files*
 *  - validate apiKey in header
 *  - put authenticated user in res.locals.user
 */
 router.use('/files',
   validate.apiKeyInHeader,
   authenticate.byApiKey
 )
/**
 * POST ${basePath_intra}/v1/files
 * api route: upload a file and return a token
 */
router.route('/files')
  .post(
    validate.uploadedFileNameInHeader,
    uploadedFiles.create,
    responses.newTokenFile
  )
/**
 * GET ${basePath_intra}/v1/files
 * api route: get list of files uploaded by a user and not deleted
 */
router.route('/files')
  .get(
    uploadedFiles.my,
    responses.uploadedFiles
  )
/**
 * for all routes ${basepath_intra}/v1/files/:tokenFile :
 *  - validate token of the uploaded file in path
 *  - get file of the token and put in res.locals.uploadedFile
 *  - check authorization on the uploadedFile
 */
router.use('/files/:tokenFile',
  validate.tokenFileInPath,
  uploadedFiles.get,
  authorize.checkUserOnUploadedFile
)
/**
 * GET ${basePath_intra}/v1/files/:token
 * api route: get info about an uploaded file identified by token
 */
router.route('/files/:tokenFile')
  .get(
    responses.uploadedFile
  )
/**
 * DELETE ${basePath_intra}/v1/files/:token
 * api route: delete an uploaded file identified by token
 */
router.route('/files/:tokenFile')
  .delete(
    uploadedFiles.delete,
    responses.deleted
  )
/**
 * GET ${basePath_intra}/v1/files/:tokenFile/checkcsv
 * api route: check validity of a csv file
 */
router.route('/files/:tokenFile/checkcsv')
  .get(
    uploadedFiles.checkCsvWithWarnings,
    responses.checkCsvResult
  )

module.exports = router
