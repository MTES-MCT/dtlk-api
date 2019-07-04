module.exports = {
  pagination: (req, res, next) => {
    try { res.json(res.locals.pagination) }
    catch (error) { next(error) }
  },
  dataset: (req, res, next) => {
    try { res.json(res.locals.dataset) }
    catch (error) { next(error) }
  },
  datasetsFacets: (req, res, next) => {
    try { res.json(res.locals.datasetsFacets) }
    catch (error) { next(error) }
  },
  datafileMillesimed: (req, res, next) => {
    try { res.json(res.locals.datafileMillesimed) }
    catch (error) { next(error) }
  }
}
