let express = require('express')
let router = require('express').Router({ strict: true })
let SwaggerUi = require ('swagger-ui-dist')
let querystring = require('../../../commons/middlewares/querystring')
let validate = require('../../middlewares/validate')
let datafiles = require('../../middlewares/datafiles')
let csv = require('../../middlewares/csv')
let rows = require('../../middlewares/rows')
let excludeFieldsFromResponse = require('../../../commons/middlewares/excludeFieldsFromResponse')
let responses = require('../../middlewares/responses')
let { v1: swaggerDatafileMillesimeDocument } = require('../../swaggerDocumentations/datafileMillesime')


/**
* GET ${basePath_inter}/v1/datafiles
* api route: get paginate list of datafiles
*/
router.route('/datafiles')
  .get(
    querystring.explodeCommas(['orderBy']),
    validate.datafilesPaginationInQuery,
    datafiles.paginate,
    excludeFieldsFromResponse(['pagination.data.millesimes.columns.mapping', 'pagination.data.millesimes.columns.type', 'pagination.data.millesimes.columns.unit']),
    responses.pagination
  )

/**
 * retrieve datafile millesime for all route ${basepath_inter}/v1/datafiles/:rid*
 *  - validate rid in path
 *  - validate millesime in query
 *  - get datafile millesime with mongo
 */
router.use('/datafiles/:rid',
  validate.datafileRidInPath,
  validate.datafileMillesimeInQuery,
  datafiles.millesimed
)

/**
 * GET ${ basePath_inter }/v1/datafiles/:rid/swagger.json
 * api route: api route: json of datafile millesime apidoc
 */
router.route('/datafiles/:rid/swagger.json')
  .get(
    (req, res, next) => res.json(swaggerDatafileMillesimeDocument(res.locals.datafileMillesimed))
  )

/**
* GET ${basePath_inter}/v1/datafiles/:rid
* api route: get millesime of a datafile
*/
router.route('/datafiles/:rid')
  .get(
    excludeFieldsFromResponse(['datafileMillesimed.columns.mapping', 'datafileMillesimed.columns.type', 'pagination.data.millesimes.columns.unit']),
    responses.datafileMillesimed
  )

/**
* GET ${basePath_intra}/v1/datafiles/:rid/rows
* api route: get paginated rows of a datafile with a given rid and given millesime (last if empty)
*/
router.route('/datafiles/:rid/rows')
  .get(
    querystring.explodeCommas(['orderBy','columns']),
    (req, res, next) => querystring.explodeColonsThenCommas(res.locals.datafileMillesimed.columns.map(column => column.name))(req, res, next),
    validate.rowsPaginationInQuery,
    rows.paginate,
    responses.pagination
  )
/**
* GET ${basePath_inter}/v1/datafiles/:rid/csv
* api route: get cvs of a millesime of a datafile
*/
router.route('/datafiles/:rid/csv')
  .get(
    querystring.explodeCommas(['orderBy','columns']),
    (req, res, next) => querystring.explodeColonsThenCommas(res.locals.datafileMillesimed.columns.map(column => column.name))(req, res, next),
    validate.csvOptionsInQuery,
    csv.stream
  )

/**
 * route ${basePath_inter}/v1/
 */
router.use('/datafiles/:rid/', express.static(SwaggerUi.absolutePath()))

module.exports = router
