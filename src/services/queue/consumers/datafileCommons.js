let queue = require('../instance')
let queueService = require('../service')
let uploadedFilesService = require('../../uploadedFiles')
let mongoService = require('../../mongodb/service')
let udataApi = require('../../udata/api')
let { toUdata: transformForUdata, toAlimentationApi: transformForAlimentationApi, toMongo: transformForMongo } = require('../../transform')
let csvType = require('../../../models/csvType')
let row = require('../../mongodb/hub/row')
let MongoJob = require('../../mongodb/hub/job')
let { ihm_diffusion_url } = require('../../../env')
let { JobDatafileParseCsvError } = require('../../errors').queue
let pause = require('../../../utils/pause')

let commons = {
  job: {
    sanitize: async (idJob, tokenFile, tempCollectionNameMongo) => {
      await queueService.datafileSubJobs.remove(idJob)
      await uploadedFilesService.csv.deleteSplitFiles(tokenFile)
      await row(tempCollectionNameMongo).deleteCollection()
    },
    optimize: async tokenFile => uploadedFilesService.csv.split(tokenFile),
    purgeComplete:  async (idJob, tokenFile) => {
      await queueService.datafileSubJobs.remove(idJob)
      await uploadedFilesService.csv.deleteSplitFiles(tokenFile)
      await uploadedFilesService.delete(tokenFile)
    }
  },
  file: {
    retrieveHeadersAndColumns: async tokenFile => {
      let headers = await uploadedFilesService.csv.headers(tokenFile)
      let columns = headers.reduce((arr, header) => {
        let typeOfHeader = csvType.getHeader(header.type)
        let columnsOfHeader = typeOfHeader.columns(header.name)
        let mappingColumnsOfHeader = typeOfHeader.returnMappingColumnsObject(header.name)
        let descriptionColumns = typeOfHeader.returnDescriptionColumnsObject(header.name, header.description)
        let typeColumns = typeOfHeader.returnTypesColumnsObject(header.name)
        for (let name of columnsOfHeader) {
          arr.push({ name: name, description: descriptionColumns[name] , type: typeColumns[name], mapping: mappingColumnsOfHeader[name] })
        }
        return arr
      }, [])
      return { columns: columns, headers: headers }
    },
    process: async (job, totalChunks, totalLines, linesByChunk, csvHeaders, tempCollectionNameMongo, result) => {
      // flag for state of jbob
      let parentStopped = false
      // initialization of subJobs status array
      let subJobsStatus = []
      // function for create subJob data
      let subJobData = subJobNumber => ({
        title: `Job csvToMongo - child job (${ subJobNumber } / ${ totalChunks } of Job ${ job.id }`,
        parentJobId: job.id,
        subJobNumber: subJobNumber,
        linesOfJob: subJobNumber === totalChunks ? (totalLines - linesByChunk * (totalChunks - 1)) : linesByChunk,
        linesByChunk: linesByChunk,
        collectionName: tempCollectionNameMongo,
        headers: csvHeaders,
        fileToken: job.data.tokenFile
      })
      // function for processing a subJob
      let processSubJob = subJobStatus => new Promise((resolve, reject) => {
        console.info(`SubJob ${ subJobStatus.number } processing start`)
        let updateStatus = (percentage = 0, { linesParsed = 0, errorsList = [] }) => {
          subJobStatus.completed = percentage == 100
          subJobStatus.linesParsed = linesParsed
          subJobStatus.errorsList = errorsList.map(error => ({
            line: 4 + error.line + (subJobStatus.number - 1) * linesByChunk,
            column: error.column,
            message: error.message
          }))
        }
        let checkIntervalSubJob = setInterval(() => {
          queueService.job.byId(subJobStatus.id)
            .then(subJob => {
              updateStatus(subJob._progress, subJob.progress_data || {})
              if (parentStopped || subJobStatus.completed) {
                clearInterval(checkIntervalSubJob)
                console.info(`Subjob ${ subJobStatus.number } processing end`)
                resolve()
              }
            })
        }, 5000)
      })

      await new Promise((resolve, reject) => {
        // create subjobs
        for (let i of Array(totalChunks).keys()) {
          // create subJob in kue
          queueService.job.add('csvToMongo', false, subJobData(i + 1))
            // add status of created subJob in array
            .then(subJob => {
              subJobsStatus.push({ id: subJob.id, completed: false, number: i + 1, linesParsed: 0, errorsList: [] })
              console.info(`job csvToMongo created with id ${ subJob.id }`)
              return subJobsStatus[i]
            })
            .then(subJobStatus => processSubJob(subJobStatus))
        }

        let checkIntervalJob = setInterval(async () => {
          console.info('check Job state')
          // create job result from subJobs status
          let resultProcess = subJobsStatus.reduce(
            (res, { errorsList: sErrorsList, linesParsed: sLinesParsed, completed: sCompleted }) => {
              return { errorsList: res.errorsList.concat(sErrorsList), linesParsed: res.linesParsed + sLinesParsed, completed: res.completed && sCompleted }
            },
            { errorsList: [], linesParsed: 0, completed: true }
          )
          // set progress of job in kue
          job.progress(5 + 90 * resultProcess.linesParsed / totalLines, 100, commons.result.update(result, { step: `Traitement du fichier - (lignes traitées: ${ resultProcess.linesParsed } / ${ totalLines })` }))
          // stop job if more than 49 errors
          if (resultProcess.errorsList.length > 49) {
            parentStopped = true
            clearInterval(checkIntervalJob)
            reject(new JobDatafileParseCsvError('Il y a des erreurs dans le fichier csv', { errorsList: resultProcess.errorsList }))
          }
          // stop job if all subJobs are completed
          if (resultProcess.completed) {
            parentStopped = true
            clearInterval(checkIntervalJob)
            if (resultProcess.errorsList.length > 0) {
              reject(new JobDatafileParseCsvError('Il y a des erreurs dans le fichier csv !!! ', { errorsList: resultProcess.errorsList }))
            }
            resolve()
          }
        }, 5000)
      })
    }
  },
  udata: {
    createDatafile: async (userApiKey, datasetId, datafileMetadata, millesimeDatafile, rows, columns) => {
      let metadata = {
        ...datafileMetadata,
        millesimes: 1,
        millesimes_info: [{ millesime: millesimeDatafile, rows: rows, columns: columns }],
        url: `${ ihm_diffusion_url }`
      }
      let udataDatafile = await udataApi.datafiles.new(userApiKey, datasetId, transformForUdata.alimentationApi.datafile(metadata))
      return transformForAlimentationApi.udata.datafiles(udataDatafile)
    },
    addDatafileMillesime: async (userApiKey, datasetId, datafileRid, millesimeDatafile, rows, columns) => {
      let udataDatafile = await udataApi.datafiles.millesimes.add(userApiKey, datasetId, datafileRid, millesimeDatafile, rows, columns)
      return transformForAlimentationApi.udata.datafiles(udataDatafile)
    },
    updateDatafileMillesime: async (userApiKey, datasetId, datafileRid, datafileMillesime, rows, columns) => {
      let udataDatafile = await udataApi.datafiles.millesimes.update(userApiKey, datasetId, datafileRid, datafileMillesime, rows, columns)
      return transformForAlimentationApi.udata.datafiles(udataDatafile)
    }
  },
  mongodb: {
    adjustTempObjects: async (mongoTempCollectionName, mongoCollectionName) => {
      let MongoRowTemp = row(mongoTempCollectionName)
      if (await mongoService.rows.exists(mongoCollectionName)) await row(mongoCollectionName).dropCollection()
      await MongoRowTemp.renameCollection(`rows_${ mongoCollectionName }`)
    },
    addJob: async idJob => {
      try {
        let updatedJob = await queueService.job.byId(idJob)
        let mongoJob = new MongoJob(transformForMongo.kue.job(updatedJob))
        await mongoJob.save()
        updatedJob.remove( err => {
          if (err) console.error(`Kue Job with id ${ idJob } not removed from redis`, err)
        })
      }
      catch (error) {
        console.error(`Kue Job with id ${ idJob } not created in mongo`, error)
      }
    },
    addMessage: async ({ to, content }) => {
      try {
        await mongoService.messages.create({
          owner: to.id,
          sender: {
            isRobot: true,
            isUser: false,
            isIntranetUser: false,
            isDatalakeUser: false,
            robot: {
              name: `Robot tâches asynchrone d'intégration`
            }
          },
          to: [{
            isRobot: false,
            isUser: true,
            isIntranetUser: true,
            isDatalakeUser: true,
            user: {
              id: to.id, email: to.email, name: `${ to.first_name } ${ to.last_name }`
            }
          }],
          cc: [],
          timestamp: new Date(),
          subject: content.subject,
          text: content.body,
          textHtml: content.bodyHtml,
          read: false
        })
      }
      catch (error) {
        console.error(`Message not created in mongo`, error)
      }
    }
  },
  retrieve: {
    user: async id => transformForAlimentationApi.mongo.users(await mongoService.users.byId(id)),
    dataset: async (apiKeyUser, idDataset) => transformForAlimentationApi.udata.datasets(await udataApi.datasets.byId(apiKeyUser, idDataset)),
    datafile: (dataset, ridDatafile) => dataset.datafiles.find(datafile => datafile.rid === ridDatafile)
  },
  logs: {
    createDatafile: async (user, dataset, datafile) => {
      await mongoService.logs.datafile.create({ id: user.id, name: `${ user.first_name } ${ user.last_name }` }, { id: dataset.id, title: dataset.title }, { rid: datafile.rid, title: datafile.title })
    },
    addDatafileMillesime: async (user, dataset, datafile) => {
      await mongoService.logs.datafile.millesime.add({ id: user.id, name: `${ user.first_name } ${ user.last_name }` }, { id: dataset.id, title: dataset.title }, { rid: datafile.rid, title: datafile.title }, datafile.millesimes)
    },
    replaceDatafileMillesime: async (user, dataset, datafile, millesime) => {
      await mongoService.logs.datafile.millesime.update({ id: user.id, name: `${ user.first_name } ${ user.last_name }` }, { id: dataset.id, title: dataset.title }, { rid: datafile.rid, title: datafile.title }, millesime)
    }
  },
  mail: {
    send: async idJob => {
      try {
        await pause(3000)
        let updatedJob = await queueService.job.byId(idJob)
        let to = updatedJob.progress_data.user
        let content = require(`../../../mailTemplates/datafileJob${ updatedJob.progress_data.success ? 'Success' : 'Error' }`)(updatedJob)
        await queueService.sendMailJob.create(to, content)
        return { to, content }
      }
      catch (err) {
        console.error('error creation SendMailJob', err)
      }
    }
  },
  result: {
    update: (result, resultParts) => {
      for (let property in resultParts) {
        if (!result[property]) {
          console.info(`job ${ result.jobId } - [NEW] - ${ property } : `, resultParts[property])
        }
        else {
          console.info(`job ${ result.jobId } - [UPDATE] - ${ property } : `, resultParts[property])
        }
        result[property] = resultParts[property]
      }
      return result
    }
  }
}

module.exports = commons
