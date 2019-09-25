let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let nomenclatures = require('../../middlewares/nomenclatures')
let responses = require('../../middlewares/responses')

/**
 * GET ${basePath_intra}/v1/nomenclatures
 * api route: get the list of nomenclatures
 */
router.route('/nomenclatures')
  .get(
    nomenclatures.nomenclatures,
    responses.nomenclatures
  )
module.exports = router