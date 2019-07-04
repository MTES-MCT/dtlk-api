
module.exports = {
  error_handler: (err, req, res, next) => {
    let response
    if (err.error && err.error.isJoi) { response = { code: 400, message: `Erreur de validation`, errors: err.error.details.map(item => item.message) } }
    if (err.constructor.name === 'ApiValidationError') { response = { code: 400, message: err.message , errors: err.errors, stack: err.stack } }
    if (err.constructor.name === 'ApiUnauthorizedError') { response = { code: 401, message: err.message , errors: err.errors, stack: err.stack } }
    if (err.constructor.name === 'ApiForbiddenError') { response = { code: 403, message: err.message , errors: err.errors, stack: err.stack } }
    if (err.constructor.name === 'ApiNotFoundError') { response = { code: 404, message: err.message , errors: err.errors, stack: err.stack } }
    if (err.constructor.name === 'ApiBusinessRulesError') { response = { code: 409, message: err.message , errors: err.errors, stack: err.stack } }
    if (err.constructor.name === 'ApiServerError') { response = { code: 500, message: err.message , errors: err.errors, stack: err.stack } }

    if (!response) { response = { code: 500, message: err.message , errors: err.errors, stack: err.stack } }
    res.status(response.code)
    res.json(response)
    res.end()
  },
  error_404: (req, res, next) => {
      res.status(404);
      res.send(`404: Not Found - not valid url`);
  }
}
