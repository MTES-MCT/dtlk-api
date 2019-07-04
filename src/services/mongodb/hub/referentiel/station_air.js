let mongoose = require('mongoose')
let connection = require('../../connection')('hub')

let StationAirSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code_zas: {
    type: String,
    required: true
  },
  name_zas: {
    type: String,
    required: true
  },
  commune: {
    type: String,
    required: true
  },
  aasqa: {
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
  },
  validity: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: false
    }
  },
  sector_type: {
    type: String,
    required: true
  },
  millesime: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  impact_pm10: {
    type: String,
    required: false
  },
  impact_no2: {
    type: String,
    required: false
  },
  impact_o3: {
    type: String,
    required: false
  },
  impact_so2: {
    type: String,
    required: false
  },
  impact_pm25: {
    type: String,
    required: false
  },
  impact_co: {
    type: String,
    required: false
  }
}, {
  timestamps: false,
  versionKey: false
})

module.exports = connection.model('ReferentielStationAir', StationAirSchema, 'referentiel_station_air')
