let mongoService = require('../../../services/mongodb/service')
let { api: apiErrors } = require('../../../services/errors')
let { toDiffusionApi: transformForApi } = require('../../../services/transform')
let { api_diffusion_internet: { exposed_url: apiUrl } } = require('../../../env')
let apiPublicUrl = `${ apiUrl.scheme }://${ apiUrl.host  }:${ apiUrl.port }/${ apiUrl.path }`

let setPaginationParams = criteria => {
  let pageSize = `&pageSize=${ criteria.pageSize }`
  let orderBy = criteria.orderBy ? `&orderBy=${ criteria.orderBy.join(',') }` : ''
  let text = (criteria.text !== '') ? `&text=${ criteria.text }` : ''
  let topics = criteria.topics ? `&topics=${ criteria.topics }` : ''
  let tags = criteria.tags ? `&tags=${ criteria.tags }` : ''
  let licenses = criteria.licenses ? `&licenses=${ criteria.licenses }` : ''
  let organizations = criteria.organizations ? `&organizations=${ criteria.organizations }` : ''
  let minLastModified = criteria.minLastModified ? `&minLastModified=${ criteria.minLastModified.toISOString() }` : ''
  let maxLastModified = criteria.maxLastModified ? `&maxLastModified=${ criteria.maxLastModified.toISOString() }` : ''
  return pageSize + orderBy + text + topics + tags + licenses + organizations + minLastModified + maxLastModified
}

module.exports = {
  paginate: async (req, res, next) => {
    try {
      let { total, datasets } = await mongoService.datasets.paginate(res.locals.datasetsPaginationCriteria)

      let params = setPaginationParams(res.locals.datasetsPaginationCriteria)
      let firstPageNumber = 1
      let lastPageNumber = (total === 0) ? 1 : Math.ceil(total / res.locals.datasetsPaginationCriteria.pageSize)
      let previousPageNumber = (res.locals.datasetsPaginationCriteria.page > lastPageNumber) ? lastPageNumber : ((res.locals.datasetsPaginationCriteria.page === firstPageNumber) ? 0 : (res.locals.datasetsPaginationCriteria.page - 1))
      let nextPageNumber = (res.locals.datasetsPaginationCriteria.page >= lastPageNumber) ? 0 : (res.locals.datasetsPaginationCriteria.page + 1)

      res.locals.pagination = {
        total: total,
        data: await transformForApi.mongo.datasets(datasets),
        firstPage: `${ apiPublicUrl }v1/datasets?page=${ firstPageNumber }${ params }`,
        previousPage: (previousPageNumber !== 0) ? `${ apiPublicUrl }v1/datasets?page=${ previousPageNumber }${ params }` : null,
        nextPage: (nextPageNumber !== 0) ? `${ apiPublicUrl }v1/datasets?page=${ nextPageNumber }${ params }` : null,
        lastPage: `${ apiPublicUrl }v1/datasets?page=${ lastPageNumber }${ params }`
      }
      next()
    }
    catch (error) {
      next(error)
    }
  },
  facets: async (req, res, next) => {
    try {
      res.locals.datasetsFacets = await mongoService.datasets.facets(res.locals.datasetsFilterCriteria)
      next()
    } catch (error) {
      next(error)
    }
  },
  get: async (req, res, next) => {
    try {
      let mongoDataset = await mongoService.datasets.byId(res.locals.datasetId)
      res.locals.dataset = await transformForApi.mongo.datasets(mongoDataset)
      return next()
    } catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Pas de jeu de données avec l'id ${ res.locals.datasetId }`))
      next(error)
    }
  }
}
