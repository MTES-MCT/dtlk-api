let mongoService = require('../../../services/mongodb/service')
let moment = require('moment-timezone')
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
      let lastPageNumber = (total === 0 || res.locals.datafilesPaginationCriteria.pageSize == 'all') ? 1 : Math.ceil(total / Number(res.locals.datafilesPaginationCriteria.pageSize))
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
      let millesimesInfo = JSON.parse(mongoDatafile.extras.datalake_millesimes_info)
      let listMillesime = millesimesInfo.reduce((accumulatorMillesimes, currentMillesime) => {
        if(currentMillesime.date_diffusion === moment(new Date()).format('YYYY-MM-DD')){
          if(currentMillesime.heure_diffusion <= moment(new Date()).format('HH:mm')){
            accumulatorMillesimes.push(currentMillesime.millesime)
          }
        }
        if(currentMillesime.date_diffusion < moment(new Date()).format('YYYY-MM-DD')){
            accumulatorMillesimes.push(currentMillesime.millesime)
          
        }
        if(!(currentMillesime.date_diffusion) && !(currentMillesime.heure_diffusion)){
            accumulatorMillesimes.push(currentMillesime.millesime)
          }
          return accumulatorMillesimes
        }, [])
      
      res.locals.datafileMillesime = res.locals.datafileMillesime ? moment(res.locals.datafileMillesime).format('YYYY-MM') : listMillesime[mongoDatafile.extras.datalake_millesimes - 1]
      if (!listMillesime.includes(res.locals.datafileMillesime)) return next(new apiErrors.NotFoundError(`Le millésime ${ res.locals.datafileMillesime } n'existe pas pour le fichier de données avec le rid ${ res.locals.datafileRid }`))
      res.locals.datafileMillesimed = await transformForApi.mongo.datafileMillesime(mongoDatafile, res.locals.datafileMillesime)
      res.locals.datafileMillesimed.previous_millesime_href = ((listMillesime.indexOf(res.locals.datafileMillesime) + 1) > 1) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileRid }?millesime=${ listMillesime[listMillesime.indexOf(res.locals.datafileMillesime) - 1] }` : null
      res.locals.datafileMillesimed.next_millesime_href = ((listMillesime.indexOf(res.locals.datafileMillesime) + 1) < listMillesime.lenght) ? `${ apiPublicUrl }v1/datafiles/${ res.locals.datafileRid }?millesime=${ listMillesime[listMillesime.indexOf(res.locals.datafileMillesime) + 1] }` : null
      return next()
    } catch (error) {
      if (error.constructor.name === 'MongoNotFoundError') return next(new apiErrors.NotFoundError(`Pas de fichier de données avec le rid ${ res.locals.datafileRid }`))
      next(error)
    }
  }
}
