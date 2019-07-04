let router = require('express').Router({ strict: true })
let querystring = require('../../../commons/middlewares/querystring')
let validate = require('../../middlewares/validate')
let datasets = require('../../middlewares/datasets')
let excludeFieldsFromResponse = require('../../../commons/middlewares/excludeFieldsFromResponse')
let responses = require('../../middlewares/responses')

/**
 * GET ${ basePath_inter }/v1/datasets
 * api route: api route: get paginate list of datasets
 */
router.route('/datasets')
  .get(
    querystring.explodeCommas(['orderBy','topics','tags','licenses','organizations']),
    validate.datasetsPaginationInQuery,
    datasets.paginate,
    excludeFieldsFromResponse(['pagination.data.datafiles.millesimes.columns.mapping', 'pagination.data.datafiles.millesimes.columns.type']),
    responses.pagination
  )

/**
 * GET ${ basePath_inter }/v1/datasets
 * api route: api route: get facets of datasets
 */
router.route('/datasets/facets')
  .get(
    validate.datasetsFacetFilterInQuery,
    datasets.facets,
    responses.datasetsFacets
  )

/**
 * GET ${ basePath_inter }/v1/datasets/:id
 * api route: get dataset by id
 */
router.route('/datasets/:id')
  .get(
    validate.datasetIdInPath,
    datasets.get,
    excludeFieldsFromResponse(['dataset.datafiles.millesimes.columns.mapping', 'dataset.datafiles.millesimes.columns.type']),
    responses.dataset
  )

module.exports = router
