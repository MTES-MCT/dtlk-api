let program = require('commander')
let { prompt } = require('inquirer')

let questionsAddNomenclature = [{

}, {

}]
program
  .version('0.0.1')
  .description('CLI program for Datalake')

program
  .command('addNomenclature')
  .description('Add a nomenclature')
  .action(() => {
    let answers = {}
    prompt({
      name: 'nomenclature',
      message: 'Name of the nomenclature to add ?',
      type: 'list',
      choices: ['bilanenergie', 'csl_filiere', 'csl_operation']
    })
    .then( answer => answers.nomenclature = answer.nomenclature )
    .then(() => prompt({
      name: 'file',
      message: 'Path of the file with nomenclature',
      type: 'input',
      default: `../files/nomenclatures/${ answers.nomenclature }.js`
    }))
    .then( answer => answers.file = answer.file )
    .then( async () => {
      if (answers.nomenclature === 'csl_filiere') {
        let NomenclatureCslFiliere = require('./services/mongodb/hub/nomenclature/csl_filiere')
        let filieres = require(answers.file)
        let i = 0
        for (let filiereInfo of filieres) {
          let filiere = new NomenclatureCslFiliere({
            code: filiereInfo[1],
            name: filiereInfo[0]
          })
          await filiere.save()
          i++
        }
        return `${ i } csl_filieres imported`
      }
      if (answers.nomenclature === 'csl_operation') {
        let NomenclatureCslOperation = require('./services/mongodb/hub/nomenclature/csl_operation')
        let operations = require(answers.file)
        let i = 0
        for (let operationInfo of operations) {
          let operation = new NomenclatureCslOperation({
            code_1: operationInfo[0],
            name_1: operationInfo[1],
            code_2: operationInfo[2],
            name_2: operationInfo[3],
            code_3: operationInfo[4],
            name_3: operationInfo[5],
            code_4: operationInfo[6],
            name_4: operationInfo[7]
          })
          await operation.save()
          i++
        }
        return `${ i } csl_operations imported`
      }
      if (answers.nomenclature === 'bilanenergie') {
        let NomenclatureBilanEnergie = require('./services/mongodb/hub/nomenclature/bilanenergie')
        let bilansEnergie = require(answers.file)
        let i = 0
        for (let bilanEnergieInfo of bilansEnergie) {
          let bilanEnergie = new NomenclatureBilanEnergie({
            code: bilanEnergieInfo[0],
            name: bilanEnergieInfo[1],
            energy: bilanEnergieInfo[2],
            unit: bilanEnergieInfo[3],
            level: bilanEnergieInfo[4],
            data_type: bilanEnergieInfo[5],
            flow_type: bilanEnergieInfo[6]
          })
          await bilanEnergie.save()
          i++
        }
        return `${ i } bilanenergie imported`
      }
    })
    .then( result => console.info(result))
    .then( () => process.exit() )
  })

program
  .command('addReferentiel')
  .description('Add a referentiel')
  .action(() => {
    let answers = {}
    prompt({
      name: 'referentiel',
      message: 'Name of the referentiel to add ?',
      type: 'list',
      choices: ['tag', 'polluant_eau', 'port', 'station_air', 'station_esu']
    })
    .then( answer => answers.referentiel = answer.referentiel )
    .then(() => prompt({
      name: 'file',
      message: 'Path of the file with referentiel',
      type: 'input',
      default: `../files/referentiels/${ answers.referentiel }.js`
    }))
    .then( answer => answers.file = answer.file )
    .then( async () => {
      if (answers.referentiel === 'tag') {
        let ReferentielTag = require('./services/mongodb/hub/referentiel/tag')
        let tags = require(answers.file)
        let i = 0
        for (let tagInfo of tags) {
          let tag = new ReferentielTag({
            value: tagInfo.value,
            display: tagInfo.display,
            topics: tagInfo.topics,
            eurovoc: tagInfo.eurovoc,
            ecoplanet: tagInfo.ecoplanet,
          })
          await tag.save()
          i++
        }
        return `${ i } tag imported`
      }
      if (answers.referentiel === 'polluant_eau') {
        let ReferentielPolluantEau = require('./services/mongodb/hub/referentiel/polluant_eau')
        let polluantsEau = require(answers.file)
        let i = 0
        for (let polluantEauInfo of polluantsEau) {
          let polluantEau = new ReferentielPolluantEau({
            code: polluantEauInfo[0],
            name: polluantEauInfo[1],
            unit: polluantEauInfo[2]
          })
          await polluantEau.save()
          i++
        }
        return `${ i } polluant_eau imported`
      }
      if (answers.referentiel === 'port') {
        let ReferentielPort = require('./services/mongodb/hub/referentiel/port')
        let ports = require(answers.file)
        let i = 0
        for (let portInfo of ports) {
          let port = new ReferentielPort({
            mca_code: portInfo[0],
            mca_name: portInfo[1],
            code: portInfo[2],
            name: portInfo[3]
          })
          await port.save()
          i++
        }
        return `${ i } port imported`
      }
      if (answers.referentiel === 'station_air') {
        let ReferentielStationAir = require('./services/mongodb/hub/referentiel/station_air')
        let stationsAir = require(answers.file)
        let i = 0
        for (let stationAirInfo of stationsAir) {
          let stationAir = new ReferentielStationAir({
            code: stationAirInfo[0],
            name: stationAirInfo[1],
            code_zas: stationAirInfo[2],
            name_zas: stationAirInfo[3],
            commune: stationAirInfo[4],
            aasqa: stationAirInfo[5],
            location: { type: 'Point', coordinates: [stationAirInfo[6], stationAirInfo[7], stationAirInfo[8]] },
            validity: { start: stationAirInfo[10] },
            sector_type: stationAirInfo[12],
            millesime: stationAirInfo[13] || '',
            impact_pm10: stationAirInfo[14] || '',
            impact_no2: stationAirInfo[15] || '',
            impact_o3: stationAirInfo[16] || '',
            impact_so2: stationAirInfo[17] || '',
            impact_pm25: stationAirInfo[18] || '',
            impact_co: stationAirInfo[19]
          })
          if (stationAirInfo[11]) stationAir.validity.end = stationAirInfo[11]
          await stationAir.save()
          i++
        }
        return `${ i } station_air imported`
      }
      if (answers.referentiel === 'station_esu') {
        let ReferentielStationEsu = require('./services/mongodb/hub/referentiel/station_esu')
        let stationsEsu = require(answers.file)
        let i = 0
        for (let stationEsuInfo of stationsEsu) {
          let stationEsu = new ReferentielStationEsu({
            code: stationEsuInfo[0],
            location: { type: 'Point', coordinates: [stationEsuInfo[1], stationEsuInfo[2]] }
          })
          await stationEsu.save()
          i++
        }
        return `${ i } station_esu imported`
      }
    })
    .then( result => console.info(result))
    .then( () => process.exit() )
  })
program.parse(process.argv)
