let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let referentiels = require('../../middlewares/referentiels')
let responses = require('../../middlewares/responses')

/**
 * GET ${basePath_intra}/v1/referentiels/licenses
 * api route: get the list of availables licenses
 */
router.route('/referentiels/licenses')
  .get(
    referentiels.licenses,
    responses.licenses
  )
/**
 * GET ${basePath_intra}/v1/referentiels/topics
 * api route: get the list of availables topics
 */
router.route('/referentiels/topics')
  .get(
    referentiels.topics,
    responses.topics
  )
/**
 * GET ${basePath_intra}/v1/referentiels/frequencies
 * api route: get the list of availables frequencies
 */
router.route('/referentiels/frequencies')
  .get(
    referentiels.frequencies,
    responses.frequencies
  )
/**
 * GET ${basePath_intra}/v1/referentiels/granularities
 * api route: get the list of availables granularities
 */
router.route('/referentiels/granularities')
  .get(
    referentiels.granularities,
    responses.granularities
  )
/**
 * GET ${basePath_intra}/v1/referentiels/tags
 * api route: get the list of tags containing a given term
 */
router.route('/referentiels/tags')
  .get(
    validate.tagSearchInQuery,
    referentiels.searchTags,
    responses.tags
  )
/**
 * GET ${basePath_intra}/v1/referentiels/tags
 * api route: get the list of tags
 */
router.route('/referentiels/alltags')
  .get(
    referentiels.searchAllTags,
    responses.allTags
  )
/**
 * GET ${basePath_intra}/v1/referentiels/zones
 * api route: get the list of zones with a suggest term
 */
router.route('/referentiels/zones')
  .get(
    validate.zoneSearchTermInQuery,
    referentiels.searchZones,
    responses.zones
  )
/**
 * GET ${basePath_intra}/v1/referentiels/zones/:id
 * api route: get a zone with an id
 */
router.route('/referentiels/zones/(:id)?')
  .get(
    validate.zoneIdInPath,
    referentiels.zoneById,
    responses.zone
  )
/**
 * GET ${basePath_intra}/v1/referentiels/organizations
 * api route: get the list of organizations
 */
router.route('/referentiels/organizations')
  .get(
    referentiels.organizations,
    responses.organizations
  )

module.exports = router
