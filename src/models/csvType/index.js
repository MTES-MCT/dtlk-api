module.exports = {
  getHeader: header => {
    // basic type
    if (header === 'texte') return require('./texte')
    if (header === 'entier') return require('./entier')
    if (header === 'nombre') return require('./nombre')
    if (header.match(/nombre\(\d\)/)) return require('./nombre_p')(header.match(/nombre\((\d)\)/)[1])
    if (header === 'booleen') return require('./booleen')
    if (header === 'timestamp') return require('./timestamp')
    // interval type
    if (header === 'jour') return require('./interval/jour')
    if (header === 'mois') return require('./interval/mois')
    if (header === 'trimestre') return require('./interval/trimestre')
    if (header === 'annee') return require('./interval/annee')
    // nomenclature
    if (header === 'ref_bilanenergie_nomenclature') return require('./nomenclature/bilanernergie')
    if (header === 'ref_csl_filiere') return require('./nomenclature/csl_filiere')
    if (header.match(/ref_csl_operation_\d/)) return require('./nomenclature/csl_operation_p')(header.match(/ref_csl_operation_(\d)/)[1])
    // referentiel
    if (header === 'ref_polluant_eau') return require('./referentiel/polluant_eau')
    if (header === 'ref_station_air') return require('./referentiel/station_air')
    if (header === 'ref_station_esu') return require('./referentiel/station_esu')
    if (header === 'port_locode') return require('./referentiel/port')
    // cog
    if (header.substring(0,3) === 'cog') return require('./referentiel/cog')(header)

    // finally by default text type
    return require('./texte')
  },
  isValid: (header) => {
    if (header === 'texte') return true
    if (header === 'entier') return true
    if (header === 'nombre') return true
    if (header.match(/nombre\(\d\)/)) return true
    if (header === 'booleen') return true
    if (header === 'timestamp') return true
    // interval type
    if (header === 'jour') return true
    if (header === 'mois') return true
    if (header === 'trimestre') return true
    if (header === 'annee') return true
    // nomenclature
    if (header === 'ref_bilanenergie_nomenclature') return true
    if (header === 'ref_csl_filiere') return true
    if (header.match(/ref_csl_operation_\d/)) return true
    // referentiel
    if (header === 'ref_polluant_eau') return true
    if (header === 'ref_station_air') return true
    if (header === 'ref_station_esu') return true
    if (header === 'port_locode') return true
    // cog
    if (header.substring(0,3) === 'cog') return true

    return false
  }
}
