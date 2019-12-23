let ReferentielStationAir = require('../../../services/mongodb/hub/referentiel/station_air')

module.exports = {
  columns: (name) => [ name + '_CODE', name + '_LIBELLE', name + '_LONGITUDE', name + '_LATITUDE', name + '_ALTITUDE' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type station air`)
      }
      let stationAir = await ReferentielStationAir.findOne({ 'code': value })
      if (stationAir) {
        doc[name] = {
          ref: stationAir._id,
          code: stationAir.code,
          name: stationAir.name,
          location: stationAir.location
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans le référentiel des stations air`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type référentiel des stations air`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_CODE'] = name + '.code'
    mapping[name + '_LIBELLE'] = name + '.name'
    mapping[name + '_LONGITUDE'] = name + '.location.coordinates.0'
    mapping[name + '_LATITUDE'] = name + '.location.coordinates.1'
    mapping[name + '_ALTITUDE'] = name + '.location.coordinates.2'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_CODE'] = description + ' - Code'
    descriptionColumns[name + '_LIBELLE'] = description + ' - Libellé'
    descriptionColumns[name + '_LONGITUDE'] = description + ' - Longitude'
    descriptionColumns[name + '_LATITUDE'] = description + ' - Latitude'
    descriptionColumns[name + '_ALTITUDE'] = description + ' - Niveau Altitude'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_CODE'] = 'text'
    typeColumns[name + '_LIBELLE'] = 'text'
    typeColumns[name + '_LONGITUDE'] = 'number'
    typeColumns[name + '_LATITUDE'] = 'number'
    typeColumns[name + '_ALTITUDE'] = 'number'
    return typeColumns
  },
  returnUnitColumnsObject: (name, unit) => {
    let unitColumns = {}
    unitColumns[name + '_CODE'] = unit
    unitColumns[name + '_LIBELLE'] = unit
    unitColumns[name + '_LONGITUDE'] = unit
    unitColumns[name + '_LATITUDE'] = unit
    unitColumns[name + + '_ALTITUDE'] = unit
    return unitColumns
  }
}
