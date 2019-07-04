let router = require('express').Router({ strict: true })
let authenticate = require ('../../middlewares/authenticate')
let authorize = require ('../../middlewares/authorize')
let validate = require('../../middlewares/validate')
let messages = require('../../middlewares/messages')
let responses = require('../../middlewares/responses')

/**
 * check authentication for all routes ${basepath_intra}/v1/messages*
 *  - validate apiKey in header
 *  - put authenticated user in res.locals.user
 */
 router.use('/messages',
   validate.apiKeyInHeader,
   authenticate.byApiKey
 )

 /**
  * GET ${basePath_intra}/v1/messages
  * api route: get messages of user of apiKey
  */
 router.route('/messages')
   .get(
     messages.my,
     responses.messages
   )

 /**
  * for all routes ${basepath_intra}/v1/messages/:id* :
  *  - validate message id
  *  - get message and put in res.locals.message
  *  - check authorization on message
  */
 router.use('/messages/:id',
   validate.messageIdInPath,
   messages.get,
   authorize.checkUserOnMessage
 )

/**
 * GET ${basePath_intra}/v1/messages/:id
 * api route: get message by id
 */
router.route('/messages/:id')
  .get(
    responses.message
)

/**
 * PUT ${basePath_intra}/v1/messages/:id
 * api route: update message
 */
router.route('/messages/:id')
  .put(
    validate.messageInBody,
    messages.update,
    responses.message
)

/**
 * DELETE ${basePath_intra}/v1/messages
 * api route: delete message by id
 */
router.route('/messages/:id')
  .delete(
    messages.delete,
    responses.deleted
)

module.exports = router
