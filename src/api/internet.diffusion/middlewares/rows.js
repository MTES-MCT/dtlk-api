let mongoService = require('../../../services/mongodb/service')
let { api: apiErrors } = require('../../../services/errors')
let { toDiffusionApi: transformForApi } = require('../../../services/transform')
let filenamify = require('filenamify')
let { api_diffusion_internet: { exposed_url: apiUrl } } = require('../../../env')
let apiPublicUrl = `${ apiUrl.scheme }://${ apiUrl.host  }:${ apiUrl.port }/${ apiUrl.path }`

let setPaginationParams = criteria => {
  let pageSize = `&pageSize=${ criteria.pageSize }`
  let orderBy = criteria.orderBy ? `&orderBy=${ criteria.orderBy.join(',') }` : ''
  let columns = criteria.columns ? `&columns=${ criteria.columns.join(',') }` : ''
  return pageSize + orderBy + columns + criteria.stringFilters
}

module.exports = {
  streamCollection: async (req, res, next) => {
    try {
      let { data } = await mongoService.rows.get(res.locals.datafileMillesimed.rid, res.locals.datafileMillesimed.millesime)
      // file name
      let fileName = `${ res.locals.datafileMillesimed.title}_millesime_${ res.locals.datafileMillesimed.millesime}`
      // set header for a csv file
      res.set({ 'Content-Disposition': `attachment; filename="${ filenamify(fileName) }.json"`, 'Content-Type': 'text/json' })
      // write data to file
      res.write(JSON.stringify(data))
      // file end
      res.send()
    } catch (error) {
      res.write("Il y a eu une erreur dans la génération du fichier")
      res.send()
    }
  },
  paginate: async (req, res, next) => {
    try {

      let { total, rows } = await mongoService.rows.paginate(res.locals.datafileMillesimed.rid, res.locals.datafileMillesimed.millesime, res.locals.rowsPaginationCriteria)

      let params = setPaginationParams(res.locals.rowsPaginationCriteria)
      let firstPageNumber = 1
      let lastPageNumber = (total === 0 || res.locals.rowsPaginationCriteria.pageSize == 'all') ? 1 : Math.ceil(total / Number(res.locals.rowsPaginationCriteria.pageSize))
      let previousPageNumber = (res.locals.rowsPaginationCriteria.page > lastPageNumber) ? lastPageNumber : ((res.locals.rowsPaginationCriteria.page === firstPageNumber) ? 0 : (res.locals.rowsPaginationCriteria.page - 1))
      let nextPageNumber = (res.locals.rowsPaginationCriteria.page >= lastPageNumber) ? 0 : (res.locals.rowsPaginationCriteria.page + 1)

      res.locals.pagination = {
        total: total,
        data: rows,
        firstPage: `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileMillesimed.rid }?millesime=${ res.locals.datafileMillesimed.millesime }&page=${ firstPageNumber }${ params }`,
        previousPage: (previousPageNumber !== 0) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileMillesimed.rid }?millesime=${ res.locals.datafileMillesimed.millesime }&page=${ previousPageNumber }${ params }` : null,
        nextPage: (nextPageNumber !== 0) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileMillesimed.rid }?millesime=${ res.locals.datafileMillesimed.millesime }&page=${ nextPageNumber }${ params }` : null,
        lastPage: `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileMillesimed.rid }?millesime=${ res.locals.datafileMillesimed.millesime }&page=${ lastPageNumber }${ params }`
      }
      next()
    }
    catch (error) {
      next(error)
    }
  }
}
