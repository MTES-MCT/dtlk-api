let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let TagSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  display: {
    type: String,
    required: true
  },
  topics: {
    type: [String],
    required: true
  },
  eurovoc: {
    type: String,
    required: false
  },
  ecoplanet: {
    type: String,
    required: false
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('ReferentielTag', TagSchema, 'referentiel_tag')
