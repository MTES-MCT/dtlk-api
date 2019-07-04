let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let responses = require('../../middlewares/responses')
let authenticate = require ('../../middlewares/authenticate')
let datasets = require ('../../middlewares/datasets')
let jobs = require ('../../middlewares/jobs')
let messages = require ('../../middlewares/messages')


/**
 * POST ${basePath_intra}/v1/auth
 * api route: authenticate user with login and password
 */
router.route('/auth')
  .post(
    validate.credentialsInBody,
    authenticate.byCredentials,
    authenticate.byApiKey,
    responses.me
  )

/**
 * check authentication for all routes ${basepath_intra}/v1/users/me
 *  - validate apiKey in header
 *  - put authenticated user in res.locals.user
 */
router.use('/users/me',
  validate.apiKeyInHeader,
  authenticate.byApiKey
)

/**
 * GET ${basePath_intra}/v1/users/me
 * api route: get user with apiKey
 */
router.route('/users/me')
  .get(
    responses.me
  )

/**
 * GET ${basePath_intra}/v1/users/me/infos
 * api route: get user with apiKey
 */
router.route('/users/me/infos')
  .get(
    datasets.my,
    datasets.alerts,
    jobs.my,
    messages.my,
    responses.userInfo
  )
module.exports = router
