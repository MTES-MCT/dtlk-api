module.exports = {
  columns: (name) => [ name ],
  expandableColumns: [],
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = null
        return doc
      }
      doc[name] = String(value)
      return doc
    }
    catch (err) {
      throw new Error('Format invalide pour le type texte')
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
    typeColumns[name] = 'text'
    return typeColumns
  },
  returnUnitColumnsObject: (name, unit) => {
    let unitColumns = {}
    unitColumns[name] = unit
    return unitColumns
  }
}
