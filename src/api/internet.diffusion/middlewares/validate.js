let BaseJoi = require('joi')
let Extension = require('joi-date-extensions')
let Joi = BaseJoi.extend(Extension)
let { params, query, headers, body } = require('express-joi-validation')({ passError: true })
let rowColumns = require('../../../models/rowColumns')
let { api: apiErrors } = require('../../../services/errors')

let datasetsDefaultFilter = {
  text: Joi.string().empty().default('')
    .label('querystring.text')
    .error( errors => ( { message: `Le champ "text" lorsqu'il est utilisé ne peut pas être vide` } ) ),
  minLastModified: Joi.date().iso().optional()
    .label('querystring.minLastModified')
    .error( errors => ( { message: `Le champ "minLastModified" lorsqu'il est utilisé doit être une date valide (format ISO 8601)` } ) ),
  maxLastModified: Joi.date().iso().optional()
    .label('querystring.maxLastModified')
    .error( errors => ( { message: `Le champ "maxLastModified" lorsqu'il est utilisé doit être une date valide (format ISO 8601)` } ) )
}
let datasetsPaginationFilter = {
  topics: Joi.array().items(Joi.string()).single().optional()
    .label('querystring.topics')
    .error( errors => ( { message: `Le champ "topics" lorsqu'il est utilisé ne peut pas être vide` } ) ),
  tags: Joi.array().items(Joi.string()).single().optional()
    .label('querystring.tags')
    .error( errors => ( { message: `Le champ "tags" lorsqu'il est utilisé ne peut pas être vide` } ) ),
  licenses: Joi.array().items(Joi.string()).single().optional()
    .label('querystring.licenses')
    .error( errors => ( { message: `Le champ "licenses" lorsqu'il est utilisé ne peut pas être vide` } ) ),
  organizations: Joi.array().items(Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)).single().optional()
    .label('querystring.organizations')
    .error( errors => ( { message:`Le champ "organizations" lorsqu'il est utilisé ne peut pas être vide et doit contenir des valeurs au format des ObjectId mongo` } ) )
}
let datasetsPagination = {
  page: Joi.number().greater(0).integer().required()
    .label('querystring.page')
    .error( errors => ( { message: 'Le champ "page" est requis et doit être un entier strictement positif' } ) ),
  pageSize: Joi.number().integer().valid([10, 20 ,50 ,100]).required()
    .label('querystring.pageSize')
    .error( errors => ( { message: 'Le champ "pageSize" est requis et doit avoir une des valeurs autorisées (10, 20, 50, 100)' } ) ),
  orderBy: Joi.array().items(Joi.string().valid('title','-title','last_modified','-last_modified')).single().optional().default(['-last_modified'])
    .label('querystring.orderBy')
    .error( errors => ( { message: `Le champ "orderBy" lorsqu'il est utilisé doit contenir une ou plusieurs des valeurs autorisées ('title','-title','last_modified','-last_modified')` } ) )
}
let datasetId = {
  id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    .label('path.id')
    .error( errors => ( { message: `Le champ id de l'url doit être rempli et être au format des ObjectId mongo` } ) )
}
let datafilesPaginationFilter = {
  text: Joi.string().empty().default('')
    .label('querystring.text')
    .error( errors => ( { message: `Le champ "text" lorsqu'il est utilisé ne peut pas être vide` } ) )
}
let datafilesPagination = {
  page: Joi.number().greater(0).integer().required()
    .label('querystring.page')
    .error( errors => ( { message: `Le champ "page" est requis et doit être un entier strictement positif` } ) ),
  pageSize: Joi.number().integer().valid([10,20,50,100]).required()
    .label('querystring.pageSize')
    .error( errors => ( { message: `Le champ "pageSize" est requis et doit avoir une des valeurs autorisées (20, 50, 100)` } ) ),
  orderBy: Joi.array().items(Joi.string().valid('title','-title','last_modified','-last_modified')).single().optional().default(['-last_modified'])
    .label('querystring.orderBy')
    .error( errors => ( { message: `Le champ "orderBy" lorsqu'il est utilisé doit contenir une ou plusieurs des valeurs autorisées ('title','-title','last_modified','-last_modified')` } ) )
}
let datafileRid = {
  rid: Joi.string().required().guid()
    .label('path.rid')
    .error( errors => ( { message: `Le champ rid de l'url doit être rempli et doit être au format guid` } ) )
}
let datafileMillesime = {
  millesime: Joi.date().format('YYYY-MM')
    .label('querystring.millesime')
    .error( errors => ( { message: `Le champ "millesime" lorqu'il est utilisé doit être une date valide - format YYYY-MM` } ) )
}
let rowsPagination = columns => {
  let selectables = columns.map(column => column.name)
  let orderables = [...columns.map(column => column.name), ...columns.map(column => `-${ column.name }`)]

  return {
    page: Joi.number().greater(0).integer().required()
      .label('querystring.page')
      .error( errors => ( { message: `Le champ "page" est requis et doit être un entier strictement positif` } ) ),
    pageSize: Joi.number().integer().valid([10, 20, 50, 100]).required()
      .label('querystring.pageSize')
      .error( errors => ( { message: `Le champ "pageSize" est requis et doit avoir une des valeurs autorisées (20, 50, 100)` } ) ),
    orderBy: Joi.array().items(Joi.string().valid(orderables)).single().optional()
      .label('querystring.orderBy')
      .error( errors => ( { message: `Le champ "orderBy" ne doit comporter que des colonnes autorisées ${ orderables.join(', ') }` } ) ),
    columns: Joi.array().items(Joi.string().valid(selectables)).single().optional()
      .label('querystring.columns')
      .error( errors => ( { message: `Le champ "columns" ne doit comporter que des colonnes autorisées ${ selectables.join(', ') }` } ) )
  }
}
let csvOptions = columns => {
  let selectables = columns.map(column => column.name)
  let orderables = [...columns.map(column => column.name), ...columns.map(column => `-${ column.name }`)]

  return {
    withColumnName: Joi.boolean().required()
      .label('querystring.withColumnName ')
      .error( errors => ( { message: 'Le champ "withColumnName " est requis et doit être égal à true ou false' } ) ),
    withColumnDescription: Joi.boolean().required()
      .label('querystring.withColumnDescription ')
      .error( errors => ( { message: 'Le champ "withColumnDescription " est requis et doit être égal à true ou false' } ) ),
    withColumnUnit: Joi.boolean().required()
      .label('querystring.withColumnUnit ')
      .error( errors => ( { message: 'Le champ "withColumnUnit " est requis et doit être égal à true ou false' } ) ),
    orderBy: Joi.array().items(Joi.string().valid(orderables)).single().optional()
      .label('querystring.orderBy')
      .error( errors => ( { message: `Le champ "orderBy" ne doit comporter que des colonnes autorisées ${ orderables.join(', ') }` } ) ),
    columns: Joi.array().items(Joi.string().valid(selectables)).single().optional()
      .label('querystring.columns')
      .error( errors => ( { message: `Le champ "columns" ne doit comporter que des colonnes autorisées ${ selectables.join(', ') }` } ) )
  }
}
let rowsFilter = async (req, res, next) => {
  try {
    req.query.filters = {}
    req.query.stringFilters = ``
    let oColumns = res.locals.datafileMillesimed.columns.reduce( (o, column) => {
      o[column.name] = column
      return o
    }, {})
    for (let fieldName in oColumns) {
      let column = oColumns[fieldName]
      let stringFieldFilter = ``
      for (let typeFilter in (req.query[fieldName] || {})) {
        if (!column.filters.includes(typeFilter)) throw new apiErrors.ValidationError(`Le filtre ${ typeFilter } n'est pas valide pour le champ ${ fieldName } (liste des filtres autorisés: ${ column.filters.join(', ') })`)
        req.query.filters[column.mapping] = rowColumns.getFilterForMongo(column.type, typeFilter, req.query[fieldName][typeFilter])
        stringFieldFilter = `&${ fieldName }=${ typeFilter }:${ req.query[fieldName][typeFilter].join(',') }`
      }
      req.query.stringFilters = req.query.stringFilters + stringFieldFilter
      delete req.query[fieldName]
    }
    next()
  }
  catch (error) {
    next(error)
  }
}
let attachmentRid = {
  rid: Joi.string().required().guid()
    .label('path.rid')
    .error( errors => ( { message: `Le champ rid de l'url doit être rempli et doit être au format guid` } ) )
}

module.exports = {
  datasetsPaginationInQuery: [
    query({ ...datasetsPagination, ...datasetsPaginationFilter, ...datasetsDefaultFilter }),
    (req, res, next) => {
      res.locals.datasetsPaginationCriteria = req.query
      next()
    }
  ],
  datasetsFacetFilterInQuery: [
    query(datasetsDefaultFilter),
    (req, res, next) => {
      res.locals.datasetsFilterCriteria = req.query
      next()
    }
  ],
  datasetIdInPath: [
    params(datasetId),
    (req, res, next) => {
      res.locals.datasetId = req.params.id
      next()
    }
  ],
  datafilesPaginationInQuery: [
    query({ ...datafilesPagination, ...datafilesPaginationFilter }),
    (req, res, next) => {
      res.locals.datafilesPaginationCriteria = req.query
      next()
    }
  ],
  datafileRidInPath: [
    params(datafileRid),
    (req, res, next) => {
      res.locals.datafileRid = req.params.rid
      next()
    }
  ],
  datafileMillesimeInQuery: [
    query(datafileMillesime, { joi: { allowUnknown: true } }),
    (req, res, next) => {
      res.locals.datafileMillesime = req.query.millesime
      next()
    }
  ],
  rowsPaginationInQuery: [
    (req, res, next) => query(rowsPagination(res.locals.datafileMillesimed.columns), { joi: { allowUnknown: true } })(req, res, next),
    rowsFilter,
    (req, res, next) => {
      res.locals.rowsPaginationCriteria = req.query
      next()
    }
  ],
  csvOptionsInQuery: [
    (req, res, next) => query(csvOptions(res.locals.datafileMillesimed.columns), { joi: { allowUnknown: true } })(req, res, next),
    rowsFilter,
    (req, res, next) => {
      res.locals.csvCriteria = req.query
      next()
    }
  ],
  attachmentRidInPath: [
    params(attachmentRid),
    (req, res, next) => {
      res.locals.attachmentRid = req.params.rid
      next()
    }
  ],
}
