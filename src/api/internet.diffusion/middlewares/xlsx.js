let mongoService = require('../../../services/mongodb/service')
let filenamify = require('filenamify')
let XLSX = require('xlsx')
module.exports = {
  stream: async (req, res, next) => {
  try {
    // get the datafile
    let datafile = res.locals.datafileMillesimed
    // options for csv formatting
    let options = { fieldSeparator: ','}
    // get the flag withColumnName
    let withColumnName = res.locals.xlsxCriteria.withColumnName
    // get the flag withColumnDescription
    let withColumnDescription = res.locals.xlsxCriteria.withColumnDescription
    // get the flag withColumnUnit
    let withColumnUnit = res.locals.xlsxCriteria.withColumnUnit
    // set selectable columns
    let allColumns = datafile.columns
    let columns = res.locals.xlsxCriteria.columns ? allColumns.filter(column => res.locals.xlsxCriteria.columns.includes(column.name)) : allColumns
    // get the columns name
    let columnsName = withColumnName ? columns.map(column => column.name) : []
    // get the columns description
    let columnsDescription = withColumnDescription ? columns.map(column => column.description) : []
    // get the columns description
    let columnsUnit = withColumnUnit ? columns.map(column => column.unit) : []
    
    // function csvEscape
    let transformForCsv = value => {
      if (value === null) return null
      if (value === 'secret') return '.s'
      if (value.constructor.name === 'Number') return value
      if (value.constructor.name === 'Boolean') return value ? 'oui' : 'non'
      if (value.constructor.name === 'String') return value.replace(/\"/g, '""')
    }
    
    // transform array to csv row
    let arrayToCsvRow = arr => arr.map(transformForCsv).join(options.fieldSeparator)
    
    // Creating workbook   
    var wb = XLSX.utils.book_new()
    var ws_name = `"Datafile_${ res.locals.datafileMillesimed.millesime }_Sheet"`

    // adding data 
    var data = []
    if (withColumnDescription) data.push(columnsDescription)
    if (withColumnUnit) data.push(columnsUnit)
    if (withColumnName) data.push(columnsName)
    console.log("here")
    // set header for a xlsx file 
    res.set({ 'Content-Disposition': `attachment; filename="${ filenamify(datafile.title) }.xlsx"`})

    // Creating worksheet
    var ws = XLSX.utils.aoa_to_sheet(data)

    // create aggragation cursor (it's a readbale stream)
    var cursor = await mongoService.rows.cursor(res.locals.datafileMillesimed.rid, res.locals.datafileMillesimed.millesime,res.locals.xlsxCriteria)
    
    cursor.on('data',doc => {
      let rows = []
      rows.push(arrayToCsvRow(Object.keys(doc).map(key => doc[key])).split(','))
      /* Append row to worksheet*/
      XLSX.utils.sheet_add_aoa(ws, rows, {origin: -1});  
    })
    // on error => write error and send result
    .on('error', err => {
      console.log(err)
    })
    // stream finish
    .on('end', () => {
      /* add worksheet to workbook */
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      /* write workbook */
      let buf = XLSX.write(wb, {type:'buffer', bookType: "xlsx" })
      res.send(buf)
    })
    }catch (err) {
      console.error(err)
    } 
  }
}