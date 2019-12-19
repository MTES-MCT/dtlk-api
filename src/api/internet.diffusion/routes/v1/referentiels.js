let router = require('express').Router({ strict: true })
let referentiels = require('../../middlewares/referentiels')
let responses = require('../../middlewares/responses')


/**
 * GET ${basePath_intra}/v1/referentiels/polluant_Eau
 * api route: get the list of availables "referentiels" of "polluant_Eau"
 */
router.route('/referentiels/polluant_Eau')
  .get(
    referentiels.polluant_Eau,
    responses.polluant_Eau
  )
/**
 * GET ${basePath_intra}/v1/referentiels/port
 * api route: get the list of availables "referentiels" of "/port"
 */
router.route('/referentiels/port')
  .get(
    referentiels.port,
    responses.port
  )
/**
 * GET ${basePath_intra}/v1/referentiels/station_Air
 * api route: get the list of availables "referentiels" of "station_Air"
 */
router.route('/referentiels/station_Air')
  .get(
    referentiels.station_Air,
    responses.station_Air
  )
/**
 * GET ${basePath_intra}/v1/referentiels/station_Air
 * api route: get the list of availables "referentiels" of "station_Air"
 */
router.route('/referentiels/station_Esu')
  .get(
    referentiels.station_Esu,
    responses.station_Esu
  )

module.exports = router