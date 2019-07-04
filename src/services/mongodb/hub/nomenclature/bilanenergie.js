let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let BilanEnergieSchema = new mongoose.Schema({
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
  },
  level: {
    type: String,
    required: false
  },
  data_type: {
    type: String,
    required: false
  },
  flow_type: {
    type: String,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('NomenclatureBilanEnergie', BilanEnergieSchema, 'nomenclature_bilanenergie')
