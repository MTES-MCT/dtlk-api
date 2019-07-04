let queue = require('../instance')
let mailer = require('../../mailer')

let processingQueue = queue.process('sendMail', 1 , async function (job, done) {
  try {
    await mailer.sendMail(job.data.to, job.data.content)
    done()
  }
  catch (err) {
    done(err.message)
  }
})

module.exports = processingQueue
