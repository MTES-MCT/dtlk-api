let ReferentielStationEsu = require('../../../services/mongodb/hub/referentiel/station_esu')

module.exports = {
  columns: (name) => [ name + '_CODE', name + '_LONGITUDE', name + '_LATITUDE' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type station esu`)
      }
      let stationEsu = await ReferentielStationEsu.findOne({ 'code': value })
      if (stationEsu) {
        doc[name] = {
          ref: stationEsu._id,
          code: stationEsu.code,
          location: stationEsu.location
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans le référentiel des stations esu`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type référentiel des stations esu`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_CODE'] = name + '.code'
    mapping[name + '_LONGITUDE'] = name + '.location.coordinates.0'
    mapping[name + '_LATITUDE'] = name + '.location.coordinates.1'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_CODE'] = description + ' - Code'
    descriptionColumns[name + '_LONGITUDE'] = description + ' - Longitude'
    descriptionColumns[name + '_LATITUDE'] = description + ' - Latitude'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_CODE'] = 'text'
    typeColumns[name + '_LONGITUDE'] = 'number'
    typeColumns[name + '_LATITUDE'] = 'number'
    return typeColumns
  }
}
