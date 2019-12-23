let ReferentielPolluantEau = require('../../../services/mongodb/hub/referentiel/polluant_eau')

module.exports = {
  columns: (name) => [ name + '_CODE_POLLUANT', name + '_LIBELLE_POLLUANT', name + '_UNITE_POLLUANT' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type polluant`)
      }
      let polluant = await ReferentielPolluantEau.findOne({ 'code': value })
      if (polluant) {
        doc[name] = {
          ref: polluant._id,
          code: polluant.code,
          name: polluant.name,
          unit: polluant.unit
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans le référentiel des polluant`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type référentiel des polluants`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_CODE_POLLUANT'] = name + '.code'
    mapping[name + '_LIBELLE_POLLUANT'] = name + '.name'
    mapping[name + '_UNITE_POLLUANT'] = name + '.unit'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_CODE_POLLUANT'] = description + ' - Code polluant'
    descriptionColumns[name + '_LIBELLE_POLLUANT'] = description + ' - Libellé polluant'
    descriptionColumns[name + '_UNITE_POLLUANT'] = description + ' - Unité polluant'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_CODE_POLLUANT'] = 'text'
    typeColumns[name + '_LIBELLE_POLLUANT'] = 'text'
    typeColumns[name + '_UNITE_POLLUANT'] = 'text'
    return typeColumns
  },
  returnUnitColumnsObject: (name, unit) => {
    let unitColumns = {}
    unitColumns[name + '_CODE_POLLUANT'] = unit
    unitColumns[name + '_LIBELLE_POLLUANT'] = unit
    unitColumns[name + '_UNITE_POLLUANT'] = unit
    return unitColumns
  }
}
