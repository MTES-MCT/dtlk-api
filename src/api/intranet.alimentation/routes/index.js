let express = require('express')
let v1Routes = require('./v1')

let router = express.Router({ strict: true })

/**
 * GET ${basePath_intra}/status
 */
router.get('/status', (req, res) => res.send(`Api 'alimentation intranet' is mounted`))

/**
 * ${basePath_intra}/v1 routes
 */
router.use('/v1', v1Routes)

module.exports = router
