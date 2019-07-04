let mongoose = require('mongoose')
let connection = require('../../connection')('udata')

let CogSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: false
  },
  validity: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  name: {
    type: String,
    required: true
  },
  successors: [String],
  ancestors: [String]
}, {
  timestamps: false,
  versionKey: false
})

CogSchema.statics = {
  async findCodeWithLevelAndValidity (level, start, end, value) {
    let filter = {
      level: level,
      'validity.start': {$lte: start},
      'validity.end': {$gte: end},
      code: value
    }
    return await this.findOne(filter).sort({_id: -1})
  },

  async findCodeWithLevel (level, value) {
    let filter = {
      level: level,
      code: value
    }
    return await this.findOne(filter).sort({_id: -1})
  },

  async findCode (value) {
    let filter = {
      code: value
    }
    return await this.findOne(filter).sort({_id: -1})
  }
}

module.exports = connection.model('ReferentielCog', CogSchema, 'geo_zone')
