let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let StationEsuSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('ReferentielStationEsu', StationEsuSchema, 'referentiel_station_esu')
