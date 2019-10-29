let Mustache = require('mustache')
let moment = require('moment-timezone')
let { api_diffusion_internet: { exposed_url: apiUrl } } = require('../env')
let apiDiffusionInternetExposedUrl = `${ apiUrl.scheme }://${ apiUrl.host  }:${ apiUrl.port }/${ apiUrl.path }`

let tplBodyHtml =
`<div style="padding: 15px;">
  <div>
    Bonjour {{ user.name }}
  </div>
  <hr style="margin-top: 20px; margin-bottom: 20px;"/>
  <div>
  📝 <span style="font-weight: bold">Rapport d'exécution de la tâche n°{{ job.id }} :</span></div>
  <br />
  <table style="width: 100%; border-collapse: collapse; border: 1px solid green; border-spacing: 0px;" >
    <caption style="background-color: red; color: white; padding: 10px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>✘ Erreur lors de l'exécution de la tâche</div>
        <div style="text-align: center; font-size: 0.8em;">{{ job.finishAt.day }}<br/>{{ job.finishAt.time }}</div>
      </div>
    </caption>
    <tbody>
      <tr>
        <td style="padding: 5px; font-weight: bold;">⁍</td>
        <td style="padding: 5px; font-weight: bold;">Type de tâche</td>
        <td style="padding: 5px;">{{ job.type }}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">⁍</td>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">Jeu de données</td>
        <td style="padding: 5px; border-top: 1px solid #ddd">{{ dataset.title }}</td>
      </tr>
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">Fichier de données</td>
        <td style="padding: 5px;">{{ datafile.title }}</td>
      </tr>
      {{ #datafile.replaceMillesime }}
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">Numéro du millésime devant être remplacée</td>
        <td style="padding: 5px;">Millésime {{ datafile.millesime }}</td>
      </tr>
      {{ /datafile.replaceMillesime }}
      {{ #datafile.addMillesime }}
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">Numéro du millésime devant être ajoutée</td>
        <td style="padding: 5px;">Millésime {{ datafile.millesime }}</td>
      </tr>
      {{ /datafile.addMillesime }}
      <tr>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">⁍</td>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">Fichier utilisé</td>
        <td style="padding: 5px; border-top: 1px solid #ddd">{{ file.name }}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">⁍</td>
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">Erreurs</td>
        <td style="padding: 5px; border-top: 1px solid #ddd">{{ error.message }}</td>
      </tr>
      {{ #error.list }}
      <tr>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px; border-top: 1px solid #ddd">ligne {{ line }} - colonne {{ column }} : {{ message }}</td>
      </tr>
      {{ /error.list }}
      {{ #error.all }}
      <tr>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px; border-top: 1px solid #ddd; color: orange">Toutes les erreurs sont affichées</td>
      </tr>
      {{ /error.all }}
      {{ ^error.all }}
      <tr>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px;">&nbsp;</td>
        <td style="padding: 5px; border-top: 1px solid #ddd; color: orange">Seules les 50 premières erreurs sont affichées</td>
      </tr>
      {{ /error.all }}
    </tbody>
  </table>
  <hr style="margin-top: 20px; margin-bottom: 20px;"/>
  <div style="color: orange; font-weight: bold;">👽 Le Robot Datalake 👽</div>
</div>`

let tplBody =
`Bonjour {{ user.name }}

----------------------------------------------------
📝 Rapport d'exécution de la tâche n°{{ job.id }} :
----------------------------------------------------
✘ Erreur lors de l'exécution de la tâche le {{ job.finishAt.day }} à {{ job.finishAt.time }}
 ⁍ Type de tâche : {{ job.type }}
 ⁍ Jeu de données : {{ dataset.title }}
   Fichier de données : {{ datafile.title }}
{{ #datafile.replaceMillesime }}
   Numéro du millésime devant être remplacée : {{ datafile.millesime }}
{{ /datafile.replaceMillesime }}
{{ #datafile.addMillesime }}
   Numéro du millésime devant être ajoutée : Millésime {{ datafile.millesime }}
{{ /datafile.addMillesime }}
 ⁍ Fichier utilisé : {{ file.name }}
 ⁍ Erreurs: {{ error.message }}
{{ #error.list }}
     ligne {{ line }} - colonne {{ column }} : {{ message }}
{{ #error.all }}
   Toutes les erreurs sont affichées
{{ /error.all }}
{{ ^error.all }}
   Seules les 50 premières erreurs sont affichées
{{ /error.all }}
{{ /error.list }}

👽 Le Robot Datalake 👽`

let tplSubject = `✘ Votre fichier {{ file.name }} n'a pas été intégré dans le Datalake`

let getTypeJob = (job) => {
  if (job.type === 'createDatafile') return `Création d'un fichier de données`
  if (job.type === 'addDatafileMillesime') return `Création d'un nouveau millésime d'un fichier de données`
  if (job.type === 'replaceDatafileMillesime') return (job.progress_data.datafile.millesimes === 1) ? `Remplacement d'un fichier de données` : `Remplacement d'un millésime d'un fichier de données`
}

module.exports = (job) => {
  let typeJob = getTypeJob(job)
  let jobDate = moment(Number(job.updated_at)).tz('Europe/Paris')
  let params = {
    user: { name: `${ job.progress_data.user.first_name } ${ job.progress_data.user.last_name }` },
    job: {
      id: job.id,
      type: typeJob,
      finishAt: { day: jobDate.format('DD/MM/YYYY'), time: jobDate.format('HH:mm') }
    },
    dataset: { title: job.progress_data.dataset.title },
    datafile: {
      title: job.type === 'createDatafile' ? job.data.metadataDatafile.title : job.progress_data.datafile.title,
      millesime: job.data.millesimeDatafile,
      creation: job.type === 'createDatafile' ? true : false,
      replaceMillesime: job.type === 'replaceDatafileMillesime' ? true : false,
      addMillesime: job.type === 'addDatafileMillesime' ? true : false
    },
    file: { name: job.data.nameFile },
    error: {
      message: job.progress_data.error.message,
      list: job.progress_data.error.csvParsingErrorsList || [],
      all: job.progress_data.error.csvParsingErrorsList ? (job.progress_data.error.csvParsingErrorsList.length < 50) : true
    }
  }
  return {
    subject: Mustache.render(tplSubject, params),
    body: Mustache.render(tplBody, params),
    bodyHtml: Mustache.render(tplBodyHtml, params)
  }
}
