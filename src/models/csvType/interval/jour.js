let moment = require('moment')
let intervalType = require('./common')

let specificType = {
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = { value: null, start: null, end: null }
        return doc
      }
      if (value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
        if (moment(value, 'YYYY-MM-DD').isValid()) {
          let start = moment(value, 'YYYY-MM-DD').toDate()
          let end = moment(value, 'YYYY-MM-DD').add(1, 'days').toDate()
          doc[name] = { value: value, start: start, end: end }
          return doc
        }
      }
      throw new Error('Format invalide pour le type jour')
    }
    catch (err) {
      throw new Error('Format invalide pour le type jour')
    }
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name] = 'day'
    return typeColumns
  }
}
module.exports = {...intervalType, ...specificType }
