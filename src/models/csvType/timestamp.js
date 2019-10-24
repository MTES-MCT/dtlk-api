let moment = require('moment')

module.exports = {
  columns: name => [ name ],
  expandableColumns: [],
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = null
        return doc
      }
      if (value.match(/^[0-9]+$/)) {
        doc[name] = moment.unix(Number.parseInt(value)).toDate()
        return doc
      }
      throw new Error('Format invalide pour le type timestamp')
    }
    catch (err) {
      throw new Error('Format invalide pour le type timestamp')
    }
  },
  returnMappingColumnsObject: name => {
    let mapping = {}
    mapping[name] = name
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name] = description
    return descriptionColumns
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name] = 'timestamp'
    return typeColumns
  }
}
