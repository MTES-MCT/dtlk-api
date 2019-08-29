let queue = require('../instance')
let commons = require('./datafileCommons')

let createDatafileConsumer =  queue.process('createDatafile', 1 , async function (job, done) {
  let notify = (progress, total, data) => job.progress(progress, total, data)
  let tempCollectionNameMongo = `${ job.data.idDataset }-new`
  let result = {
    success: false,
    finish: false,
    progress: 0,
    jobId: job.id
  }

  // processing job
  try {
    job.progress(0, 100, commons.result.update(result, { step: `Début du traitement du fichier ${ job.data.nameFile } - Ajout d'un fichier de données au jeu de données ${ job.data.idDataset }` }))

    let user = await commons.retrieve.user(job.data.idUser)
    job.progress(0, 100, commons.result.update(result, { user: user })) // => result.user = { id, last_name, first_name, email, apiKey }

    let dataset = await commons.retrieve.dataset(result.user.apiKey, job.data.idDataset)
    job.progress(0, 100, commons.result.update(result, { dataset: dataset })) // => result.dataset = { id, title, ... }

    job.progress(0, 100, commons.result.update(result, { step: `Nettoyage - démarrage` }))
    await commons.job.sanitize(job.id, job.data.tokenFile, tempCollectionNameMongo)
    job.progress(1, 100, commons.result.update(result, { step: `Nettoyage - fin`, progress: 1 }))

    job.progress(1, 100, commons.result.update(result, { step: `Optimisation - démarrage` }))
    let splitResult = await commons.job.optimize(job.data.tokenFile)
    job.progress(4, 100, commons.result.update(result, { step: `Optimisation - fin`, progress: 4, split: splitResult })) // => result.split = { totalLines, totalChunks, linesByChunk, delimiter }

    job.progress(4, 100, commons.result.update(result, { step: `Traitement des entêtes - démarrage` }))
    let { headers, columns } = await commons.file.retrieveHeadersAndColumns(job.data.tokenFile)
    job.progress(5, 100, commons.result.update(result, { step: `Traitement des entêtes - fin`, progress: 5, headers: headers, columns: columns })) // => result.headers = [{ order, description, type, unit, name }] and result.columns = [{ name, mapping, description, type }]

    job.progress(5, 100, commons.result.update(result, { step: `Traitement du fichier - démarrage` }))
    await commons.file.process(job, result.split.totalChunks, result.split.totalLines, result.split.linesByChunk, result.headers, tempCollectionNameMongo, result)
    job.progress(95, 100, commons.result.update(result, { step: `Traitement du fichier - fin`, progress: 95 }))

    job.progress(95, 100, commons.result.update(result, { step: `Création du fichier de données dans udata - démarrage` }))
    let datafile = await commons.udata.createDatafile(result.user.apiKey, result.dataset.id, job.data.metadataDatafile, job.data.millesimeDatafile, result.split.totalLines, result.columns)
    job.progress(96, 100, commons.result.update(result, { step: `Création du fichier de données dans udata - fin`, progress: 96, datafile: datafile })) // => result.datafile = { rid, title, description, millesimes, millesimes_info: { millesime, rows, columns }, url }

    job.progress(96, 100, commons.result.update(result, { step: `Mise en conformité des objets Mongo - démarrage` }))
    await commons.mongodb.adjustTempObjects(tempCollectionNameMongo, `${ result.datafile.rid }_${ job.data.millesimeDatafile }`)
    job.progress(99, 100, commons.result.update(result, { step: `Mise en conformité des objets Mongo - fin`, progress: 99 }))

    job.progress(99, 100, commons.result.update(result, { step: `Purge des objets temporaires - démarrage` }))
    await commons.job.purgeComplete(job.id, job.data.tokenFile, result)
    job.progress(100, 100, commons.result.update(result, { step: `Purge des objets temporaires - fin`, progress: 100 }))

    job.progress(100, 100, commons.result.update(result, { step: `Fin du traitement du fichier ${ job.data.nameFile } - Ajout d'un fichier de données au jeu de données ${ job.data.idDataset }`, success: true, finish: true }))

    await commons.logs.createDatafile(result.user, result.dataset, result.datafile)
  }
  catch (error) {
    let err = { message: error.message }
    if (error.errorsList) err.csvParsingErrorsList = error.errorsList
    job.progress(100, 100, commons.result.update(result, { step: `Erreur du traitement du fichier ${ job.data.nameFile } - Ajout d'un fichier de données au jeu de données ${ job.data.idDataset }`, success: false, finish: true, error: err }))
  }

  if (result.success === true) done()
  if (result.success === false) done(result.error.message)

  // send mail with result of the job
  let mail = await commons.mail.send(job.id)
  // save message in mongo
  await commons.mongodb.addMessage(mail)
  // copy kueJob in mongo
  await commons.mongodb.addJob(job.id)
})

module.exports = createDatafileConsumer
