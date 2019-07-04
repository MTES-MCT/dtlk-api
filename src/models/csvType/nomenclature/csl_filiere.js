let NomenclatureCslFiliere = require('../../../services/mongodb/hub/nomenclature/csl_filiere')

module.exports = {
  columns: (name) => [ name + '_CODE_FILIERE', name + '_LIBELLE_FILIERE' ],
  expandableColumns: [],
  setValuesForDoc: async (doc, name, value) => {
    try {
      if (!value) {
        throw new Error(`La valeur ne peut être vide pour un type concernant la nomenclature des filières des comptes sattelite du logement`)
      }
      let filiere = await NomenclatureCslFiliere.findOne({ 'code': value })
      if (filiere) {
        doc[name] = {
          ref: filiere._id,
          code: filiere.code,
          name: filiere.name
        }
        return doc
      }
      throw new Error(`La valeur ${ value } est inexistante dans la nomenclature des filières des comptes sattelite du logement`)
    }
    catch (err) {
      throw new Error(`Format invalide pour le type concernant la nomenclature des filières des comptes sattelite du logement`)
    }
  },
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name + '_CODE_FILIERE'] = name + '.code'
    mapping[name + '_LIBELLE_FILIERE'] = name + '.name'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name + '_CODE_FILIERE'] = description + ' - Code filière'
    descriptionColumns[name + '_LIBELLE_FILIERE'] = description + ' - Libellé filière'
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name + '_CODE_FILIERE'] = 'text'
    typeColumns[name + '_LIBELLE_FILIERE'] = 'text'
    return typeColumns
  }
}
