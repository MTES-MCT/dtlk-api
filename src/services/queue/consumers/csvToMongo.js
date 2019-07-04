let queue = require('../instance')
let queueService = require('../service')
let uploadedFilesService = require('../../uploadedFiles')
let row = require('../../mongodb/hub/row')
let { toMongo: { csv: { row: csvRowtoMongo } } } = require('../../transform')

let checkParentJobActive = async id => {
  try {
    let parentJob = await queueService.job.byId(id)
    return parentJob._state === 'active'
  }
  catch (error) {
    return false
  }

}

let processingQueue =  queue.process('csvToMongo', 1 , async function (job, done) {
  try {
    let errorsList =  []
    let linesCounter = 1
    let MongoRow = row(job.data.collectionName)
    let mongoBulkOp = MongoRow.collection.initializeUnorderedBulkOp()
    let csvStream = uploadedFilesService.csv.stream(job.data.fileToken, job.data.subJobNumber)

    for await (let csvObject of csvStream) {
      let transformCsv = await csvRowtoMongo(csvObject, job.data.headers, (job.data.subJobNumber - 1) * job.data.linesByChunk + linesCounter )
      if (transformCsv.errorsList.length === 0) {
        mongoBulkOp.insert(transformCsv.row)
      }
      else {
        errorsList = [...errorsList, ...transformCsv.errorsList.map(error => ({ line: linesCounter, ...error }))]
      }

      // update progress of job each 200 rows
      if (linesCounter % 200 === 0) {
        checkParentJobActive(job.data.parentJobId).then(result => {
          if (result === false) return done(`Parent job stopped !!!`)
          job.progress(linesCounter, job.data.linesOfJob, { linesParsed: linesCounter, errorsList: errorsList })
        })
      }
      if (linesCounter < job.data.linesOfJob) linesCounter++
    }

    checkParentJobActive(job.data.parentJobId)
      .then(async (result) => {
        if (result === false) return done(`Parent job stopped !!!`)
        job.progress(linesCounter, job.data.linesOfJob, { linesParsed: linesCounter, errorsList: errorsList })
        if (mongoBulkOp.length > 0) {
          mongoBulkOp.execute().then(result => done()).catch(err => done(`Erreur d'écriture dans la base MongoDB`))
        }
        done()
      })
  }
  catch (error) {
    return done(error.message)
  }
})

module.exports = processingQueue
