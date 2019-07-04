
if (process.argv.length === 3) {
  if (process.argv[2] === 'datafiles') {
    let processingCreateDatafile = require('./createDatafile')
    let processingAddDatafileMillesime = require('./addDatafileMillesime')
    let processingReplaceDatafileMillesime = require('./replaceDatafileMillesime')
    console.info(`datafiles consumers of queue started`)
  }
  if (process.argv[2] === 'createDatafile') {
    let processingCreateDatafile = require('./createDatafile')
    console.info(`createDatafile consumer of queue started`)
  }
  if (process.argv[2] === 'addDatafileMillesime') {
    let processingAddDatafileMillesime = require('./addDatafileMillesime')
    console.info(`addDatafileMillesime consumer of queue started`)
  }
  if (process.argv[2] === 'replaceDatafileMillesime') {
    let processingReplaceDatafileMillesime = require('./replaceDatafileMillesime')
    console.info(`replaceDatafileMillesime consumer of queue started`)
  }
  if (process.argv[2] === 'sendMail') {
    let processingSendMail = require('./sendMail')
    console.info(`sendMail consumer of queue started`)
  }
  if (process.argv[2] === 'csvToMongo') {
    let processingSendMail = require('./csvToMongo')
    console.info(`csvToMongo consumer of queue started`)
  }
  if (process.argv[2] === 'uploadedFile') {
    let processingUploadedFile = require('./uploadedFile')
    console.info(`uploadedFile consumer of queue started`)
  }
  if (process.argv[2] === 'allExceptCsvToMongo') {
    let processingUploadedFile = require('./uploadedFile')
    let processingSendMail = require('./sendMail')
    let processingCreateDatafile = require('./createDatafile')
    let processingAddDatafileMillesime = require('./addDatafileMillesime')
    let processingReplaceDatafileMillesime = require('./replaceDatafileMillesime')
    console.info(`uploadedFile, sendMail and datafiles consumers of queue started`)
  }
}
else {
  let processingCreateDatafile = require('./createDatafile')
  let processingAddDatafileMillesime = require('./addDatafileMillesime')
  let processingReplaceDatafileMillesime = require('./replaceDatafileMillesime')
  let processingUploadedFile = require('./uploadedFile')
  let processingCsvToMongo = require('./csvToMongo')
  let processingSendMail = require('./sendMail')
  console.info(`all consumers of queue started`)
}
