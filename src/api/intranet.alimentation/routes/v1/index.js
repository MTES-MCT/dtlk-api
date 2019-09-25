let router = require('express').Router({ strict: true })

/**
 * ${basePath_intra}/v1/apidoc route
 * api route: get
 */
router.use(require('./apidoc'))

/**
 * ${basePath_intra}/v1/referentiels routes
 */
router.use(require('./referentiels'))

/**
 * ${basePath_intra}/v1/nomenclatures routes
 */
router.use(require('./nomenclatures'))
/**
 * ${basePath_intra}/v1/users routes
 */
router.use(require('./users'))

/**
 * ${basePath_intra}/v1/datasets routes
 */
router.use(require('./datasets'))

/**
 * ${basePath_intra}/v1/files routes
 */
router.use(require('./files'))

/**
 * ${basePath_intra}/v1/jobs routes
 */
router.use(require('./jobs'))

/**
 * ${basePath_intra}/v1/users routes
 */
router.use(require('./messages'))


module.exports = router
