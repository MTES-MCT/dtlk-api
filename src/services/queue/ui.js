let kue = require('kue')
let queue = require('./instance')
let { platform: platform, queue: { ui_port: port } } = require('../../env')

// listen to requests
kue.app.listen(port, () => console.info(`Datalake Job Queue UI started on port ${ port } (${ platform })`))

module.exports = kue.app
