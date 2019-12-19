let router = require('express').Router({ strict: true })
let nomenclatures = require('../../middlewares/nomenclatures')
let responses = require('../../middlewares/responses')

/**
 * GET ${basePath_intra}/v1/nomenclatures/bilanEnergie
 * api route: get the list of availables "nomenclatures" of "bilanEnergie"
 */
router.route('/nomenclatures/bilanEnergie')
  .get(
    nomenclatures.bilanEnergie,
    responses.bilanEnergie
  )

/**
 * GET ${basePath_intra}/v1/nomenclatures/csl_filiere
 * api route: get the list of availables "nomenclatures" of "csl_filiere"
 */
router.route('/nomenclatures/csl_filiere')
.get(
  nomenclatures.csl_filiere,
  responses.csl_filiere
)

/**
 * GET ${basePath_intra}/v1/nomenclatures/csl_operation
 * api route: get the list of availables "nomenclatures" of "csl_operation"
 */
router.route('/nomenclatures/csl_operation')
.get(
  nomenclatures.csl_operation,
  responses.csl_operation
)

module.exports = router