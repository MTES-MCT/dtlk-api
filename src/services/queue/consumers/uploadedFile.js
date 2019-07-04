let queue = require('../instance')
let uploadedFilesService = require('../../uploadedFiles')

let processingQueue = queue.process('uploadedFile', 2 , async function (job, done) {
  try {
    console.info(`Job ${ job.id } - begin: remove file with token ${ job.data.file.token }`)
    await uploadedFilesService.delete(job.data.file.token)
    done()
    console.info(`Job ${ job.id } - finished: remove file with token ${ job.data.file.token }`)
  }
  catch (error) {
    done(error.message)
  }
})

module.exports = processingQueue
