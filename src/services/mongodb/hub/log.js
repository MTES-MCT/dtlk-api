let mongoose = require('mongoose')
let connection = require('../connection')('hub')

let LogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  user: {
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      first_name: { type: String, required: true },
      last_name: { type: String, required: true }
    },
    required: true
  },
  dataset: {
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      title: { type: String, required: true }
    },
    required: true
  },
  datafile: {
    type: {
      rid: { type: String, required: true },
      title: { type: String, required: true },
      millesime: { type: Number, required: true },
      job_duration: { type: Number, required: false },
      rows: { type: Number, required: false }
    },
    required: false
  },
  attachment: {
    type: {
      rid: { type: String, required: true },
      title: { type: String, required: true }
    },
    required: false
  },
  timestamp: {
    type: Date,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('Log', LogSchema, 'logs')
