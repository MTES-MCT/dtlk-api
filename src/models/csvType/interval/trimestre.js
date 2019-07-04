let moment = require('moment')
let intervalType = require('./common')

let specificType = {
  setValuesForDoc: (doc, name, value) => {
    try {
      if (!value) {
        doc[name] = { value: null, start: null, end: null }
        return doc
      }
      if (value.match(/^[0-9]{4}-T[1-4]$/)) {
        let args = value.split('-')
        if (args[1] == 'T1') startMonth = '01'
        if (args[1] == 'T2') startMonth = '04'
        if (args[1] == 'T3') startMonth = '07'
        if (args[1] == 'T4') startMonth = '10'
        let start = moment(args[0] + '-' + startMonth, 'YYYY-MM').toDate()
        let end = moment(args[0] + '-' + startMonth, 'YYYY-MM').add(3, 'months').toDate()
        doc[name] = { value: value, start: start, end: end }
        return doc
      }
      throw new Error('Format invalide pour le type trimestre')
    }
    catch (err) {
      throw new Error('Format invalide pour le type trimestre')
    }
  },
  returnTypesColumnsObject: name => {
    let typeColumns = {}
    typeColumns[name] = 'quarter'
    return typeColumns
  }
}
module.exports = {...intervalType, ...specificType }
