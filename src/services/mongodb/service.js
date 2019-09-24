let mongoose = require('mongoose')
let udataConnection = require('./connection')('udata')
let hubConnection = require('./connection')('hub')
let { mongo: errors } = require('../errors')
let MongoTag = require('./hub/referentiel/tag')
let MongoNomencBilanenergie = require('./hub/nomenclature/bilanenergie')
let MongoNomencCsl_filiere = require('./hub/nomenclature/csl_filiere')
let MongoNomencCsl_operation = require('./hub/nomenclature/csl_operation')
let MongoLog = require('./hub/log')
let MongoUser = require('./udata/user')
let MongoJob = require('./hub/job')
let MongoMessage = require('./hub/message')
let MongoDataset = require('./udata/dataset')
let row = require('./hub/row')
let bcrypt = require('bcrypt-nodejs')

let handleError = (error, defaultError) => {
  if (error.constructor.name === 'MongoNotFoundError') {
   throw error
  }
  if (error.constructor.name === 'MongoServerError') {
   throw error
  }
  throw new errors[defaultError.type](defaultError.message)
}
let mongoService = {
  tags: {
    search: async (searchTerm, limit) => {
      try {
        searchTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        searchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        let regex = new RegExp(searchTerm, 'i')
        let tags = await MongoTag.find({})
        let matching = tags.filter(item => {
          if (regex.test(item.display.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) return true
          if (regex.test(item.value)) return true
          return false
        })
        if (limit === 0) return matching
        return matching.slice(0, limit)
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche mot-clés` })
      }
    },
    findAll: async () => {
      try {
        return await MongoTag.find({})
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche de la liste des mots clés` })
      }
    },
    byValue: async (value) => {
      try {
        return await MongoTag.findOne({ value: value })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Mot-clé` })
      }
    }
  },
  users: {
    checkCredentials: async (credentials) => {
      try {
        let mongoUser = await udataConnection.db.collection('user').findOne({ "email": credentials.email }, { "apikey": 1, "password": 1 })
        if (!mongoUser) throw new errors.NotFoundError(`Les identifiants fournis ne permettent pas de vous authentifier`)

        if (!bcrypt.compareSync(credentials.password, mongoUser.password)) throw new errors.NotFoundError(`Les identifiants fournis ne permettent pas de vous authentifier`)
        return mongoUser.apikey
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Authentification` })
      }
    },
    byId: async (id) => {
      try {
        let mongoUser = await MongoUser.findById(id)
        return mongoUser
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas d'utilisateur avec l'id ${ id }` })
      }
    }
  },
  datafiles: {
    millesime: {
      delete: async (rid, millesime) => {
        try {
          let MongoRow = row(`${ rid }_${ millesime }`)
          await MongoRow.dropCollection()
          return
        }
        catch (error) {
          handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression  millésime Fichier de données` })
        }
      }
    },
    delete: async (rid, millesimes, millesimesDatafile) => {
      try {
        let listMillesime = millesimesDatafile.reduce((accumulatorMillesimes, currentMillesime) => {
          accumulatorMillesimes.push(currentMillesime.millesime)
          return accumulatorMillesimes
        }, [])
        for (let i = 0; i < millesimes; i++) {
          let MongoRow = row(`${ rid }_${ listMillesime[i] }`)
          await MongoRow.dropCollection()
          return
        }
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression  Fichier de données` })
      }
    },
    paginate: async criteria => {
      try {
        let filter = { }
        if (criteria.text !== '') filter["$or"] = [ { title: {"$regex": criteria.text, "$options": "i"} }, { description: {"$regex": criteria.text, "$options": "i"} } ]

        let total = (await MongoDataset.aggregate([
          { '$match': { deleted: { "$exists": false } } },
          { '$project': {
            "dataset._id": "$_id",
            "dataset.organization": "$organization",
            "dataset.title": "$title",
            "dataset.description": "$description",
            "dataset.license": "$license",
            "dataset.tags": "$tags",
            "dataset.frequency": "$frequency",
            "dataset.frequency_date": "$frequency_date",
            "dataset.temporal_coverage": "$temporal_coverage",
            "dataset.spatial": "$spatial",
            "dataset.extras": "$extras",
            "dataset.created_at": "$created_at",
            "dataset.last_modified": "$last_modified",
            "dataset.attachments": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_attachment", true ] }
              }
            },
            "dataset.datafiles": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_datafile", true ] }
              }
            },
            _id: 0
          } },
          { '$unwind': '$dataset.datafiles' },
          { '$match': filter }
        ])).length

        let sort = {}
        for (let field of criteria.orderBy) {
          let isDesc = (field.substring(0,1) === '-') ? true : false
          let fieldName = isDesc ? field.substring(1) : field.substring(0)
          if (fieldName === 'last_modified') fieldName = 'modified'
          sort['dataset.datafiles.' + fieldName] = isDesc ? -1 : 1
        }

        let datafiles = await MongoDataset.aggregate([
          { '$match': { deleted: { "$exists": false } } },
          { '$project': {
            "dataset._id": "$_id",
            "dataset.organization": "$organization",
            "dataset.title": "$title",
            "dataset.description": "$description",
            "dataset.license": "$license",
            "dataset.tags": "$tags",
            "dataset.frequency": "$frequency",
            "dataset.frequency_date": "$frequency_date",
            "dataset.temporal_coverage": "$temporal_coverage",
            "dataset.spatial": "$spatial",
            "dataset.extras": "$extras",
            "dataset.created_at": "$created_at",
            "dataset.last_modified": "$last_modified",
            "dataset.attachments": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_attachment", true ] }
              }
            },
            "dataset.datafiles": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_datafile", true ] }
              }
            },
            _id: 0
          } },
          { '$unwind': '$dataset.datafiles' },
          { '$match': filter },
          { '$sort': sort },
          { '$skip': criteria.pageSize != 'all' ? Number(criteria.pageSize) * (criteria.page - 1): total * (criteria.page - 1) },
          { '$limit': criteria.pageSize != 'all' ? Number(criteria.pageSize) : total },
          { '$addFields': {
            _id: "$dataset.datafiles._id",
            title: "$dataset.datafiles.title",
            description: "$dataset.datafiles.description",
            url: "$dataset.datafiles.url",
            extras: "$dataset.datafiles.extras",
            created_at: "$dataset.datafiles.created_at",
            modified: "$dataset.datafiles.modified",
            published: "$dataset.datafiles.published",
          } },
          { '$project': { "dataset.datafiles": 0 } },
          { '$lookup': { from: 'organization', localField: 'dataset.organization', foreignField: '_id', as: 'dataset.organization' } },
          { '$unwind': '$dataset.organization' }
        ])

        return { total:total, datafiles: datafiles }
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: pagination des fichiers de données` })
      }
    },
    byRid: async rid => {
      try {
        let mongoDatafile = await MongoDataset.aggregate([
          { '$match': { deleted: { "$exists": false } } },
          { '$project': {
            "dataset._id": "$_id",
            "dataset.organization": "$organization",
            "dataset.title": "$title",
            "dataset.description": "$description",
            "dataset.license": "$license",
            "dataset.tags": "$tags",
            "dataset.frequency": "$frequency",
            "dataset.frequency_date": "$frequency_date",
            "dataset.temporal_coverage": "$temporal_coverage",
            "dataset.spatial": "$spatial",
            "dataset.extras": "$extras",
            "dataset.created_at": "$created_at",
            "dataset.last_modified": "$last_modified",
            "dataset.attachments": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_attachment", true ] }
              }
            },
            "dataset.datafiles": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_datafile", true ] }
              }
            },
            _id: 0
          } },
          { '$unwind': '$dataset.datafiles' },
          { '$match': { "dataset.datafiles._id": rid } },
          { '$addFields': {
            _id: "$dataset.datafiles._id",
            title: "$dataset.datafiles.title",
            description: "$dataset.datafiles.description",
            url: "$dataset.datafiles.url",
            extras: "$dataset.datafiles.extras",
            created_at: "$dataset.datafiles.created_at",
            modified: "$dataset.datafiles.modified",
            published: "$dataset.datafiles.published",
          } },
          { '$project': { "dataset.datafiles": 0 } },
          { '$lookup': { from: 'organization', localField: 'dataset.organization', foreignField: '_id', as: 'dataset.organization' } },
          { '$unwind': '$dataset.organization' }
        ])
        if (mongoDatafile.length === 0) throw new errors.NotFoundError(`Pas de fichier de données avec le rid ${ rid }`)
        return mongoDatafile[0]
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas de fichier de données avec le rid ${ rid }` })
      }
    }
  },
  logs: {
    dataset: {
      get: async (id) => {
        try {
          return await MongoLog.find({ 'dataset.id': mongoose.Types.ObjectId(id) })
        }
        catch (error) {
          handleError(error, { type: 'ServerError', message: `Erreur interne: Logs Fichier de données` })
        }
      },
      create: async (user, dataset) => {
        try {
          let log = new MongoLog({
            type: 'create_dataset',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      },
      update: async (user, dataset) => {
        try {
          let log = new MongoLog({
            type: 'update_dataset_metadata',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      },
      delete: async (user, dataset) => {
        try {
          let log = new MongoLog({
            type: 'delete_dataset',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      }
    },
    attachment: {
      get: async (id, rid) => {
        try {
          return await MongoLog.find({ 'dataset.id': mongoose.Types.ObjectId(id), 'attachment.rid': rid })
        }
        catch (error) {
          handleError(error, { type: 'ServerError', message: `Erreur interne: Logs Fichier de données` })
        }
      },
      create: async (user, dataset, attachment) => {
        try {
          let log = new MongoLog({
            type: 'add_attachment',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            attachment: { rid: attachment.rid, title: attachment.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      },
      update: {
        metadata: async (user, dataset, attachment) => {
          try {
            let log = new MongoLog({
              type: 'update_attachment_metadata',
              user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
              dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              attachment: { rid: attachment.rid, title: attachment.title },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        },
        file: async (user, dataset, attachment) => {
          try {
            let log = new MongoLog({
              type: 'update_attachment_file',
              user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
              dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              attachment: { rid: attachment.rid, title: attachment.title },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        }
      },
      delete: async (user, dataset, attachment) => {
        try {
          let log = new MongoLog({
            type: 'delete_attachment',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            attachment: { rid: attachment.rid, title: attachment.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      }
    },
    datafile: {
      get: async (id, rid) => {
        try {
          return await MongoLog.find({ 'dataset.id': mongoose.Types.ObjectId(id), 'datafile.rid': rid })
        }
        catch (error) {
          handleError(error, { type: 'ServerError', message: `Erreur interne: Logs Fichier de données` })
        }
      },
      create: async (user, dataset, datafile) => {
        try {
          let log = new MongoLog({
            type: 'add_datafile',
            user: { id:  mongoose.Types.ObjectId(user.id), name: user.name },
            dataset: { id:  mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            datafile: { rid: datafile.rid, title: datafile.title, millesime: 1 },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      },
      update: {
        metadata: async (user, dataset, datafile) => {
          try {
            let log = new MongoLog({
              type: 'update_datafile_metadata',
              user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
              dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              datafile: { rid: datafile.rid, title: datafile.title },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        }
      },
      millesime: {
        add: async (user, dataset, datafile, millesime) => {
          try {
            let log = new MongoLog({
              type: 'add_datafile_millesime',
              user: { id:  mongoose.Types.ObjectId(user.id), name: user.name },
              dataset: { id:  mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              datafile: { rid: datafile.rid, title: datafile.title, millesime: millesime },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        },
        update: async (user, dataset, datafile, millesime) => {
          try {
            let log = new MongoLog({
              type: 'update_datafile_millesime',
              user: { id: mongoose.Types.ObjectId(user.id), name: user.name },
              dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              datafile: { rid: datafile.rid, title: datafile.title, millesime: millesime },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        },
        delete: async (user, dataset, datafile, millesime) => {
          try {
            let log = new MongoLog({
              type: 'delete_datafile_millesime',
              user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
              dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
              datafile: { rid: datafile.rid, title: datafile.title, millesime: millesime },
              timestamp: new Date()
            })
            await log.save()
          }
          catch (error) {
            console.error(error)
          }
        }
      },
      delete: async (user, dataset, datafile) => {
        try {
          let log = new MongoLog({
            type: 'delete_datafile',
            user: { id: mongoose.Types.ObjectId(user.id), name: `${ user.first_name } ${user.last_name}` },
            dataset: { id: mongoose.Types.ObjectId(dataset.id), title: dataset.title },
            datafile: { rid: datafile.rid, title: datafile.title },
            timestamp: new Date()
          })
          await log.save()
        }
        catch (error) {
          console.error(error)
        }
      }
    }
  },
  rows: {
    exists: async collectionName => {
      for (let collection of await hubConnection.db.listCollections().toArray()) {
        if (collection.name === `rows_${ collectionName }`) return true
      }
      return false
    },
    paginate: async (rid, millesime, criteria) => {
      try {
        let MongoRow = row(`${ rid }_${ millesime }`)
        let datafileColumns = JSON.parse((await mongoService.datafiles.byRid(rid)).extras.datalake_millesimes_info).find(item => item.millesime === millesime).columns
        let project = { _id: 0 }
        if (criteria.columns) {
          criteria.columns.reduce((o, item) => {
            let mappingField = datafileColumns.find(column => column.name === item).mapping
            o[item] = '$' + mappingField
            return o
          }, project)
        }
        else {
          datafileColumns.reduce((o, item) => {
            o[item.name] = '$' + item.mapping
            return o
          }, project)
        }

        let sort = {}
        if (criteria.orderBy) {
          criteria.orderBy.reduce((o, item) => {
            let isDesc = (item.substring(0,1) === '-') ? true : false
            let columnName = isDesc ? item.substring(1) : item.substring(0)
            let mappingField = datafileColumns.find(column => column.name === columnName).mapping
            o[mappingField] = isDesc ? -1 : 1
            return o
          }, sort)
        }
        else {
          sort._id = 1
        }
        let total = await MongoRow.countDocuments(criteria.filters)
        let rows = await MongoRow.aggregate([
          { '$match': criteria.filters },
          { '$sort': sort },
          { '$project': project },
          { '$skip': criteria.pageSize != 'all' ? Number(criteria.pageSize) * (criteria.page - 1): total * (criteria.page - 1) },
          { '$limit': criteria.pageSize != 'all' ? Number(criteria.pageSize) : total }
        ])

        return { total: total, rows: rows }
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: pagination des données` })
      }
    },
    cursor: async (rid, millesime, criteria) => {
      try {
        let MongoRow = row(`${ rid }_${ millesime }`)
        let datafileColumns = JSON.parse((await mongoService.datafiles.byRid(rid)).extras.datalake_millesimes_info).find(item => item.millesime === millesime).columns
        let project = { _id: 0 }
        if (criteria.columns) {
          criteria.columns.reduce((o, item) => {
            let mappingField = datafileColumns.find(column => column.name === item).mapping
            o[item] = '$' + mappingField
            return o
          }, project)
        }
        else {
          datafileColumns.reduce((o, item) => {
            o[item.name] = '$' + item.mapping
            return o
          }, project)
        }

        let sort = {}
        if (criteria.orderBy) {
          criteria.orderBy.reduce((o, item) => {
            let isDesc = (item.substring(0,1) === '-') ? true : false
            let columnName = isDesc ? item.substring(1) : item.substring(0)
            let mappingField = datafileColumns.find(column => column.name === columnName).mapping
            o[mappingField] = isDesc ? -1 : 1
            return o
          }, sort)
        }
        else {
          sort._id = 1
        }

        return MongoRow.aggregate([
          { '$match': criteria.filters },
          { '$sort': sort },
          { '$project': project }
        ]).allowDiskUse(true).cursor({ batchSize: 10000 }).exec()
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: récupération curseur de données` })
      }
    }
  },
  jobs: {
    byRedisId: async redisId => {
      try {
        return await MongoJob.findOne({ idredis: redisId })
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas de tâche avec l'id ${ redisId }` })
      }
    },
    byUser: async userId => {
      try {
        return await MongoJob.find({ owner: mongoose.Types.ObjectId(userId) })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Récupération tâche d'un utilisateur` })
      }
    },
    remove: {
      ofDatafileMillesime: async (rid, millesime) => {
        try {
          await MongoJob.remove( { "data.datafile_rid": rid, "data.datafile_millesime": millesime })
          await MongoJob.remove( { "result.rid": rid, "result.millesime": millesime })
        }
        catch (error) {
          console.error(error)
        }
      },
      ofDatafile: async rid => {
        try {
          await MongoJob.remove( { "data.datafile_rid": rid })
          await MongoJob.remove( { "result.rid": rid })
        }
        catch (error) {
          console.error(error)
        }
      },
      ofDataset: async id => {
        try {
          await MongoJob.remove( { "data.dataset_id": id })
        }
        catch (error) {
          console.error(error)
        }
      }
    }
  },
  messages: {
    byOwner: async ownerId => {
      try {
        return await MongoMessage.find({ owner: mongoose.Types.ObjectId(ownerId) })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Récupération messages d'un utilisateur` })
      }
    },
    create: async data => {
      try {
        let message = new MongoMessage(data)
        return await message.save()
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Création message` })
      }
    },
    get: async id => {
      try {
        let mongoMessage = await MongoMessage.findById(id)
        if (!mongoMessage) throw new errors.NotFoundError(`Pas de message avec l'id ${ id }`)
        return mongoMessage
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas de message avec l'id ${ id }` })
      }
    },
    delete: async id => {
      try {
        await MongoMessage.findByIdAndDelete(id)
        return
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression message` })
      }
    },
    update: async (id, data) => {
      try {
        return await MongoMessage.findByIdAndUpdate(id, data, { new: true })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Marquage statut lecture message` })
      }
    }
  },
  datasets: {
    paginate: async criteria => {
      try {
        let filter = { deleted: { "$exists": false } }
        if (criteria.text !== '') filter["$or"] = [ { title: {"$regex": criteria.text, "$options": "i"} }, { description: {"$regex": criteria.text, "$options": "i"} } ]
        if (criteria.topics) filter["extras.datalake_topic"] = { "$in": criteria.topics }
        if (criteria.tags) filter.tags = { "$in": criteria.tags }
        if (criteria.licenses) filter.license = { "$in": criteria.licenses }
        if (criteria.organizations) filter.organization = { "$in": criteria.organizations }
        if (criteria.minLastModified || criteria.maxLastModified) {
          filter.last_modified = {}
          if (criteria.minLastModified) filter.last_modified["$gte"] = criteria.minLastModified
          if (criteria.maxLastModified) filter.last_modified["$lte"] = criteria.maxLastModified
        }

        let sort = {}
        for (let field of criteria.orderBy) {
          let isDesc = (field.substring(0,1) === '-') ? true : false
          let fieldName = isDesc ? field.substring(1) : field.substring(0)
          if (fieldName === 'topic') fieldName = 'extras.datalake_topic'
          sort[fieldName] = isDesc ? -1 : 1
        }

        let total = await MongoDataset.countDocuments(filter)

        let datasets = criteria.pageSize != 'all' ?
        (await MongoDataset
          .find(filter)
          .populate({ path: 'organization' })
          .sort(sort)
          .skip(Number(criteria.pageSize) * (criteria.page - 1))
          .limit(Number(criteria.pageSize))
          .lean(true)
          ) : 
          (await MongoDataset
            .find(filter)
            .populate({ path: 'organization' })
            .sort(sort)
            .skip(total * (criteria.page - 1))
            .lean(true)
          )

        for (let dataset of datasets) {
          dataset.attachments = dataset.resources.filter(resource => resource.extras.datalake_attachment === true)
          dataset.datafiles = dataset.resources.filter(resource => resource.extras.datalake_datafile === true)
          delete dataset.resources
        }

        return { total:total, datasets: datasets }
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: pagination des jeux de données` })
      }
    },
    facets: async criteria => {
      try {
        let filter = { deleted: { "$exists": false } }
        if (criteria.text !== '') filter["$or"] = [ { title: {"$regex": criteria.text, "$options": "i"} }, { description: {"$regex": criteria.text, "$options": "i"} } ]
        if (criteria.minLastModified || criteria.maxLastModified) {
          filter.last_modified = {}
          if (criteria.minLastModified) filter.last_modified["$gte"] = criteria.minLastModified
          if (criteria.maxLastModified) filter.last_modified["$lte"] = criteria.maxLastModified
        }

        let facets = await MongoDataset.aggregate([{
          "$match": filter
        }, {
          "$facet": {
            "byTags": [
              { "$unwind": "$tags" },
              { "$sortByCount": "$tags" }
            ],
            "byOrganizations": [
              { "$sortByCount": "$organization" },
              { "$lookup": { from: "organization", localField: "_id", foreignField: "_id", as: "organization" } },
              { "$unwind": "$organization" },
              { "$project": { _id: 0, value: "$_id", display: "$organization.name", count: 1 } },
            ],
            "byLicenses": [
              { "$sortByCount": "$license" },
              { "$lookup": { from: "license", localField: "_id", foreignField: "_id", as: "license" } },
              { "$unwind": "$license" },
              { "$project": { _id: 0, value: "$_id", display: "$license.title", count: 1 } },
            ],
            "byTopics": [
              { "$project": { topic: "$extras.datalake_topic"} },
              { "$sortByCount": "$topic" },
              { "$project": { _id: 0, value: "$_id", display: "$_id", count: 1 } }
            ]
          }
        }])

        facets[0].byTags = await Promise.all(facets[0].byTags.map( async tag => ({
          value: tag._id,
          display: (await mongoService.tags.byValue(tag._id)).display,
          count: tag.count
        })))
        return facets[0]
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Facettes Jeux de données` })
      }
    },
    byId: async id => {
      try {
        let mongoDataset = await MongoDataset.findById(id).populate({ path: 'organization' }).lean(true)
        if (!mongoDataset) throw new errors.NotFoundError(`Pas de jeu de données avec l'id ${ id }`)
        mongoDataset.attachments = mongoDataset.resources.filter(resource => resource.extras.datalake_attachment === true)
        mongoDataset.datafiles = mongoDataset.resources.filter(resource => resource.extras.datalake_datafile === true)
        delete mongoDataset.resources
        return mongoDataset
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas de jeu de données avec l'id ${ id }` })
      }
    }
  },
  attachments: {
    byRid: async rid => {
      try {
        let mongoAttachment = await MongoDataset.aggregate([
          { '$match': { deleted: { "$exists": false } } },
          { '$project': {
            "dataset.attachments": {
              $filter: {
               input: "$resources",
                as: "resource",
                cond: { $eq: [ "$$resource.extras.datalake_attachment", true ] }
              }
            },
            _id: 0
          } },
          { '$unwind': '$dataset.attachments' },
          { '$match': { "dataset.attachments._id": rid } },
          { '$addFields': {
            _id: "$dataset.attachments._id",
            title: "$dataset.attachments.title",
            description: "$dataset.attachments.description",
            url: "$dataset.attachments.url",
            extras: "$dataset.attachments.extras",
            created_at: "$dataset.attachments.created_at",
            modified: "$dataset.attachments.modified",
            published: "$dataset.attachments.published",
          } },
          { '$project': { "dataset.attachments": 0 } }
        ])
        if (mongoAttachment.length === 0) throw new errors.NotFoundError(`Pas de fichier joint avec le rid ${ rid }`)
        return mongoAttachment[0]
      }
      catch (error) {
        handleError(error, { type: 'NotFoundError', message: `Pas de fichier joint avec le rid ${ rid }` })
      }
    }
  },
  nomenclatures: { 
    list: async () => {
      try {
        let bilanEnergie = await MongoNomencBilanenergie.find({})
        let csl_filiere = await MongoNomencCsl_filiere.find({})
        let csl_operation = await MongoNomencCsl_operation.find({})
        let nomenclatures = { bilanEnergie : bilanEnergie, csl_filiere: csl_filiere, csl_operation: csl_operation }
        return nomenclatures
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: Recherche de la liste des nomenclatures` })
      }
    },

  }
}

module.exports = mongoService
