module.exports = {
  columns: (name) => [ name ],
  expandableColumns: [],
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = null
        return doc
      }
      if ((value === 's') || (value === 'S')) {
        doc[name] = 'secret'
        return doc
      }
      if (value.match(/^-{0,1}[0-9]+(?:\.[0-9]+){0,1}(?:E-{0,1}[0-9]+){0,1}$/)) {
        doc[name] = Number(value)
        return doc
      }
      throw new Error('Format invalide pour le type nombre')
    }
    catch (err) {
      throw new Error('Format invalide pour le type nombre')
    }
  },
  returnMappingColumnsObject: (name) => {
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
    typeColumns[name] = 'number'
    return typeColumns
  },
  returnUnitColumnsObject: (name, unit) => {
    let unitColumns = {}
    unitColumns[name] = unit
    return unitColumns
  }
}
