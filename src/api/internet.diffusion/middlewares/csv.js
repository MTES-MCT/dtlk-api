let mongoService = require('../../../services/mongodb/service')
let filenamify = require('filenamify')

module.exports = {
  stream: async (req, res, next) => {
    try {
      // options for csv formatting
      let options = { fieldSeparator: ';', rowSeparator: '\n'}
      // get the datafile
      let datafile = res.locals.datafileMillesimed

      // get the flag withColumnName
      let withColumnName = res.locals.csvCriteria.withColumnName
      // get the flag withColumnDescription
      let withColumnDescription = res.locals.csvCriteria.withColumnDescription
      // get the flag withColumnUnit
      let withColumnUnit = res.locals.csvCriteria.withColumnUnit

      // set selectable columns
      let allColumns = datafile.columns
      let columns = res.locals.csvCriteria.columns ? allColumns.filter(column => res.locals.csvCriteria.columns.includes(column.name)) : allColumns
      // get the columns name
      let columnsName = withColumnName ? columns.map(column => column.name) : []
      // get the columns description
      let columnsDescription = withColumnDescription ? columns.map(column => column.description) : []
      // get the columns unit
      let columnsUnit = withColumnUnit ? columns.map(column => column.unit) : []
      // flag: streaming started ?
      let started = false

      // function csvEscape
      let transformForCsv = value => {
        if (value === null) return null
        if (value === 'secret') return '.s'
        if (value.constructor.name === 'Number') return value
        if (value.constructor.name === 'Boolean') return value ? 'oui' : 'non'
        if (value.constructor.name === 'String') return '"' + value.replace(/\"/g, '""') + '"'
      }

      // transform array to csv row
      let arrayToCsvRow = arr => arr.map(transformForCsv).join(options.fieldSeparator) + options.rowSeparator

      // count the number of rows
      if (datafile.rows === 0) return next('Le fichier est vide')

      // set header for a csv file
      res.set({ 'Content-Disposition': `attachment; filename="${ filenamify(datafile.title) }.csv"`, 'Content-Type': 'text/csv' })

      // write first lines if asked
      if (withColumnDescription) res.write(arrayToCsvRow(columnsDescription))
      if (withColumnUnit) res.write(arrayToCsvRow(columnsUnit))
      if (withColumnName) res.write(arrayToCsvRow(columnsName))

      // create aggragation cursor (it's a readbale stream)
      let cursor = await mongoService.rows.cursor(res.locals.datafileMillesimed.rid, res.locals.datafileMillesimed.millesime, res.locals.csvCriteria)
      cursor
        // stream data => write in file
        .on('data', doc => res.write(arrayToCsvRow(Object.keys(doc).map(key => doc[key]))))
        // on error => write error and send result
        .on('error', err => {
          res.write("Il y a eu une erreur dans la génération du fichier")
          res.send()
        })
        // stream finish => send result
        .on('end', () => res.send())
    }
    catch (err) {
      res.write("Il y a eu une erreur dans la génération du fichier")
      res.send()
    }
  }
}
