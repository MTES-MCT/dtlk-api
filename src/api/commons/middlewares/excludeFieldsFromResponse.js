let deleteKey = require('del-key')

module.exports = fields => (req, res, next) => {
  try {
    for (let field of fields) deleteKey(res.locals, field)
    return next()
  } catch (error) {
    return next(error)
  }
}
