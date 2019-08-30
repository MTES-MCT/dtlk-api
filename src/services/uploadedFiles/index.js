let fs = require('fs')
let uuid = require('uuid/v4')
let byLine = require('byline')
let csvParser = require('csv-parse')
let Joi = require('joi')
let csvType = require('../../models/csvType')
let { uploadedFiles: { directory: directory } } = require('../../env')
let { uploadedFiles: errors } = require('../errors')
let pause = require('../../utils/pause')

let handleError = (error, defaultError) => {
  if (error.constructor.name === 'UploadedFilesNotFounfError') {
   throw error
  }
  if (error.constructor.name === 'UploadedFilesServerError') {
   throw error
  }
  throw new errors[defaultError.type](defaultError.message)
}
let pathExists = async (path) => fs.existsSync(path)

module.exports = {
  create: async (content) => {
    try {
      let token = uuid()
      await fs.writeFileSync(`${ directory }/${ token }`, content)
      return token
    }
    catch (error) {
      handleError(error, { type: 'ServerError', message: `Erreur interne: création fichier` })
    }
  },
  delete: async (token) => {
    try {
      if (await pathExists(`${ directory }/${ token }`) === false) {
        throw new errors.NotFoundError(`Aucun fichier avec le token ${ token }`)
      }
      await fs.unlinkSync(`${ directory }/${ token }`)
    }
    catch (error) {
      handleError(error, { type: 'ServerError', message: `Erreur interne: suppression fichier` })
    }
  },
  size: async (token) => {
    try {
      if (await pathExists(`${ directory }/${ token }`) === false) {
        throw new errors.NotFoundError(`Aucun fichier avec le token ${ token }`)
      }
      stats = await fs.statSync(`${ directory }/${ token }`)
      return stats.size
    }
    catch (error) {
      handleError(error, { type: 'ServerError', message: `Erreur interne: taille fichier` })
    }
  },
  csv: {
    check: async (token, withWarnings) => {
      try {
        if (await pathExists(`${ directory }/${ token }`) === false) {
          throw new errors.NotFoundError(`Aucun fichier avec le token ${ token }`)
        }

        return await new Promise( (resolve, reject) => {
          // create input stream
          let inputStream
          try {
            // stream file and transform via csv parser
            let parser = csvParser({ delimiter: ';', quote: '"', escape: '"' })
            inputStream = fs.createReadStream(`${ directory }/${ token }`, { encoding: 'utf8' }).pipe(parser)
          }
          catch (err) {
            if (inputStream) inputStream.destroy()
            return resolve({ result: 'invalid', message: `Le fichier n'a pas pu être parsé. Verifiez l'encodage (utf8), les séparateurs (;) et que toutes les lignes ont le même nombre de colonnes.` })
          }

          let check = { result: 'valid' }
          let counter = 1
          inputStream
            .on('data', csvObject => {
              // check line 1: the descriptions
              if (counter === 1) {
                for (let [j, description] of csvObject.entries()) {
                  try {
                    Joi.assert(description, Joi.string().required())
                  }
                  catch (err) {
                    check.result = 'invalid'
                    check.errors = check.errors || {}
                    check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                    check.errors[`colonne_${ j + 1 }`].push({ type: 'error', message: `La description est requise` })
                  }
                }
              }
              // check line 2: the types
              if (counter === 2) {
                for (let [j, type] of csvObject.entries()) {
                  try {
                    Joi.assert(type, Joi.string().required())
                    if (!csvType.isValid(type)) {
                      if (withWarnings) {
                        check.result = (check.result === 'invalid') ? 'invalid' : 'warning'
                        check.errors = check.errors || {}
                        check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                        check.errors[`colonne_${ j + 1 }`].push({ type: 'warning', message: `Le type ${ type } n'est pas un type connu, les valeurs seront intégrées comme des chaînes de caractères` })
                      }
                    }
                  }
                  catch (err) {
                    check.result = 'invalid'
                    check.errors = check.errors || {}
                    check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                    check.errors[`colonne_${ j + 1 }`].push({ type: 'error', message: `Le type ${ type } n'est pas valide` })
                  }
                }
              }
              // check line 3: the types
              if (counter === 3) {
                for (let [j, unit] of csvObject.entries()) {
                  try {
                    Joi.assert(unit, Joi.string().empty('').optional())
                    if (unit === '') {
                      if (withWarnings) {
                        check.result = (check.result === 'invalid') ? 'invalid' : 'warning'
                        check.errors = check.errors || {}
                        check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                        check.errors[`colonne_${ j + 1 }`].push({type: 'warning', message: `L'unité n'est pas remplie. Elles sera transformée en 'n/a'. Si vous voulez réellement préciser qu'il n'y a pas d'unité, utilisez la valeur 's/u'  (sans unité)`})
                      }
                    }
                  }
                  catch (err) {
                    check.result = 'invalid'
                    check.errors = check.errors || {}
                    check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                    check.errors[`colonne_${ j + 1 }`].push({ type: 'error', message: `L'unité' n'est pas valide` })
                  }
                }
              }
              // check line 4: the names
              if (counter === 4) {
                for (let [j, name] of csvObject.entries()) {
                  try {
                    Joi.assert(name, Joi.string().required().regex(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/).max(32))
                  }
                  catch (err) {
                    check.result = 'invalid'
                    check.errors = check.errors || {}
                    check.errors[`colonne_${ j + 1 }`] = check.errors[`colonne_${ j + 1 }`] || []
                    check.errors[`colonne_${ j + 1 }`].push({ type: 'error', message: `Le nom ${ name } n'est pas valide` })
                  }
                }
              }
              counter++
            })
            .on('end', () => {
              if (check.result === 'valid') check.message = 'Le fichier est valide'
              if (check.result === 'warning') check.message = 'Le fichier est valide mais il y a des alertes'
              if (check.result === 'invalid') check.message = 'Le fichier est invalide'
              return resolve(check)
            })
            .on('error', err => {
              if (inputStream) inputStream.destroy()
              return resolve({ result: 'invalid', message: `Le fichier n'a pas pu être parsé. Verifiez l'encodage (utf8), les séparateurs (;) et que toutes les lignes ont le même nombre de colonnes.` })
            })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: check fichier csv` })
      }
    },
    deleteSplitFiles: async (token) => {
      try {
        if (await pathExists(`${ directory }/${ token }-split`)) {
          fs.readdirSync(`${ directory }/${ token }-split`).forEach( async (file, index) => await fs.unlinkSync(`${ directory }/${ token }-split/${ file }`) )
          await fs.rmdirSync(`${ directory }/${ token }-split`)
          pause(3000)
        }
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: suppression division fichier csv` })
      }
    },
    split: async (token) => {
      try {
        if (await pathExists(`${ directory }/${ token }`) === false) {
          throw new errors.NotFoundError(`Aucun fichier avec le token ${ token }`)
        }

        let outputStream = null
        let chunkIndex = 0
        let lineIndex = 0
        let options = { delimiter: '\n', lineLimit: 5000 }

        // get content of file and create headers and lines from it
        let fullContentAsArray = await fs.readFileSync(`${ directory }/${ token }`, 'utf8').split(/\r\n|\r|\n/g)
        let headers = fullContentAsArray.slice(0,4).join('\n')
        let lines = fullContentAsArray.slice(4).join('\n')
        // save to disk rows and headers
        await fs.mkdirSync(`${ directory }/${ token }-split`)
        await fs.writeFileSync(`${ directory }/${ token }-split/headers`, headers)
        await fs.writeFileSync(`${ directory }/${ token }-split/temp`, lines)

        return await new Promise( (resolve, reject) => {
          // clean outputStream and reject Promise if error
          let handleError = (err) => {
            if (outputStream) outputStream.end()
            reject(err)
          }

          // get all lines without headers as stream
          let allLinesStream = fs.createReadStream(`${ directory }/${ token }-split/temp`)
          // if error during input streaming
          allLinesStream.on('error', handleError)
          // the file with all rows can be deleted after splitting
          allLinesStream.on('close', (err) => fs.unlinkSync(`${ directory }/${ token }-split/temp`))

          // create stream line-by-line
          try {
            // stream line-by-line
            lineStream = byLine(allLinesStream)
          }
          catch(err) {
            handleError(err)
            return
          }

          lineStream.on('data', line => {
            if (lineIndex === 0) {
              if (outputStream) outputStream.end()
              outputStream = fs.createWriteStream(`${ directory }/${ token }-split/${ chunkIndex++ }.csv`)
            }
            outputStream.write(line)
            outputStream.write(options.delimiter)
            lineIndex = (++lineIndex) % options.lineLimit
          })
          lineStream.on('error', handleError)
          lineStream.on('end', () => {
            if (outputStream) {
              outputStream.end()
            }
            else {
              outputStream = fs.createWriteStream(`${ directory }/${ token }-split/${ chunkIndex++ }.csv`)
              outputStream.write(options.delimiter)
              outputStream.end()
            }
            resolve({
              totalChunks: chunkIndex,
              totalLines: (chunkIndex - 1) * (options.lineLimit) + lineIndex,
              linesByChunk: options.lineLimit,
              delimiter: options.delimiter
            })
          })
        })
      }
      catch (error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: division fichier csv` })
      }
    },
    headers: async (token) => {
      try {
        return await new Promise( (resolve, reject) => {
          // create input stream
          let inputStream
          try {
            // stream file and transform via csv parser
            let parser = csvParser({ delimiter: ';', quote: '"', escape: '"' })
            inputStream = fs.createReadStream(`${ directory }/${ token }-split/headers`, { encoding: 'utf8' }).pipe(parser)
          }
          catch (err) {
            reject(err)
          }
          let counter = 1
          let headers = []
          inputStream
            .on('data', csvObject => {
              console.log("test")
              if (counter == 1) {
                for (let [j, description] of csvObject.entries()) {
                  headers.push({ description: description, order: j })
                }
              }
              if (counter == 2) {
                for (let [j, type] of csvObject.entries()) {
                  headers[j].type = type
                }
              }
              if (counter == 3) {
                for (let [j, unit] of csvObject.entries()) {
                  headers[j].unit = unit
                }
              }
              if (counter == 4) {
                for (let [j, name] of csvObject.entries()) {
                  headers[j].name = name
                }
              }
              counter++
            })
            .on('end', () => resolve(headers))
            .on('error', err => reject(err))
        })
      }
      catch (error) {
        console.log(error)
        handleError(error, { type: 'ServerError', message: `Erreur interne: entêtes fichier csv` })
      }
    },
    stream: (token, subNumber) => {
      try {
        // stream file and transform via csv parser
        let parser = csvParser({ delimiter: ';', quote: '"', escape: '"' })
        return fs.createReadStream(`${ directory }/${ token }-split/${ subNumber - 1 }.csv`, { encoding: 'utf8' }).pipe(parser)
      }
      catch(error) {
        handleError(error, { type: 'ServerError', message: `Erreur interne: stream fichier csv` })
      }
    }
  },
  stream: (token) => {
    try {
      return fs.createReadStream(`${ directory }/${ token }`)
    }
    catch (error) {
      handleError(error, { type: 'ServerError', message: `Erreur interne: stream fichier` })
    }
  }
}
