let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let CslFiliereSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('NomenclatureCslFiliere', CslFiliereSchema, 'nomenclature_csl_filiere')
