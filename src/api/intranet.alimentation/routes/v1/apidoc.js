let express = require('express')
let router = require('express').Router({ strict: true })
let SwaggerUi = require ('swagger-ui-dist')
let { v1: swaggerDocument } = require('../../swaggerDocumentation')

/**
 * GET ${ basePath_inter }/v1/apidoc/swagger.json
 * api route: api route: json of apidoc
 */
router.route('/apidoc/swagger.json')
  .get(
    (req, res, next) => res.json(swaggerDocument)
  )
/**
 * route ${basePath_inter}/v1/apidoc/
 */
router.use('/apidoc/',
  express.static(SwaggerUi.absolutePath(), { index: 'apidoc-intra.html' })
)

module.exports = router
