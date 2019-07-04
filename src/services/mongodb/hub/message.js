let mongoose = require('mongoose')
let connection = require('../connection')('hub')

let UserSchema = new mongoose.Schema({
  isRobot: { type: Boolean, required: true },
  isUser: { type: Boolean, required: true },
  isIntranetUser: { type: Boolean, required: true },
  isDatalakeUser: { type: Boolean, required: true },
  robot: {
    type: {
      name: { type: String, required: true }
    },
    required: false
  },
  user: {
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, required: false },
      email: { type: String, required: true },
      name: { type: String, required: true }
    },
    required: false
  }
}, {
  _id: false,
  timestamps: false,
  versionKey: false
})

let MessageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  sender: UserSchema,
  to: [UserSchema],
  cc: [UserSchema],
  timestamp: { type: Date, required: true },
  subject: { type: String, required: true },
  text: { type: String, required: true },
  textHtml: { type: String, required: false },
  read: { type: Boolean, required: true }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('Message', MessageSchema, 'messages')
