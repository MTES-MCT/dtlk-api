let { api: apiErrors } = require('../../services/errors')

module.exports = {
  boolean: ['eq'],
  number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  text: ['eq', 'startsWith', 'endsWith', 'in', 'nin'],
  timestamp: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  day: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  month: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  quarter: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  year: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
  getFilterForMongo: (typeField, typeFilter, value) => {
    // transform value from query depending of type field
    try {
      if (typeField === 'text') value = value.map(v => String(v))
      if (typeField === 'number') value = value.map(v => Number(v))
      if (typeField === 'boolean') { value = value.map(v => Boolean(v)) }
      if (typeField === 'timestamp') { value = value.map(v => Number(v)) }
      if (typeField === 'day') { value = value.map(v => String(v)) }
      if (typeField === 'month') { value = value.map(v => String(v)) }
      if (typeField === 'quarter') { value = value.map(v => String(v)) }
      if (typeField === 'year') { value = value.map(v => String(v)) }
    }
    catch (error) {
      throw new apiErrors.ValidationError(`La valeur n'est pas valide pour un filtre ${ typeFilter } d'un champ de type ${ typeField }`)
    }

    if (['eq', 'ne', 'gt', 'gte', 'lt', 'lte'].includes(typeFilter)) return { ['$' + typeFilter]: value[0] }
    if (['in', 'nin'].includes(typeFilter)) return { ['$' + typeFilter]: value }
    if (typeFilter === 'startsWith') return { $regex: `^${ value[0] }`, $options: 'i' }
    if (typeFilter === 'endsWith') return { $regex: `${ value[0] }$`, $options: 'i' }
  }
}
