let ReferentielCog = require('../../../services/mongodb/udata/referentiel/cog')
let moment = require('moment')

module.exports = header => {
  let args = header.split('_')
  let findZone
  let extra_name = ''
  if (args.length === 1) {
    // find the last zone in the cog
    findZone = async value => await ReferentielCog.findCode(value)
  }
  if (args.length === 2) {
    typeCog = (args[1] === 'pays') ? 'country' : ('fr:' + args[1])
    // find the last zone in the cog with typeCog
    findZone = async value => await ReferentielCog.findCodeWithLevel(typeCog, value)
  }
  if (args.length === 3) {
    typeCog = (args[1] === 'pays') ? 'country' : ('fr:' + args[1])
    millesime = args[2]
    extra_name = `_${ millesime }`
    start = moment(millesime, 'YYYY').format('YYYY-MM-DD')
    end = moment(millesime, 'YYYY').add(1, 'years').subtract(1, 'seconds').format('YYYY-MM-DD')
    // find the last zone in the cog for the millesime, if no zone in the millesime => searching without millesime
    findZone = async value => await ReferentielCog.findCodeWithLevelAndValidity(typeCog, start, end, value)  || await ReferentielCog.findCodeWithLevel(typeCog, value)
  }
  return {
    columns: (name) => [ `${ name }_CODE_INSEE${ extra_name }`, `${ name }_LIBELLE${ extra_name }` ],
    expandableColumns: [],
    setValuesForDoc: async (doc, name, value) => {
      try {
        if (!value) {
          throw new Error(`La valeur ne peut être vide pour un type cog`)
        }
        let zone = await findZone(value)
        if (zone) {
          doc[name] = {
            ref: zone._id,
            code: zone.code,
            name: zone.name
          }
          return doc
        }
        throw new Error(`La valeur ${ value } est inexistante dans le cog`)
      }
      catch (err) {
        throw new Error(`Format invalide pour le type cog`)
      }
    },
    returnMappingColumnsObject: (name) => {
      let mapping = {}
      mapping[`${ name }_CODE_INSEE${ extra_name }`] = name + '.code'
      mapping[`${ name }_LIBELLE${ extra_name }`] = name + '.name'
      return mapping
    },
    returnDescriptionColumnsObject: (name, description) => {
      let descriptionColumns = {}
      descriptionColumns[`${ name }_CODE_INSEE${ extra_name }`] = description + ' - Code Insee'
      descriptionColumns[`${ name }_LIBELLE${ extra_name }`] = description + ' - Libellé'
      return descriptionColumns
    },
    returnTypesColumnsObject: name => {
      let typeColumns = {}
      typeColumns[`${ name }_CODE_INSEE${ extra_name }`] = 'text'
      typeColumns[`${ name }_LIBELLE${ extra_name }`] = 'text'
      return typeColumns
    },
    returnUnitColumnsObject: (name, unit) => {
      let unitColumns = {}
      unitColumns[`${ name }_CODE_INSEE${ extra_name }`] = unit
      unitColumns[`${ name }_LIBELLE${ extra_name }`] = unit
      return unitColumns
    }
  }
}
