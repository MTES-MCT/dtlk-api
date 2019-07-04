let mongoose = require('mongoose')
let connection = require('../connection')('udata')

let OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  acronym: { type: String, required: true }
}, {
  strict: true,
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('Organization', OrganizationSchema, 'organization')
