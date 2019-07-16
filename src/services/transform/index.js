let { transform: transformErrors } = require('../errors')
let rowColumnsFilters = require('../../models/rowColumns')
let csvType = require('../../models/csvType')
let { scheme: scheme_diffusion, host: host_diffusion, port: port_diffusion, path: path_diffusion } = require('../../env').api_diffusion_internet.exposed_url

let transform = {
  toMongo: {
    csv: {
      row: async (csvObject, headers, id) => {
        let row = {}
        let errorsList = []
        for (let [j, value] of csvObject.entries()) {
          try {
            row = await csvType.getHeader(headers[j].type).setValuesForDoc(row, headers[j].name, value)
            row._id = id
          }
          catch (err) {
            errorsList.push({ column: j + 1, message: err.message })
          }
        }
        return { row: row, errorsList: errorsList }
      }
    },
    kue: {
      job: kueJob => {
        try {
          let mongoJob = {
            idredis: kueJob.id,
            owner: kueJob.data.idUser,
            state: {
              created_at: new Date(+kueJob.created_at),
              promote_at: new Date(+kueJob.promote_at),
              started_at: new Date(+kueJob.started_at)
            },
            data: {
              task: kueJob.type,
              dataset_id: kueJob.data.idDataset,
              file_name: kueJob.data.nameFile
            }
          }
          mongoJob.data.datafile_millesime = kueJob.data.millesimeDatafile
          if (kueJob.type === 'createDatafile') {
            mongoJob.data.datafile_metadata = kueJob.data.metadataDatafile
          }
          if (kueJob.type === 'replaceDatafileMillesime') {
            mongoJob.data.datafile_rid = kueJob.data.ridDatafile
          }
          if (kueJob.type === 'addDatafileMillesime') {
            mongoJob.data.datafile_rid = kueJob.data.ridDatafile
          }
          if (kueJob.progress_data.success === true) {
            mongoJob.state.status = 'complete'
            mongoJob.state.updated_at = new Date(+kueJob.updated_at)
            mongoJob.state.completed_at = new Date(+kueJob.updated_at)
            mongoJob.result = {
              rid: kueJob.progress_data.datafile.rid,
              duration: Math.floor((kueJob.updated_at - kueJob.started_at)/1000),
              rows: kueJob.progress_data.split.totalLines,
              csv_headers: kueJob.progress_data.headers.length,
              columns: kueJob.progress_data.columns.length
            }
            if (kueJob.type === 'createDatafile') mongoJob.result.millesime = 1
            if (kueJob.type === 'replaceDatafileMillesime') mongoJob.result.millesime = kueJob.data.millesimeDatafile
            if (kueJob.type === 'addDatafileMillesime') mongoJob.result.millesime = kueJob.progress_data.datafile.millesimes
          }
          if (kueJob.progress_data.success === false) {
            mongoJob.state.status = 'failed'
            mongoJob.state.updated_at = new Date(+kueJob.updated_at)
            mongoJob.state.failed_at = new Date(+kueJob.failed_at)
            mongoJob.error = { message: kueJob.progress_data.error.message }
            if (kueJob.progress_data.error.csvParsingErrorsList) mongoJob.error.list = kueJob.progress_data.error.csvParsingErrorsList
          }
          return mongoJob
        }
        catch (error) {
          throw new transformErrors.KueToMongoError(`Erreur de conversion d'un job kue`)
        }
      }
    }
  },
  toAlimentationApi: {
    udata: {
      licenses: udataLicenses => {
        try {
          let licensesToConvert = Array.isArray(udataLicenses) ? udataLicenses : [udataLicenses]
          let convertedLicenses = licensesToConvert.map(udataLicense => {
            return { id: udataLicense.id, name: udataLicense.title, description: udataLicense.url }
          })
          return Array.isArray(udataLicenses) ? convertedLicenses : convertedLicenses[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'une licence udata`)
        }
      },
      zones: udataZones => {
        try {
          let zonesToConvert = Array.isArray(udataZones) ? udataZones : [udataZones]
          let convertedZones = zonesToConvert.map(udataZone => {
            return { id: udataZone.id, name: udataZone.properties.name, level: udataZone.properties.level, code: udataZone.properties.code, validity: udataZone.properties.validity || {} }
          })
          return Array.isArray(udataZones) ? convertedZones : convertedZones[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'une zone udata`)
        }
      },
      organizations: udataOrgs => {
        try {
          let orgsToConvert = Array.isArray(udataOrgs) ? udataOrgs : [udataOrgs]
          let convertedOrgs = orgsToConvert.map(udataOrg => {
            return {
              id: udataOrg.id,
              title: udataOrg.name,
              acronym: udataOrg.acronym,
              description: udataOrg.description,
              members: udataOrg.members.map(member => { return {id: member.user.id, first_name: member.user.first_name, last_name: member.user.last_name } })
            }
          })
          return Array.isArray(udataOrgs) ? convertedOrgs : convertedOrgs[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'une organisation udata`)
        }
      },
      users: udataUsers => {
        try {
          let usersToConvert = Array.isArray(udataUsers) ? udataUsers : [udataUsers]
          let convertedUsers = usersToConvert.map(udataUser => {
            return {
              id: udataUser.id,
              active: udataUser.active,
              email: udataUser.email,
              first_name: udataUser.first_name,
              last_name: udataUser.last_name,
              organizations: udataUser.organizations.map(org => { return { id: org.id, title: org.name, acronym: org.acronym } }),
              since: udataUser.since,
              apiKey: udataUser.apikey
            }
          })
          return Array.isArray(udataUsers) ? convertedUsers : convertedUsers[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'un utilisateur udata`)
        }
      },
      datasets: udataDatasets => {
        try {
          let datasetsToConvert = Array.isArray(udataDatasets) ? udataDatasets : [udataDatasets]
          let convertedDatasets = datasetsToConvert.map(udataDataset => {
            let dataset = {
              id: udataDataset.id,
              title: udataDataset.title,
              description: udataDataset.description,
              organization: { id: udataDataset.organization.id, title: udataDataset.organization.name },
              topic: udataDataset.extras.datalake_topic,
              license: udataDataset.license,
              frequency: udataDataset.frequency,
              created_at: udataDataset.created_at,
              last_modified: udataDataset.last_modified,
              last_update: udataDataset.last_update
            }
            if (udataDataset.frequency_date) dataset.frequency_date = udataDataset.frequency_date
            if (udataDataset.tags) dataset.tags = udataDataset.tags
            if (udataDataset.spatial) dataset.spatial = udataDataset.spatial
            if (udataDataset.temporal_coverage) dataset.temporal_coverage = udataDataset.temporal_coverage
            if (dataset.spatial && ('geom' in dataset.spatial)) delete dataset.spatial.geom
            if (udataDataset.extras.datalake_caution) dataset.caution = udataDataset.extras.datalake_caution
            dataset.attachments = transform.toAlimentationApi.udata.attachments(udataDataset.resources.filter(resource => ('datalake_attachment' in resource.extras) && resource.extras.datalake_attachment))
            dataset.datafiles = transform.toAlimentationApi.udata.datafiles(udataDataset.resources.filter(resource => ('datalake_datafile' in resource.extras) && resource.extras.datalake_datafile))
            return dataset
          })
          return Array.isArray(udataDatasets) ? convertedDatasets : convertedDatasets[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'un jeu de données udata`)
        }
      },
      attachments: udataAttachments => {
        try {
          let attachmentsToConvert = Array.isArray(udataAttachments) ? udataAttachments : [udataAttachments]
          let convertedAttachments = attachmentsToConvert.map(udataAttachment => {
            let attachment = {
              rid: udataAttachment.id,
              title: udataAttachment.title,
              description: udataAttachment.description,
              created_at: udataAttachment.created_at,
              last_modified: udataAttachment.last_modified,
              published: udataAttachment.published,
              url: `${scheme_diffusion}://${host_diffusion}:${port_diffusion}/${path_diffusion}files/${udataAttachment.id}`
            }
            return attachment
          })
          return Array.isArray(udataAttachments) ? convertedAttachments : convertedAttachments[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'un fichier joint udata`)
        }
      },
      datafiles: udataDatafiles => {
        try {
          let datafilesToConvert = Array.isArray(udataDatafiles) ? udataDatafiles : [udataDatafiles]
          let convertedDatafiles = datafilesToConvert.map(udataDatafile => {
            let datafile = {
              rid: udataDatafile.id,
              title: udataDatafile.title,
              description: udataDatafile.description,
              millesimes: udataDatafile.extras.datalake_millesimes,
              created_at: udataDatafile.created_at,
              last_modified: udataDatafile.last_modified,
              published: udataDatafile.published,
              url: udataDatafile.url,
              millesimes_info: JSON.parse(udataDatafile.extras.datalake_millesimes_info)
            }
            if (udataDatafile.extras.datalake_temporal_coverage_start || udataDatafile.extras.datalake_temporal_coverage_end) {
              datafile.temporal_coverage = {}
              if (udataDatafile.extras.datalake_temporal_coverage_start) datafile.temporal_coverage.start = udataDatafile.extras.datalake_temporal_coverage_start
              if (udataDatafile.extras.datalake_temporal_coverage_end) datafile.temporal_coverage.end = udataDatafile.extras.datalake_temporal_coverage_end
            }
            if (udataDatafile.extras.datalake_legal_notice) datafile.legal_notice = udataDatafile.extras.datalake_legal_notice
            return datafile
          })
          return Array.isArray(udataDatafiles) ? convertedDatafiles : convertedDatafiles[0]
        }
        catch (error) {
          throw new transformErrors.UdataToAlimentationApiError(`Erreur de conversion d'un fichier de données udata`)
        }
      }
    },
    mongo: {
      tags: mongoTags => {
        try {
          let tagsToConvert = Array.isArray(mongoTags) ? mongoTags : [mongoTags]
          let convertedTags = tagsToConvert.map(mongoTag => {
            return { value: mongoTag.value, display: mongoTag.display, topics: mongoTag.topics, eurovoc: mongoTag.eurovoc || '', ecoplanet: mongoTag.ecoplanet || '' }
          })
          return Array.isArray(mongoTags) ? convertedTags : convertedTags[0]
        }
        catch (error) {
          throw new transformErrors.MongoToAlimentationApiError(`Erreur de conversion d'un tag mongo`)
        }
      },
      users: mongoUsers => {
        try {
          let usersToConvert = Array.isArray(mongoUsers) ? mongoUsers : [mongoUsers]
          let convertedUsers = usersToConvert.map(mongoUser => {
            return {
              id: mongoUser._id,
              active: mongoUser.active,
              email: mongoUser.email,
              first_name: mongoUser.first_name,
              last_name: mongoUser.last_name,
              since: mongoUser.since,
              apiKey: mongoUser.apikey
            }
          })
          return Array.isArray(mongoUsers) ? convertedUsers : convertedUsers[0]
        }
        catch (error) {
          throw new transformErrors.MongoToAlimentationApiError(`Erreur de conversion d'un user mongo`)
        }
      },
      logs: mongoLogs => {
        try {
          let logsToConvert = Array.isArray(mongoLogs) ? mongoLogs : [mongoLogs]
          let convertedLogs = logsToConvert.map(mongoLog => {
            let apiLog = Object.assign(mongoLog.toJSON(), {['id']: mongoLog['_id'] })
            delete apiLog._id
            return apiLog
          })
          return Array.isArray(mongoLogs) ? convertedLogs : convertedLogs[0]
        }
        catch (error) {
          throw new transformErrors.MongoToAlimentationApiError(`Erreur de conversion d'un log mongo`)
        }
      },
      jobs: mongoJobs => {
        try {
          let jobsToConvert = Array.isArray(mongoJobs) ? mongoJobs : [mongoJobs]
          let convertedJobs = jobsToConvert.map(mongoJob => {
            let apiJob = Object.assign(mongoJob.toJSON(), {['id']: mongoJob['idredis'] })
            delete apiJob._id
            delete apiJob.idredis
            return apiJob
          })
          return Array.isArray(mongoJobs) ? convertedJobs : convertedJobs[0]
        }
        catch (error) {
          throw new transformErrors.MongoToAlimentationApiError(`Erreur de conversion d'un job mongo`)
        }
      },
      messages: mongoMessages => {
        try {
          let messagesToConvert = Array.isArray(mongoMessages) ? mongoMessages : [mongoMessages]
          let convertedMessages = messagesToConvert.map(mongoMessage => {
            let apiMessage = Object.assign(mongoMessage.toJSON(), { id: mongoMessage._id })
            delete apiMessage._id
            return apiMessage
          })
          return Array.isArray(mongoMessages) ? convertedMessages : convertedMessages[0]
        }
        catch (error) {
          throw new transformErrors.MongoToAlimentationApiError(`Erreur de conversion d'un message mongo`)
        }
      }
    },
    kue: {
      jobs: kueJobs => {
        try {
          let jobsToConvert = Array.isArray(kueJobs) ? kueJobs : [kueJobs]
          let convertedJobs = jobsToConvert.map(kueJob => {
            let apiJob = {
              id: kueJob.id,
              owner: kueJob.data.idUser,
              state: {
                status: kueJob._state,
                created_at: new Date(+kueJob.created_at)
              },
              data: {
                task: kueJob.type,
                dataset_id: kueJob.data.idDataset,
                file_name: kueJob.data.nameFile,
                datafile_millesime: kueJob.data.millesimeDatafile
              }
            }
            if (kueJob.type === 'createDatafile') {
              apiJob.data.datafile_metadata = kueJob.data.metadataDatafile
            }
            if (kueJob.type === 'replaceDatafileMillesime') {
              apiJob.data.datafile_rid = kueJob.data.ridDatafile
            }
            if (kueJob.type === 'addDatafileMillesime') {
              apiJob.data.datafile_rid = kueJob.data.ridDatafile
            }
            if (kueJob.promote_at) apiJob.state.promote_at = new Date(+kueJob.promote_at)
            if (kueJob.started_at) apiJob.state.started_at = new Date(+kueJob.started_at)
            if (kueJob.updated_at) apiJob.state.updated_at = new Date(+kueJob.updated_at)
            if (kueJob._progress) {
              apiJob.state.progress = { percentage: Number.parseInt(kueJob._progress) }
              if (kueJob.progress_data) apiJob.state.progress.step = kueJob.progress_data.step
            }
            return apiJob
          })
          return Array.isArray(kueJobs) ? convertedJobs : convertedJobs[0]
        }
        catch (error) {
          throw new transformErrors.KueToAlimentationApiError(`Erreur de conversion d'un job kue`)
        }
      }
    }
  },
  toUdata: {
    alimentationApi: {
      dataset: apiDataset => {
        try {
          let convertedDataset = {
            title: apiDataset.title,
            description: apiDataset.description,
            organization: apiDataset.organization,
            extras: { datalake_topic: apiDataset.topic },
            license: apiDataset.license,
            frequency: apiDataset.frequency
          }
          if (apiDataset.tags) convertedDataset.tags = apiDataset.tags
          if (apiDataset.caution) convertedDataset.extras.datalake_caution = apiDataset.caution
          convertedDataset.frequency_date = apiDataset.frequency_date || null
          if (apiDataset.spatial) {
            convertedDataset.spatial = { granularity: apiDataset.spatial.granularity || 'other', zones: (apiDataset.spatial.zones && apiDataset.spatial.zones.length) ? apiDataset.spatial.zones : null }
          } else {
            convertedDataset.spatial = { granularity: 'other', zones: null }
          }
          if (apiDataset.temporal_coverage) convertedDataset.temporal_coverage = apiDataset.temporal_coverage
          return convertedDataset
        }
        catch (error) {
          throw new transformErrors.AlimentationApiToUdataError(`Erreur de conversion d'un jeu de données alimentation api`)
        }
      },
      attachment: apiAttachment => {
        try {
          let convertedAttachment = {
            title: apiAttachment.title,
            description: apiAttachment.description,
            published: apiAttachment.published,
            extras: {
              datalake_attachment: true
            }
          }
          if (apiAttachment.rid) convertedAttachment.id = apiAttachment.rid
          return convertedAttachment
        }
        catch (error) {
          throw new transformErrors.AlimentationApiToUdataError(`Erreur de conversion d'un fichier joint alimentation api`)
        }
      },
      datafile: apiDatafile => {
        try {
          let convertedDatafile = {
            title: apiDatafile.title,
            description: apiDatafile.description,
            published: apiDatafile.published,
            extras: {
              datalake_datafile: true,
              datalake_millesimes: apiDatafile.millesimes,
              datalake_millesimes_info: JSON.stringify(apiDatafile.millesimes_info)
            },
            filetype: 'remote',
            url: apiDatafile.url
          }
          if (apiDatafile.rid) convertedDatafile.id = apiDatafile.rid
          if (apiDatafile.legal_notice) convertedDatafile.extras.datalake_legal_notice = apiDatafile.legal_notice
          if (apiDatafile.temporal_coverage_start) convertedDatafile.extras.datalake_temporal_coverage_start = apiDatafile.temporal_coverage_start
          if (apiDatafile.temporal_coverage_end) convertedDatafile.extras.datalake_temporal_coverage_end = apiDatafile.temporal_coverage_end
          return convertedDatafile
        }
        catch (error) {
          throw new transformErrors.AlimentationApiToUdataError(`Erreur de conversion d'un fichier joint alimentation api`)
        }
      }
    }
  },
  toDiffusionApi: {
    mongo: {
      datasets: mongoDatasets => {
        try {
          let datasetsToConvert = Array.isArray(mongoDatasets) ? mongoDatasets : [mongoDatasets]
          let convertedDatasets = datasetsToConvert.map( mongoDataset => {
            let apiDataset = {
              id: String(mongoDataset._id),
              title: mongoDataset.title,
              description: mongoDataset.description,
              organization: {
                id: String(mongoDataset.organization._id),
                title: mongoDataset.organization.name,
                description: mongoDataset.organization.description,
                acronym: mongoDataset.organization.acronym
              },
              topic: mongoDataset.extras.datalake_topic,
              license: mongoDataset.license,
              frequency: mongoDataset.frequency,
              created_at: mongoDataset.created_at,
              last_modified: mongoDataset.last_modified,
              last_update: mongoDataset.last_update,
              attachments: [],
              datafiles: []
            }
            if (mongoDataset.frequency_date) apiDataset.frequency_date = mongoDataset.frequency_date
            if (mongoDataset.tags) apiDataset.tags = mongoDataset.tags
            if (mongoDataset.spatial) apiDataset.spatial = mongoDataset.spatial
            if (mongoDataset.temporal_coverage) apiDataset.temporal_coverage = mongoDataset.temporal_coverage
            if (apiDataset.spatial && ('geom' in apiDataset.spatial)) delete apiDataset.spatial.geom
            if (mongoDataset.extras.datalake_caution) apiDataset.caution = mongoDataset.extras.datalake_caution
            for (let attachment of mongoDataset.attachments) {
              apiDataset.attachments.push({
                rid: String(attachment._id),
                title: attachment.title,
                description: attachment.description,
                created_at: attachment.created_at,
                last_modified: attachment.modified,
                published: attachment.published,
                url: `${scheme_diffusion}://${host_diffusion}:${port_diffusion}/${path_diffusion}files/${attachment._id}`
              })
            }
            for (let datafile of mongoDataset.datafiles) {
              let millesimesDatafile = JSON.parse(datafile.extras.datalake_millesimes_info)
              let apiDatafile = {
                rid: String(datafile._id),
                title: datafile.title,
                description: datafile.description,
                created_at: datafile.created_at,
                last_modified: datafile.modified,
                published: datafile.published,
                weburl: datafile.url,
                millesimes: []
              }
              if (datafile.extras.datalake_temporal_coverage_start || datafile.extras.datalake_temporal_coverage_end) {
                apiDatafile.temporal_coverage = {}
                if (datafile.extras.datalake_temporal_coverage_start) apiDatafile.temporal_coverage.start = datafile.extras.datalake_temporal_coverage_start
                if (datafile.extras.datalake_temporal_coverage_end) apiDatafile.temporal_coverage.end = datafile.extras.datalake_temporal_coverage_end
              }
              if (datafile.extras.datalake_legal_notice) apiDatafile.legal_notice = datafile.extras.datalake_legal_notice
              for (let i = 1; i < datafile.extras.datalake_millesimes + 1; i++) {
                let millesime = { millesime: i }
                millesime.rows = millesimesDatafile.find(info => info.millesime === i).rows
                millesime.columns = millesimesDatafile.find(info => info.millesime === i).columns.map(column => ( { name: column.name, description: column.description, filters: rowColumnsFilters[column.type], mapping: column.mapping, type: column.type } ))
                apiDatafile.millesimes.push(millesime)
              }
              apiDataset.datafiles.push(apiDatafile)
            }
            return apiDataset
          })
          return Array.isArray(mongoDatasets) ? convertedDatasets : convertedDatasets[0]
        }
        catch (error) {
          throw new transformErrors.MongoToDiffusionApiError(`Erreur de conversion de jeux de données`)
        }
      },
      datafiles: mongoDatafiles => {
        try {
          let datafilesToConvert = Array.isArray(mongoDatafiles) ? mongoDatafiles : [mongoDatafiles]
          let convertedDatafiles = datafilesToConvert.map( mongoDatafile => {
            let millesimesDatafile = JSON.parse(mongoDatafile.extras.datalake_millesimes_info)
            let apiDatafile = {
              rid: String(mongoDatafile._id),
              title: mongoDatafile.title,
              description: mongoDatafile.description,
              created_at: mongoDatafile.created_at,
              last_modified: mongoDatafile.modified,
              published: mongoDatafile.published,
              weburl: mongoDatafile.url,
              millesimes: [],
              dataset: {
                id: String(mongoDatafile.dataset._id),
                title: mongoDatafile.dataset.title,
                description: mongoDatafile.dataset.description,
                organization: {
                  id: String(mongoDatafile.dataset.organization._id),
                  title: mongoDatafile.dataset.organization.name,
                  description: mongoDatafile.dataset.organization.description,
                  acronym: mongoDatafile.dataset.organization.acronym
                },
                topic: mongoDatafile.dataset.extras.datalake_topic,
                license: mongoDatafile.dataset.license,
                frequency: mongoDatafile.dataset.frequency,
                created_at: mongoDatafile.dataset.created_at,
                last_modified: mongoDatafile.dataset.last_modified,
                last_update: mongoDatafile.dataset.last_update,
                attachments: []
              }
            }
            if (mongoDatafile.extras.datalake_temporal_coverage_start || mongoDatafile.extras.datalake_temporal_coverage_end) {
              apiDatafile.temporal_coverage = {}
              if (mongoDatafile.extras.datalake_temporal_coverage_start) apiDatafile.temporal_coverage.start = mongoDatafile.extras.datalake_temporal_coverage_start
              if (mongoDatafile.extras.datalake_temporal_coverage_end) apiDatafile.temporal_coverage.end = mongoDatafile.extras.datalake_temporal_coverage_end
            }
            if (mongoDatafile.extras.datalake_legal_notice) apiDatafile.legal_notice = mongoDatafile.extras.datalake_legal_notice
            for (let i = 1; i < mongoDatafile.extras.datalake_millesimes + 1; i++) {
              let millesime = { millesime: i }
              millesime.rows = millesimesDatafile.find(info => info.millesime === i).rows
              millesime.columns = millesimesDatafile.find(info => info.millesime === i).columns.map(column => ( { name: column.name, description: column.description, filters: rowColumnsFilters[column.type], mapping: column.mapping, type: column.type } ))
              apiDatafile.millesimes.push(millesime)
            }
            if (mongoDatafile.dataset.frequency_date) apiDatafile.dataset.frequency_date = mongoDatafile.dataset.frequency_date
            if (mongoDatafile.dataset.tags) apiDatafile.dataset.tags = mongoDatafile.dataset.tags
            if (mongoDatafile.dataset.spatial) apiDatafile.dataset.spatial = mongoDatafile.dataset.spatial
            if (mongoDatafile.dataset.temporal_coverage) apiDatafile.dataset.temporal_coverage = mongoDatafile.dataset.temporal_coverage
            if (apiDatafile.dataset.spatial && ('geom' in apiDatafile.dataset.spatial)) delete apiDatafile.dataset.spatial.geom
            if (mongoDatafile.dataset.extras.datalake_caution) apiDatafile.dataset.caution = mongoDatafile.dataset.extras.datalake_caution
            for (let attachment of mongoDatafile.dataset.attachments) {
              apiDatafile.dataset.attachments.push({
                rid: String(attachment._id),
                title: attachment.title,
                description: attachment.description,
                created_at: attachment.created_at,
                last_modified: attachment.modified,
                published: attachment.published,
                url: `${scheme_diffusion}://${host_diffusion}:${port_diffusion}/${path_diffusion}files/${attachment._id}`
              })
            }
            return apiDatafile
          })
          return Array.isArray(mongoDatafiles) ? convertedDatafiles : convertedDatafiles[0]
        }
        catch (error) {
          throw new transformErrors.MongoToDiffusionApiError(`Erreur de conversion de fichiers de données`)
        }
      },
      datafileMillesime: (mongoDatafile, millesime) => {
        try {
          let millesimesDatafile = JSON.parse(mongoDatafile.extras.datalake_millesimes_info)
          let apiDatafileMillesime = {
            rid: String(mongoDatafile._id),
            title: mongoDatafile.title,
            description: mongoDatafile.description,
            created_at: mongoDatafile.created_at,
            last_modified: mongoDatafile.modified,
            published: mongoDatafile.published,
            weburl: mongoDatafile.url + '?millesime=' + millesime,
            millesime: millesime,
            rows: millesimesDatafile.find(info => info.millesime === millesime).rows,
            columns: millesimesDatafile.find(info => info.millesime === millesime).columns.map(column => ( { name: column.name, description: column.description, filters: rowColumnsFilters[column.type], mapping: column.mapping, type: column.type } )),
            dataset: {
              id: String(mongoDatafile.dataset._id),
              title: mongoDatafile.dataset.title,
              description: mongoDatafile.dataset.description,
              organization: {
                id: String(mongoDatafile.dataset.organization._id),
                title: mongoDatafile.dataset.organization.name,
                description: mongoDatafile.dataset.organization.description,
                acronym: mongoDatafile.dataset.organization.acronym
              },
              topic: mongoDatafile.dataset.extras.datalake_topic,
              license: mongoDatafile.dataset.license,
              frequency: mongoDatafile.dataset.frequency,
              created_at: mongoDatafile.dataset.created_at,
              last_modified: mongoDatafile.dataset.last_modified,
              last_update: mongoDatafile.dataset.last_update,
              attachments: []
            }
          }
          if (mongoDatafile.extras.datalake_temporal_coverage_start || mongoDatafile.extras.datalake_temporal_coverage_end) {
            apiDatafileMillesime.temporal_coverage = {}
            if (mongoDatafile.extras.datalake_temporal_coverage_start) apiDatafileMillesime.temporal_coverage.start = mongoDatafile.extras.datalake_temporal_coverage_start
            if (mongoDatafile.extras.datalake_temporal_coverage_end) apiDatafileMillesime.temporal_coverage.end = mongoDatafile.extras.datalake_temporal_coverage_end
          }
          if (mongoDatafile.extras.datalake_legal_notice) apiDatafileMillesime.legal_notice = mongoDatafile.extras.datalake_legal_notice
          if (mongoDatafile.dataset.frequency_date) apiDatafileMillesime.dataset.frequency_date = mongoDatafile.dataset.frequency_date
          if (mongoDatafile.dataset.tags) apiDatafileMillesime.dataset.tags = mongoDatafile.dataset.tags
          if (mongoDatafile.dataset.spatial) apiDatafileMillesime.dataset.spatial = mongoDatafile.dataset.spatial
          if (mongoDatafile.dataset.temporal_coverage) apiDatafileMillesime.dataset.temporal_coverage = mongoDatafile.dataset.temporal_coverage
          if (apiDatafileMillesime.dataset.spatial && ('geom' in apiDatafileMillesime.dataset.spatial)) delete apiDatafileMillesime.dataset.spatial.geom
          if (mongoDatafile.dataset.extras.datalake_caution) apiDatafileMillesime.dataset.caution = mongoDatafile.dataset.extras.datalake_caution
          for (let attachment of mongoDatafile.dataset.attachments) {
            apiDatafileMillesime.dataset.attachments.push({
              rid: String(attachment._id),
              title: attachment.title,
              description: attachment.description,
              created_at: attachment.created_at,
              last_modified: attachment.modified,
              published: attachment.published,
              url: `${scheme_diffusion}://${host_diffusion}:${port_diffusion}/${path_diffusion}files/${attachment._id}`
            })
          }
          return apiDatafileMillesime
        }
        catch (error) {
          throw new transformErrors.MongoToDiffusionApiError(`Erreur de conversion de millesime d'un fichier de données`)
        }
      },
      rows: (mongoRows, datafileMillesimedColumns) => {
        return mongoRows.map( mongoRow => {
          let row = {}
          for (let columnName in mongoRow.toJSON()) {
            console.log(columnName)
            //let mapping = datafileMillesimedColumns.find(column => column.name === columnName).mapping.split('.')
            let temp = datafileMillesimedColumns.find(column => column.name === columnName)
            console.log(temp)
            //console.log(mapping)
            row[columnName] = "aaaa"
          }
          return row
        })
      }
    }
  },
}

module.exports = transform
