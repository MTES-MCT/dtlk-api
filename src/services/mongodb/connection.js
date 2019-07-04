let mongoose = require('mongoose')
let { mongodb: { udata_uri: udataUri, hub_uri: hubUri }, platform: env } = require('../../env')


// set mongoose Promise to Bluebird
mongoose.Promise = Promise

// Exit application on error
mongoose.connection.on('error', (err) => {
 console.error(`MongoDB connection error: ${ err }`)
 process.exit(-1)
})

// print mongoose logs in dev env
if (env === 'development') {
  //mongoose.set('debug', true)
}

module.exports = (name) => mongoose.createConnection(eval(name + 'Uri'), { keepAlive: 1, useNewUrlParser: true })
