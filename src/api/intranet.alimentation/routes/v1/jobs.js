let router = require('express').Router({ strict: true })
let authenticate = require ('../../middlewares/authenticate')
let authorize = require ('../../middlewares/authorize')
let validate = require('../../middlewares/validate')
let jobs = require('../../middlewares/jobs')
let responses = require('../../middlewares/responses')

/**
 * check authentication for all routes ${basepath_intra}/v1/jobs*
 *  - validate apiKey in header
 *  - put authenticated user in res.locals.user
 */
router.use('/jobs',
  validate.apiKeyInHeader,
  authenticate.byApiKey
)

/**
 * GET ${basePath_intra}/v1/jobs
 * api route: get jobs of user of apiKey
 */
router.route('/jobs')
  .get(
    jobs.my,
    responses.jobs
  )

/**
 * GET ${basePath_intra}/v1/jobs/:id
 * api route: get a job with a given id
 */
router.route('/jobs/:id')
  .get(
    validate.jobIdInPath,
    jobs.get,
    authorize.checkUserOnJob,
    responses.job
  )

module.exports = router
