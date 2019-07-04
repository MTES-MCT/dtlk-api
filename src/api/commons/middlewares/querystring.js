let { api: apiErrors } = require('../../../services/errors')

module.exports = {
  explodeCommas: fields => (req, res, next) => {
    try {
      for (let field of fields) {
        if (req.query[field]) req.query[field] = req.query[field].split(',')
      }
      return next()
    } catch (error) {
      return next(error)
    }
  },
  explodeColonsThenCommas: fields => (req, res, next) => {
    try {
      for (let field of fields) {
        if (req.query[field]) {
          let newField = {}
          let itemKeyValue = req.query[field].split(':')
          if (itemKeyValue.length !== 2) throw new apiErrors.ValidationError(`La chaîne ${ req.query[field] } dans l'url n'est pas valide`)
          let values = itemKeyValue[1].split(',')
          req.query[field] = { [itemKeyValue[0]]: values }
        }
      }
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
