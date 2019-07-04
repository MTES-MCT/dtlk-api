let mongoose = require('mongoose')
let connection = require('../connection')('udata')
let Organization = require('./organization')

let ResourceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  created_at: { type: Date, required: true },
  modified: { type: Date, required: false },
  published: { type: Date, required: false },
  url: { type: String, required: true },
  extras: {
    type: {
      datalake_attachment: { type: Boolean, required: false },
      datalake_datafile: { type:Boolean, required: false },
      datalake_millesimes: { type: Number, required: false },
      datalake_millesimes_info: { type: String, required: false },
      datalake_temporal_coverage_start: { type: Date, required: false },
      datalake_temporal_coverage_end: { type: Date, required: false },
      datalake_legal_notice: { type: String, required: false }
    },
    required: true
  }
}, {
  strict: true,
  timestamps: false,
  versionKey: false
})

let DatasetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: Organization },
  extras: {
    datalake_topic: { type: String, required: true },
    datalake_caution: { type: String, required: false }
  },
  license: { type: String, required: true },
  frequency: { type: String, required: true },
  frequency_date: { type: Date, required: false },
  created_at: { type: Date, required: true },
  last_modified: { type: Date, required: false },
  last_update: { type: Date, required: false },
  tags: [{ type: String, required: true }],
  spatial: {
    type: {
      zones: [{ type: String }],
      granularity: { type: String }
    },
    required: false
  },
  temporal_coverage: {
    type: {
      start: { type: Date },
      end: { type: Date }
    },
    required: false
  },
  resources: [ResourceSchema]
}, {
  timestamps: false,
  versionKey: false
})

DatasetSchema.method({
  populateOrganization: async function () {
    await this.populate('organization').execPopulate()
    return this
  }
})

module.exports = connection.model('Dataset', DatasetSchema, 'dataset')
