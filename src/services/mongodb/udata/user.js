let mongoose = require('mongoose')
let connection = require('../connection')('udata')


let UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  apikey: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  since: {
    type: Date,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('User', UserSchema, 'user')
