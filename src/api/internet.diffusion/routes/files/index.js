let express = require('express')
let router = require('express').Router({ strict: true })
let validate = require('../../middlewares/validate')
let attachments = require('../../middlewares/attachments')


/**
 * GET ${ basePath_inter }/files/:rid
 * api route: download attachment file
 */
router.route('/:rid')
  .get(
    validate.attachmentRidInPath,
    attachments.sendFile
  )

module.exports = router
