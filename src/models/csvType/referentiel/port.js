let ReferentielPort = require('../../../services/mongodb/hub/referentiel/port')

module.exports = {
  columns: (name) => [ name + '_LO_CODE', name + '_LIBELLE' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type port`)
      }
      let port = await ReferentielPort.findOne({ 'code': value })
      if (port) {
        doc[name] = {
          ref: port._id,
          code: port.code,
          name: port.name
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans le référentiel des ports`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type référentiel des ports`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_LO_CODE'] = name + '.code'
    mapping[name + '_LIBELLE'] = name + '.name'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_LO_CODE'] = description + ' - Code'
    descriptionColumns[name + '_LIBELLE'] = description + ' - Libellé'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_LO_CODE'] = 'text'
    typeColumns[name + '_LIBELLE'] = 'text'
    return typeColumns
  },
  returnUnitColumnsObject: (name, unit) => {
    let unitColumns = {}
    unitColumns[name + '_LO_CODE'] = unit
    unitColumns[name + '_LIBELLE'] = unit
    return unitColumns
  }
}
