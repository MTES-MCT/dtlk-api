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
  },
  polluant_Eau: (req, res, next) => {
    try { res.json(res.locals.polluant_Eau) }
    catch (error) { next(error) }
  },
  port: (req, res, next) => {
    try { res.json(res.locals.port) }
    catch (error) { next(error) }
  },
  station_Air: (req, res, next) => {
    try { res.json(res.locals.station_Air) }
    catch (error) { next(error) }
  },
  station_Esu: (req, res, next) => {
    try { res.json(res.locals.station_Esu) }
    catch (error) { next(error) }
  },
  bilanEnergie: (req, res, next) => {
    try { res.json(res.locals.bilanEnergie) }
    catch (error) { next(error) }
  },
  csl_filiere: (req, res, next) => {
    try { res.json(res.locals.csl_filiere) }
    catch (error) { next(error) }
  },
  csl_operation: (req, res, next) => {
    try { res.json(res.locals.csl_operation) }
    catch (error) { next(error) }
  },
  allTags: (req, res, next) => {
    try { res.json(res.locals.allTags) }
    catch (error) { next(error) }
  },
}