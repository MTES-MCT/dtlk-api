let moment = require('moment')
let intervalType = require('./common')

let specificType = {
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = { value: null, start: null, end: null }
        return doc
      }
      if (value.match(/^[0-9]{4}$/)) {
        let start = moment(value, 'YYYY').toDate()
        let end = moment(value, 'YYYY').add(1, 'years').toDate()
        doc[name] = { value: value, start: start, end: end }
        return doc
      }
      throw new Error('Format invalide pour le type annee')
    }
    catch (err) {
      throw new Error('Format invalide pour le type annee')
    }
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name] = 'year'
    return typeColumns
  }
}
module.exports = {...intervalType, ...specificType }
