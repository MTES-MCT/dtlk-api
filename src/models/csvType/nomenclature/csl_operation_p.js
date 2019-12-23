let NomenclatureCslOperation = require('../../../services/mongodb/hub/nomenclature/csl_operation')

module.exports = p => {
  return {
    columns: (name) => [ name + '_CODE_OPERATION', name + '_LIBELLE_OPERATION' ],
    expandableColumns: [],
    setValuesForDoc: async (doc, name, value) => {
      try {
        if (!value) {
          throw new Error(`La valeur ne peut être vide pour un type concernant la nomenclature des opérations des comptes satellites du logement`)
        }
        let filter = {}
        filter[`code_${ p }`] = value
        let operation = await NomenclatureCslOperation.findOne(filter)
        if (operation) {
          doc[name] = {
            ref: operation._id,
            code: operation[`code_${ p }`],
            name: operation[`name_${ p }`]
          }
          return doc
        }
        throw new Error(`La valeur ${ value } est inexistante dans la nomenclature des opérations des comptes satellites du logement`)
      }
      catch (err) {
        throw new Error(`Format invalide pour le type concernant la nomenclature des opérations des comptes satellites du logement`)
      }
    },
    returnMappingColumnsObject: (name) => {
      let mapping = {}
      mapping[name + '_CODE_OPERATION'] = name + '.code'
      mapping[name + '_LIBELLE_OPERATION'] = name + '.name'
      return mapping
    },
    returnDescriptionColumnsObject: (name, description) => {
      let descriptionColumns = {}
      descriptionColumns[name + '_CODE_OPERATION'] = description + ' - Code opération'
      descriptionColumns[name + '_LIBELLE_OPERATION'] = description + ' - Libellé opération'
      return descriptionColumns
    },
    returnTypesColumnsObject: name => {
      let typeColumns = {}
      typeColumns[name + '_CODE_OPERATION'] = 'text'
      typeColumns[name + '_LIBELLE_OPERATION'] = 'text'
      return typeColumns
    },
    returnUnitColumnsObject: (name, unit) => {
      let unitColumns = {}
      unitColumns[name + '_CODE_OPERATION'] = unit
      unitColumns[name + '_LIBELLE_OPERATION'] = unit
      return unitColumns
    }
  }
}
