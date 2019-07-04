// make bluebird default Promise
Promise = require('bluebird') // eslint-disable-line no-global-assign
let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let compress = require('compression')
let methodOverride = require('method-override')
let cors = require('cors')
let helmet = require('helmet')
let swStats = require('swagger-stats')
let { platform: platform, api_diffusion_internet: { port: port, basePath: basePath, logs: logs }, ihm_diffusion_url: ihm_diffusion_url } = require('../../env')
let routes = require('./routes')
let errors = require('../commons/middlewares/errors')

let app = express()

// request logging. dev: console | production: file
app.use(morgan(logs))

// parse request (json in body and params in querystring and eventually raw data) and attache them to req.body
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))

// gzip compression
app.use(compress())

// lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(methodOverride())

// secure apps by setting various HTTP headers
app.use(helmet())

// set http headers for allowing ihm inter url
app.use(helmet.frameguard({
  action: 'allow-from',
  domain: ihm_diffusion_url
}))

// enable CORS - Cross Origin Resource Sharing
app.use(cors({
  origin: "*",
  methods: "GET",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Type', 'Content-Disposition'] // for swaggeru-ui download-link
}))

// configure swaggerui
app.use(
  async (req, res, next) => {
    let fs = require('fs')
    let SwaggerUi = require ('swagger-ui-dist')
    if (await fs.existsSync(SwaggerUi.absolutePath() + '/index.html')) await fs.unlinkSync(SwaggerUi.absolutePath() + '/index.html')
    let newIndexPath = await fs.realpathSync(`${ __dirname }/swaggerDocumentations/swaggerui-index.html`)
    await fs.copyFileSync(newIndexPath, SwaggerUi.absolutePath() + '/apidoc.html')
    let newCssPath = await fs.realpathSync(`${ __dirname }/swaggerDocumentations/swaggerui.css`)
    await fs.copyFileSync(newCssPath, SwaggerUi.absolutePath() + '/swagger-ui.css')
    next()
  }
)

let { v1: swaggerGlobalDocument } = require('./swaggerDocumentations/global')
app.use(swStats.getMiddleware({swaggerSpec:swaggerGlobalDocument}))

// mount api routes
app.use(basePath, routes)

// error handler
app.use(errors.error_handler)

// finally 404 error
app.use(errors.error_404)

// listen to requests
app.listen(port, () => console.info(`Datalake Api public internet started on port ${ port } - basePath is ${ basePath } (${ platform })`))

module.exports = app
