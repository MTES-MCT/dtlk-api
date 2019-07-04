let mongoose = require('mongoose')
let connection = require('../connection')('hub')

let JobSchema = new mongoose.Schema({
  idredis: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  state: {
    type: {
      status: { type: String, required: true },
      created_at: { type: Date, required: true },
      promote_at: { type: Date, required: true },
      started_at: { type: Date, required: true },
      failed_at: { type: Date, required: false },
      completed_at: { type: Date, required: false }
    },
    required: true
  },
  result: {
    type: {
      rid: { type: String, required: true },
      millesime: { type: String, required: true },
      duration: { type: Number, required: true },
      rows: { type: Number, required: true },
      csv_headers: { type: Number, required: true },
      columns: { type: Number, required: true }
    },
    required: false
  },
  error: {
    type: {
      message: { type: String, required: true },
      list: [String]
    },
    required: false
  },
  data: {
    type: {
      task: { type: String, required: true },
      dataset_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      datafile_rid: { type: String, required: false },
      millesime: { type: Number, required: true },
      datafile_metadata: {
        type: {
          title: { type: String, required: true },
          description: { type: String, required: true },
          published: { type: Date, required: true },
          temporal_coverage_start: { type: Date, required: false },
          temporal_coverage_end: { type: Date, required: false },
          legal_notice: { type: String, required: false }
        },
        required: false
      },
      filename: { type: String, required: true }
    },
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('Job', JobSchema, 'jobs')
