let moment = require('moment')
let intervalType = require('./common')

let specificType = {
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = { value: null, start: null, end: null }
        return doc
      }
      if (value.match(/^[0-9]{4}-[0-9]{2}$/)) {
        if (moment(value, 'YYYY-MM').isValid()) {
          let start = moment(value, 'YYYY-MM').toDate()
          let end = moment(value, 'YYYY-MM').add(1, 'months').toDate()
          doc[name] = { value: value, start: start, end: end }
          return doc
        }
      }
      throw new Error('Format invalide pour le type mois')
    }
    catch (err) {
      throw new Error('Format invalide pour le type mois')
    }
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name] = 'month'
    return typeColumns
  }
}
module.exports = {...intervalType, ...specificType }
