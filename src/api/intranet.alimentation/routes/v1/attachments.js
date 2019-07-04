let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let authorize = require('../../middlewares/authorize')
let uploadedFiles = require('../../middlewares/uploadedFiles')
let attachments = require('../../middlewares/attachments')
let responses = require('../../middlewares/responses')

/**
* GET ${basePath_intra}/v1/datasets/:id/attachments
* api route: list attachments of a dataset with a given id
*/
router.route('/datasets/:id/attachments')
  .get(
    responses.attachments
  )

/**
 * POST ${basePath_intra}/v1/datasets/:id/attachments
 * api route: add attachment to a dataset with a given id
 */
router.route('/datasets/:id/attachments')
  .post(
    validate.newAttachmentInBody,
    uploadedFiles.get,
    authorize.checkUserOnUploadedFile,
    uploadedFiles.checkAttachmentSize,
    attachments.create,
    uploadedFiles.delete,
    responses.newAttachment
  )

/**
 * for all routes ${basepath_intra}/v1/datasets/:id/attachments/:rid* :
 *  - validate attachment rid
 *  - get attachment and put in res.locals.attachment
 */
router.use('/datasets/:id/attachments/:rid',
  validate.attachmentRidInPath,
  attachments.get
)

/**
 * GET ${basePath_intra}/v1/datasets/:id/attachments/:rid
 * api route: get an attachment with a given rid
 */
router.route('/datasets/:id/attachments/:rid')
  .get(
    responses.attachment
  )

/**
  * GET ${basePath_intra}/v1/datasets/:id/attachments/:rid/logs
  * api route: get logs history of an attachment
  */
router.route('/datasets/:id/attachments/:rid/logs')
   .get(
     attachments.logs,
     responses.logs
   )

/**
 * PUT ${basePath_intra}/v1/datasets/:id/attachments/:rid/metadata
 * api route: update metadata of an attachment with a given rid
 */
router.route('/datasets/:id/attachments/:rid/metadata')
  .put(
    validate.attachmentMetadataInBody,
    attachments.update.metadata,
    responses.attachment
  )

/**
 * PUT ${basePath_intra}/v1/datasets/:id/attachments/:rid/file
 * api route: update file of an attachment with a given rid
 */
router.route('/datasets/:id/attachments/:rid/file')
  .put(
    validate.tokenFileInBody,
    uploadedFiles.get,
    authorize.checkUserOnUploadedFile,
    uploadedFiles.checkAttachmentSize,
    attachments.update.file,
    uploadedFiles.delete,
    responses.attachment
  )

/**
 * DELETE ${basePath_intra}/v1/datasets/:id/attachments/:rid
 * api route: delete an attachment with a given rid
 */
router.route('/datasets/:id/attachments/:rid')
  .delete(
    attachments.delete,
    responses.deleted
  )

module.exports = router
