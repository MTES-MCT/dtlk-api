let NomenclatureBilanEnergie = require('../../../services/mongodb/hub/nomenclature/bilanenergie')

module.exports = {
  columns: (name) => [ name + '_CODE', name + '_LIBELLE', name + '_ENERGIE', name + '_UNITE', name + '_NIVEAU_GEOGRAPHIQUE', name + '_TYPE_DONNEE', name + '_TYPE_FLUX' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type concernant la nomenclature du bilan de l'énergie`)
      }
      let nomenclature = await NomenclatureBilanEnergie.findOne({ 'code': value })
      if (nomenclature) {
        doc[name] = {
          ref: nomenclature._id,
          code: nomenclature.code,
          name: nomenclature.name,
          energy: nomenclature.energy,
          unit: nomenclature.unit,
          level: nomenclature.level,
          data_type: nomenclature.data_type,
          flow_type: nomenclature.flow_type
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans la nomenclature du bilan de l'énergie`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type concernant la nomenclature du bilan de l'énergie`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_CODE'] = name + '.code'
    mapping[name + '_LIBELLE'] = name + '.name'
    mapping[name + '_ENERGIE'] = name + '.energy'
    mapping[name + '_UNITE'] = name + '.unit'
    mapping[name + '_NIVEAU_GEOGRAPHIQUE'] = name + '.level'
    mapping[name + '_TYPE_DONNEE'] = name + '.data_type'
    mapping[name + '_TYPE_FLUX'] = name + '.flow_type'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_CODE'] = description + ' - Code'
    descriptionColumns[name + '_LIBELLE'] = description + ' - Libellé'
    descriptionColumns[name + '_ENERGIE'] = description + ' - Énergie'
    descriptionColumns[name + '_UNITE'] = description + ' - Unité'
    descriptionColumns[name + '_NIVEAU_GEOGRAPHIQUE'] = description + ' - Niveau géographique'
    descriptionColumns[name + '_TYPE_DONNEE'] = description + ' - Type donnée'
    descriptionColumns[name + '_TYPE_FLUX'] = description + ' - Type flux'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_CODE'] = 'text'
    typeColumns[name + '_LIBELLE'] = 'text'
    typeColumns[name + '_ENERGIE'] = 'text'
    typeColumns[name + '_UNITE'] = 'text'
    typeColumns[name + '_NIVEAU_GEOGRAPHIQUE'] = 'text'
    typeColumns[name + '_TYPE_DONNEE'] = 'text'
    typeColumns[name + '_TYPE_FLUX'] = 'text'
    return typeColumns
  }
}
