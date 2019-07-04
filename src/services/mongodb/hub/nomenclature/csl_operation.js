let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let CslOperationSchema = new mongoose.Schema({
  code_1: {
    type: String,
    required: true
  },
  name_1: {
    type: String,
    required: false
  },
  code_2: {
    type: String,
    required: true
  },
  name_2: {
    type: String,
    required: false
  },
  code_3: {
    type: String,
    required: true
  },
  name_3: {
    type: String,
    required: false
  },
  code_4: {
    type: String,
    required: true
  },
  name_4: {
    type: String,
    required: false
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('NomenclatureCslOperation', CslOperationSchema, 'nomenclature_csl_operation')
