let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let authorize = require('../../middlewares/authorize')
let uploadedFiles = require('../../middlewares/uploadedFiles')
let jobs = require('../../middlewares/jobs')
let datasets = require('../../middlewares/datasets')
let datafiles = require('../../middlewares/datafiles')
let excludeFieldsFromResponse = require('../../../commons/middlewares/excludeFieldsFromResponse')
let responses = require('../../middlewares/responses')

/**
* GET ${basePath_intra}/v1/datasets/:id/datafiles
* api route: list datafiles of a dataset with a given id
*/
router.route('/datasets/:id/datafiles')
  .get(
    excludeFieldsFromResponse(['dataset.datafiles.millesimes_info.columns.mapping', 'dataset.datafiles.millesimes_info.columns.type']),
    responses.datafiles
  )

/**
 * POST ${basePath_intra}/v1/datasets/:id/datafiles
 * api route: add datafile to a dataset with a given id
 */
router.route('/datasets/:id/datafiles')
  .post(
    datasets.checkNoCreateDatafileJobInQueue,
    validate.newDatafileInBody,
    uploadedFiles.get,
    authorize.checkUserOnUploadedFile,
    uploadedFiles.checkCsvWithoutWarning,
    jobs.create.addDatafile,
    responses.newJob
  )

/**
 * for all routes ${basepath_intra}/v1/datasets/:id/datafiles/:rid* :
 *  - validate datafile rid
 *  - get datafile and put in res.locals.datafile
 */
router.use('/datasets/:id/datafiles/:rid',
  validate.datafileRidInPath,
  datafiles.get
)

/**
 * GET ${basePath_intra}/v1/datasets/:id/datafiles/:rid
 * api route: get a datafile with a given rid
 */
router.route('/datasets/:id/datafiles/:rid')
  .get(
    excludeFieldsFromResponse(['datafile.millesimes_info.columns.mapping', 'datafile.millesimes_info.columns.type']),
    responses.datafile
  )

/**
  * GET ${basePath_intra}/v1/datasets/:id/datafiles/:rid/logs
  * api route: get logs history of a datafile
  */
router.route('/datasets/:id/datafiles/:rid/logs')
  .get(
    datafiles.logs,
    responses.logs
  )

/**
 * PUT ${basePath_intra}/v1/datasets/:id/datafiles/:rid/metadata
 * api route: update metadata of an datafile with a given rid
 */
router.route('/datasets/:id/datafiles/:rid/metadata')
  .put(
    validate.datafileMetadataInBody,
    datafiles.update.metadata,
    excludeFieldsFromResponse(['datafile.millesimes_info.columns.mapping', 'datafile.millesimes_info.columns.type']),
    responses.datafile
  )

/**
 * POST ${basePath_intra}/v1/datasets/:id/datafiles/:rid
 * api route: add new millesime of a datafile identified by dataset id and datafile rid
 */
router.route('/datasets/:id/datafiles/:rid')
  .post(
    datafiles.checkNoAddDatafileMillesimeJobInQueue,
    validate.tokenFileInBody,
    uploadedFiles.get,
    authorize.checkUserOnUploadedFile,
    uploadedFiles.checkCsvWithoutWarning,
    jobs.create.addDatafileMillesime,
    responses.newJob
  )

/**
 * DELETE ${basePath_intra}/v1/datasets/:id/datafiles/:rid
 * api route: delete a datafile identified by dataset id and datafile rid
 */
router.route('/datasets/:id/datafiles/:rid')
  .delete(
    datafiles.checkNoAddOrReplaceDatafileMillesimeJobInQueue,
    datafiles.delete,
    responses.deleted
  )

/**
 * for all routes ${basepath_intra}/v1/datasets/:id/datafiles/:rid/millesimes/:millesime :
 *  - validate millesime number
 *  - check millesime and put in res.locals.datafileMillesime
 */
router.use('/datasets/:id/datafiles/:rid/millesimes/:millesime',
  validate.datafileMillesimeInPath
)

/**
 * PUT ${basePath_intra}/v1/datasets/:id/datafiles/:rid/millesimes/:millesime
 * api route: replace millesime of a datafile identified by dataset id and datafile rid and millesime
 */
router.route('/datasets/:id/datafiles/:rid/millesimes/:millesime')
  .put(
    datafiles.checkNoReplaceDatafileMillesimeJobInQueue,
    validate.tokenFileInBody,
    uploadedFiles.get,
    authorize.checkUserOnUploadedFile,
    uploadedFiles.checkCsvWithoutWarning,
    jobs.create.replaceDatafileMillesime,
    responses.newJob
  )

/**
 * DELETE ${basePath_intra}/v1/datasets/:id/datafiles/:rid/millesimes/:millesime
 * api route: delete millesime of a datafile identified by dataset id and datafile rid and millesime
 */
router.route('/datasets/:id/datafiles/:rid/millesimes/:millesime')
  .delete(
    datafiles.checkNoAddOrReplaceDatafileMillesimeJobInQueue,
    datafiles.millesimes.delete,
    responses.deleted
  )

module.exports = router
