module.exports = {
  columns: (name) => [ name ],
  expandableColumns: [],
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = null
        return doc
      }
      if (['true', 'yes', 'y', 't', 'vrai', 'v', 'oui', 'o', 1, '1'].includes(value)) {
        doc[name] = true
        return doc
      }
      if (['false', 'no', 'f', 'faux', 'non', 'n', 0, '0'].includes(value)) {
        doc[name] = false
        return doc
      }
      throw new Error('Format invalide pour le type booleen')
    }
    catch (err) {
      throw new Error('Format invalide pour le type booleen')
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
    typeColumns[name] = 'boolean'
    return typeColumns
  }
}
