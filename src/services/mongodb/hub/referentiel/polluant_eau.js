let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let PolluantEauSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  unit: {
    type: String,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('ReferentielPolluantEau', PolluantEauSchema, 'referentiel_polluant_eau')
