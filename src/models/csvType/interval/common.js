let moment = require('moment')

module.exports = {
  columns: name => [ name ],
  expandableColumns: name => [ name + '_interval_start', name + '_interval_end' ],
  returnMappingColumnsObject: (name) => {
    let mapping = {}
    mapping[name] = name + '.value'
    mapping[name + '_interval_start'] = name + '.start'
    mapping[name + '_interval_end'] = name + '.end'
    return mapping
  },
  returnDescriptionColumnsObject: (name, description) => {
    let descriptionColumns = {}
    descriptionColumns[name] = description
    descriptionColumns[name + '_interval_start'] = description + ' - début'
    descriptionColumns[name + '_interval_end'] = description + ' - fin'
    return descriptionColumns
  }
}
