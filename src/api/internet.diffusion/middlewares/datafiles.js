let mongoService = require('../../../services/mongodb/service')
let { api: apiErrors } = require('../../../services/errors')
let { toDiffusionApi: transformForApi } = require('../../../services/transform')
let { api_diffusion_internet: { exposed_url: apiUrl } } = require('../../../env')
let apiPublicUrl = `${ apiUrl.scheme }://${ apiUrl.host  }:${ apiUrl.port }/${ apiUrl.path }`

let setPaginationParams = criteria => {
  let pageSize = `&pageSize=${ criteria.pageSize }`
  let orderBy = criteria.orderBy ? `&orderBy=${ criteria.orderBy.join(',') }` : ''
  let text = (criteria.text !== '') ? `&text=${ criteria.text }` : ''
  return pageSize + orderBy + text
}

module.exports = {
  paginate: async (req, res, next) => {
    try {
      let { total, datafiles } = await mongoService.datafiles.paginate(res.locals.datafilesPaginationCriteria)

      let params = setPaginationParams(res.locals.datafilesPaginationCriteria)
      let firstPageNumber = 1
      let lastPageNumber = (total === 0) ? 1 : Math.ceil(total / res.locals.datafilesPaginationCriteria.pageSize)
      let previousPageNumber = (res.locals.datafilesPaginationCriteria.page > lastPageNumber) ? lastPageNumber : ((res.locals.datafilesPaginationCriteria.page === firstPageNumber) ? 0 : (res.locals.datafilesPaginationCriteria.page - 1))
      let nextPageNumber = (res.locals.datafilesPaginationCriteria.page >= lastPageNumber) ? 0 : (res.locals.datafilesPaginationCriteria.page + 1)

      res.locals.pagination = {
        total: total,
        data: await transformForApi.mongo.datafiles(datafiles),
        firstPage: `${ apiPublicUrl }v1/datafiles?page=${ firstPageNumber }${ params }`,
        previousPage: (previousPageNumber !== 0) ? `${ apiPublicUrl }v1/datafiles?page=${ previousPageNumber }${ params }` : null,
        nextPage: (nextPageNumber !== 0) ? `${ apiPublicUrl }v1/datafiles?page=${ nextPageNumber }${ params }` : null,
        lastPage: `${ apiPublicUrl }v1/datafiles?page=${ lastPageNumber }${ params }`
      }
      next()
    }
    catch (error) {
      next(error)
    }
  },
  millesimed: async (req, res, next) => {
    try {
      let mongoDatafile = await mongoService.datafiles.byRid(res.locals.datafileRid)
      res.locals.datafileMillesime = res.locals.datafileMillesime ? res.locals.datafileMillesime : mongoDatafile.extras.datalake_millesimes
      if (res.locals.datafileMillesime > mongoDatafile.extras.datalake_millesimes) return next(new apiErrors.NotFoundError(`Le millésime ${ res.locals.datafileMillesime } n'existe pas pour le fichier de données avec le rid ${ res.locals.datafileRid }`))
      res.locals.datafileMillesimed = await transformForApi.mongo.datafileMillesime(mongoDatafile, res.locals.datafileMillesime)
      res.locals.datafileMillesimed.previous_millesime_href = (res.locals.datafileMillesime > 1) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileRid }?millesime=${ res.locals.datafileMillesime - 1 }` : null
      res.locals.datafileMillesimed.next_millesime_href = (res.locals.datafileMillesime < mongoDatafile.extras.datalake_millesimes) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileRid }?millesime=${ res.locals.datafileMillesime + 1 }` : null
      return next()
    } catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Pas de fichier de données avec le rid ${ res.locals.datafileRid }`))
      next(error)
    }
  }
}
