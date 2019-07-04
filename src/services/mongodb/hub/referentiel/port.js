let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let PortSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mca_code: {
    type: String,
    required: true
  },
  mca_name: {
    type: String,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('ReferentielPort', PortSchema, 'referentiel_port')
