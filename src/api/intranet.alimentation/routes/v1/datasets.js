let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let responses = require('../../middlewares/responses')
let datasets = require('../../middlewares/datasets')
let authenticate = require ('../../middlewares/authenticate')
let authorize = require ('../../middlewares/authorize')
let excludeFieldsFromResponse = require('../../../commons/middlewares/excludeFieldsFromResponse')

/**
 * check authentication for all routes ${basepath_intra}/v1/datasets*
 *  - validate apiKey in header
 *  - put authenticated user in res.locals.user
 */
router.use('/datasets',
  validate.apiKeyInHeader,
  authenticate.byApiKey
)
/**
* GET ${basePath_intra}/v1/datasets
* api route: get the list of the datasets of the organization
*/
router.route('/datasets')
  .get(
    datasets.my,
    excludeFieldsFromResponse(['datasets.datafiles.millesimes_info.columns.mapping', 'datasets.datafiles.millesimes_info.columns.type']),
    responses.datasets
  )
/**
 * GET ${basePath_intra}/v1/datasets/alerts
 * api route: get the list of the datasets of the organization
 */
router.route('/datasets/alerts')
  .get(
    datasets.my,
    datasets.alerts,
    excludeFieldsFromResponse(['datasets.datafiles.millesimes_info.columns.mapping', 'datasets.datafiles.millesimes_info.columns.type']),
    responses.datasetsInAlert
  )
/**
 * POST ${basePath_intra}/v1/datasets
 * api route: add a dataset
 */
router.route('/datasets')
  .post(
    validate.datasetInBody,
    authorize.checkUserOnOrganisation,
    datasets.create,
    responses.newDataset
  )
/**
  * for all routes ${basepath_intra}/v1/datasets/:id* :
  *  - validate dataset id and attachment rid
  *  - get dataset and put in res.locals.dataset
  *  - check authorization on dataset
  */
router.use('/datasets/:id',
  validate.datasetIdInPath,
  datasets.get,
  authorize.checkUserOnDataset
)
/**
  * GET ${basePath_intra}/v1/datasets/:id
  * api route: get a dataset with a given id
  */
router.route('/datasets/:id')
   .get(
     excludeFieldsFromResponse(['dataset.datafiles.millesimes_info.columns.mapping', 'dataset.datafiles.millesimes_info.columns.type']),
     responses.dataset
   )
/**
  * GET ${basePath_intra}/v1/datasets/:id/logs
  * api route: get logs history of a dataset with a given id
  */
router.route('/datasets/:id/logs')
   .get(
     datasets.logs,
     responses.logs
   )
 /**
  * PUT ${basePath_intra}/v1/datasets/:id
  * api route: update a dataset with a given id
  */
router.route('/datasets/:id')
   .put(
     validate.datasetInBody,
     authorize.checkUserOnOrganisation,
     datasets.update,
     excludeFieldsFromResponse(['dataset.datafiles.millesimes_info.columns.mapping', 'dataset.datafiles.millesimes_info.columns.type']),
     responses.dataset
   )
 /**
  * DELETE ${basePath_intra}/v1/datasets/:id
  * api route: delete a dataset identified by id
  */
router.route('/datasets/:id')
   .delete(
     datasets.checkNoDatafileJobInQueue,
     datasets.delete,
     responses.deleted
   )

/**
 * ${basePath_intra}/v1/datasets/:id/attachments routes
 */
router.use(require('./attachments'))

/**
 * ${basePath_intra}/v1/datasets/:id/datafiles routes
 */
router.use(require('./datafiles'))

module.exports = router
