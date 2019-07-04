let rp = require('request-promise')
let { udata_base_url } = require('../../env')
let { udata: errors } = require('../errors')
let udata_api_url = udata_base_url + '/api/1'

let handleError = (error, defaultError) => {
  if (error.constructor.name === 'UdataNotFoundError') {
   return error
  }
  if (error.constructor.name === 'UdataServerError') {
   return error
  }
  return new errors[defaultError.type](defaultError.message)
}
let api = {
  licenses: {
    all: async () => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/licenses/`,
          rejectUnauthorized: false,
          method: 'GET',
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Problème interne: récupération de la liste des licences` })
      }
    },
    byId: async (value) => {
      try {
        let udataLicenses = await api.licenses.all()
        let udataLicense = udataLicenses.find(license => license.id === value)

        if (!udataLicense) throw new errors.NotFoundError(`Pas de licence avec l'id ${ value }`)
        return udataLicense
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: recherche d'une licence` })
      }
    }
  },
  zones: {
    search: async (search) => {
      try {
        let options = {
          url: `${ udata_api_url }/spatial/zones/suggest`,
          rejectUnauthorized: false,
          method: 'GET',
          qs: { q: search },
          json: true
        }
        return await rp(options).then(udataZones => Promise.all(udataZones.map(async (udataZone) => await api.zones.byId(udataZone.id))))
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: suggestion de zones` })
      }
    },
    byId: async (id) => {
      try {
        let options = {
          url: `${ udata_api_url }/spatial/zone/${ id }`,
          rejectUnauthorized: false,
          method: 'GET',
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        let defaultError = (error.statusCode === 404) ? { type: 'NotFoundError', message: `Pas de zone avec l'id ${ id }` } : { type: 'ServerError', message: `Erreur interne: recherche d'une zone` }
        throw handleError(error, defaultError)
      }
    }
  },
  organizations: {
    list: async () => {
      try {
        let options = {
          url: `${ udata_api_url }/organizations/`,
          rejectUnauthorized: false,
          method: 'GET',
          json: true
        }
        return await rp(options).then(result => result.data)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: liste des organisations` })
      }
    }
  },
  users: {
    me: async (apiKey) => {
      try {
        let options = {
          url: `${ udata_api_url }/me/`,
          rejectUnauthorized: false,
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        let defaultError = (error.statusCode === 401) ? { type: 'NotFoundError', message: `Pas d'utilisateur avec l'apiKey ${ apiKey }` } : { type: 'ServerError', message: `Erreur interne: utilisateur par apikey` }
        throw handleError(error, defaultError)
      }
    }
  },
  datasets: {
    my: async (apiKey) => {
      try {
        let options = {
          url: `${ udata_api_url }/me/org_datasets/`,
          rejectUnauthorized: false,
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
          json: true
        }
        return await rp(options).then(udataDatasets => udataDatasets.filter(udataDataset => !udataDataset.deleted))
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: liste des jeux de données d'un utilisateur` })
      }
    },
    new: async (apiKey, metadata) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/`,
          rejectUnauthorized: false,
          method: 'POST',
          headers: { 'X-API-KEY': apiKey },
          body: metadata,
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Création jeu de données` })
      }
    },
    byId: async (apiKey, id) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/${ id }/`,
          rejectUnauthorized: false,
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
          json: true
        }
        let dataset = await rp(options)
        if (dataset.deleted) throw new errors.NotFoundError(`Pas de jeu de données avec l'id ${ id }`)
        return dataset
      }
      catch (error) {
        let defaultError = (error.statusCode === 404) ? { type: 'NotFoundError', message: `Pas de jeu de données avec l'id ${ id }` } : { type: 'ServerError', message: `Erreur interne: jeu de données` }
        throw handleError(error, defaultError)
      }
    },
    update: async (apiKey, id, metadata) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/${ id }/`,
          rejectUnauthorized: false,
          method: 'PUT',
          headers: { 'X-API-KEY': apiKey },
          body: metadata,
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise à jour jeu de données` })
      }
    },
    delete: async (apiKey, id) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/${ id }/`,
          rejectUnauthorized: false,
          method: 'DELETE',
          headers: { 'X-API-KEY': apiKey },
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression jeu de données` })
      }
    }
  },
  attachments: {
    new: async (apiKey, datasetId, file, metadata) => {
      try {
        let resource = await api.resources.new.file(apiKey, datasetId, file.stream, file.name)
        metadata.rid = resource.id
        return await api.resources.update.metadata(apiKey, datasetId, resource.id, metadata)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Création Fichier Joint` })
      }
    },
    update: {
      metadata: async (apiKey, datasetId, attachmentRid, metadata) => {
        try {
          return await api.resources.update.metadata(apiKey, datasetId, attachmentRid, metadata)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise-à-jour metadata Fichier Joint` })
        }
      },
      file: async (apiKey, datasetId, attachmentRid, file, metadata) => {
        try {
          await api.resources.update.file(apiKey, datasetId, attachmentRid, file.stream, file.name)
          return await api.resources.update.metadata(apiKey, datasetId, attachmentRid, metadata)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise-à-jour fichier Fichier Joint` })
        }
      }
    },
    delete: async (apiKey, datasetId, attachmentRid) => {
      try {
        return await api.resources.delete(apiKey, datasetId, attachmentRid)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression Fichier Joint` })
      }
    }
  },
  datafiles: {
    new: async (apiKey, datasetId, datafileMetadata) => {
      try {
        let resource = await api.resources.new.api(apiKey, datasetId, datafileMetadata)
        datafileMetadata.rid = resource.id
        datafileMetadata.url = datafileMetadata.url + '/datafile/' + resource.id
        return await api.resources.update.metadata(apiKey, datasetId, resource.id, datafileMetadata)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Création Fichier de données` })
      }
    },
    millesimes: {
      add: async (apiKey, datasetId, datafileRid, rows, columns) => {
        try {
          let udataDatafile= await api.resources.get(apiKey, datasetId, datafileRid)
          let metadata = {
            rid: udataDatafile.rid,
            title: udataDatafile.title,
            description: udataDatafile.description,
            published: udataDatafile.published,
            extras: udataDatafile.extras,
            url: udataDatafile.url
          }
          let millesime =  metadata.extras.datalake_millesimes + 1
          metadata.extras.datalake_millesimes = millesime
          let millesimes_info = JSON.parse(udataDatafile.extras.datalake_millesimes_info)
          millesimes_info.push({ millesime: millesime, rows: rows, columns: columns })
          metadata.extras.datalake_millesimes_info = JSON.stringify(millesimes_info)
          return await api.resources.update.metadata(apiKey, datasetId, datafileRid, metadata)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise-à-jour metadata Fichier de données` })
        }
      },
      update: async (apiKey, datasetId, datafileRid, millesime, rows, columns) => {
        try {
          let udataDatafile= await api.resources.get(apiKey, datasetId, datafileRid)
          let metadata = {
            rid: datafileRid,
            title: udataDatafile.title,
            description: udataDatafile.description,
            published: udataDatafile.published,
            extras: udataDatafile.extras,
            url: udataDatafile.url
          }
          let millesimes_info = JSON.parse(udataDatafile.extras.datalake_millesimes_info)
          let indexMillesimeToReplaced = millesimes_info.findIndex(item => item.millesime === millesime)
          millesimes_info[indexMillesimeToReplaced] = { millesime: millesime, rows: rows, columns: columns }
          metadata.extras.datalake_millesimes_info = JSON.stringify(millesimes_info)
          return await api.resources.update.metadata(apiKey, datasetId, datafileRid, metadata)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise-à-jour metadata Fichier de données` })
        }
      }
    },
    update: {
      metadata: async (apiKey, datasetId, datafileRid, metadata) => {
        try {
          return await api.resources.update.metadata(apiKey, datasetId, datafileRid, metadata)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise-à-jour metadata Fichier de données` })
        }
      }
    },
    delete: async (apiKey, datasetId, datafileRid) => {
      try {
        return await api.resources.delete(apiKey, datasetId, datafileRid)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression Fichier Joint` })
      }
    }
  },
  resources: {
    new: {
      file: async (apiKey, datasetId, stream, name) =>  {
        try {
          let options = {
            url: `${ udata_api_url }/datasets/${ datasetId }/upload/`,
            rejectUnauthorized: false,
            method: 'POST',
            headers: { 'X-API-KEY': apiKey },
            formData: {
              file: { value: stream, options: { filename: name } }
            },
            json: true
          }
          return await rp(options)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Création Resource type File` })
        }
      },
      api: async (apiKey, datasetId, metadata) => {
        try {
          let options = {
            url: `${ udata_api_url }/datasets/${ datasetId }/resources/`,
            rejectUnauthorized: false,
            method: 'POST',
            headers: { 'X-API-KEY': apiKey },
            body: metadata,
            json: true
          }
          return await rp(options)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Création Resource type Api` })
        }
      }
    },
    get: async (apiKey, datasetId, resourceRid) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/${ datasetId }/resources/${ resourceRid }/`,
          rejectUnauthorized: false,
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
          json: true
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Resource` })
      }
    },
    update: {
      metadata: async (apiKey, datasetId, resourceRid, metadata) => {
        try {
          let options = {
            url: `${ udata_api_url }/datasets/${ datasetId }/resources/${ resourceRid }/`,
            rejectUnauthorized: false,
            method: 'PUT',
            headers: { 'X-API-KEY': apiKey },
            body: metadata,
            json: true
          }
          return await rp(options)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise à jour metadata Resource` })
        }
      },
      file: async (apiKey, datasetId, resourceRid, stream, name) =>  {
        try {
          let options = {
            url: `${ udata_api_url }/datasets/${ datasetId }/resources/${ resourceRid }/upload/`,
            rejectUnauthorized: false,
            method: 'POST',
            proxy: false,
            headers: { 'X-API-KEY': apiKey },
            formData: {
              file: { value: stream, options: { filename: name } }
            },
            json: true
          }

          return await rp(options)
        }
        catch (error) {
          throw handleError(error, { type: 'ServerError', message: `Erreur interne: Mise à jour fichier Resource` })
        }
      }
    },
    delete: async (apiKey, datasetId, resourceRid) => {
      try {
        let options = {
          url: `${ udata_api_url }/datasets/${ datasetId }/resources/${ resourceRid }/`,
          rejectUnauthorized: false,
          method: 'DELETE',
          headers: { 'X-API-KEY': apiKey },
        }
        return await rp(options)
      }
      catch (error) {
        throw handleError(error, { type: 'ServerError', message: `Erreur interne: Suppression Resource` })
      }
    }
  }
}

module.exports = api
