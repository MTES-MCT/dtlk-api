let express = require('express')
let router = require('express').Router({ strict: true })
let SwaggerUi = require ('swagger-ui-dist')
let { v1: swaggerGlobalDocument } = require('../../swaggerDocumentations/global')

/**
 * GET ${ basePath_inter }/v1/swagger.json
 * api route: api route: json of global apidoc
 */
router.route('/swagger.json')
  .get(
    (req, res, next) => res.json(swaggerGlobalDocument)
  )

/**
 * ${basePath_intra}/v1/referentiels routes
 */
router.use(require('./referentiels'))

/**
 * ${basePath_intra}/v1/nomenclatures routes
 */
router.use(require('./nomenclatures'))

/**
 * ${basePath_inter}/v1/datasets routes
 */
router.use(require('./datasets'))

/**
 * ${basePath_inter}/v1/datafiles routes
 */
router.use(require('./datafiles'))

/**
 * route ${basePath_inter}/v1/
 */
router.use('/', express.static(SwaggerUi.absolutePath()))

module.exports = router
