let express = require('express')
let v1Routes = require('./v1')
let filesRoutes = require('./files')

let router = express.Router({ strict: true })

/**
 * GET ${basePath_inter}/status
 */
router.get('/status', (req, res) => res.send(`Api 'diffusion internet' is mounted`))

/**
 * ${basePath_inter}/v1 routes
 */
router.use('/v1', v1Routes)

/**
 * ${basePath_inter}/files routes
 */
router.use('/files', filesRoutes)

module.exports = router
