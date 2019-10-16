let Mustache = require('mustache')
let moment = require('moment-timezone')
let { api_diffusion_internet: { exposed_url: apiUrl }, ihm_diffusion_url: ihmDiffusionInternetExposedUrl } = require('../env')
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
    <caption style="background-color: green; color: white; padding: 10px; font-weight: bold;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>✔ Tâche exécutée avec succès</div>
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
        {{ #datafile.creation }}
        <td style="padding: 5px; font-weight: bold;">Fichier de données créé</td>
        {{ /datafile.creation }}
        {{ ^datafile.creation }}
        <td style="padding: 5px; font-weight: bold;">Fichier de données</td>
        {{ /datafile.creation }}
        <td style="padding: 5px;">{{ datafile.title }}</td>
      </tr>
      {{ #datafile.replaceMillesime }}
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">Millesime remplacée</td>
        <td style="padding: 5px;">Millésime {{ datafile.millesime }}</td>
      </tr>
      {{ /datafile.replaceMillesime }}
      {{ #datafile.addMillesime }}
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">Nouveau millésime ajoutée</td>
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
        <td style="padding: 5px; border-top: 1px solid #ddd; font-weight: bold;">Résultats</td>
        <td style="padding: 5px; border-top: 1px solid #ddd">Tâche exécutée en {{ job.duration }}s</td>
      </tr>
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; border-top: 1px solid #ddd;">{{ datafile.columns }} colonnes ont été créées</td>
      </tr>
      <tr>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; font-weight: bold;">&nbsp;</td>
        <td style="padding: 5px; border-top: 1px solid #ddd;">{{ datafile.rows }} lignes ont été intégrées</td>
      </tr>
    </tbody>
  </table>
  <hr style="margin-top: 20px; margin-bottom: 20px;"/>
  <div style="font-weight: bold; margin-bottom: 8px;">
    📎 Liens Internet de consultion du fichier intégré:
  </div>
  <div style="margin-left: 20px; margin-bottom: 4px; font-size: 0.8em;">
    🔧 API: <a href="{{ datafile.url.api }}">{{ datafile.url.api }}</a>
  </div>
  <div style="margin-left: 20px; font-size: 0.8em;">
    📥 Fichier CSV: <a href="{{ datafile.url.csv }}">{{ datafile.url.csv }}</a>
  </div>
  <hr style="margin-top: 20px; margin-bottom: 20px;"/>
  <div style="color: orange; font-weight: bold;">👽 Le Robot Datalake 👽</div>
</div>`

let tplBody =
`Bonjour {{ user.name }}

----------------------------------------------------
📝 Rapport d'exécution de la tâche n°{{ job.id }} :
----------------------------------------------------
✔ Tâche exécutée avec succès le {{ job.finishAt.day }} à {{ job.finishAt.time }}
 ⁍ Type de tâche : {{ job.type }}
 ⁍ Jeu de données : {{ dataset.title }}
{{ #datafile.creation }}
   Fichier de données créé : {{ datafile.title }}
{{ /datafile.creation }}
{{ ^datafile.creation }}
   Fichier de données :  {{ datafile.title }}
{{ /datafile.creation }}
{{ #datafile.replaceMillesime }}
   Millésime remplacée : {{ datafile.millesime }}
{{ /datafile.replaceMillesime }}
{{ #datafile.addMillesime }}
   Nouveau millésime ajouté : {{ datafile.millesime }}
{{ /datafile.addMillesime }}
 ⁍ Fichier utilisé : {{ file.name }}
 ⁍ Tâche exécutée en {{ job.duration }}s
 ⁍ {{ datafile.columns }} colonnes ont été utilisées
 ⁍ {{ datafile.rows }} lignes ont été intégrées

----------------------------------------------------
📎 Liens Internet de consultion du fichier intégré:
----------------------------------------------------
🔧 API: {{ datafile.url.api }}
📥 Fichier CSV: {{ datafile.url.csv }}

👽 Le Robot Datalake 👽`

let tplSbuject = `✔ Votre fichier {{ file. name }} a été intégré dans le Datalake`

let getTypeJob = (job) => {
  if (job.type === 'createDatafile') return `Création d'un fichier de données`
  if (job.type === 'addDatafileMillesime') return `Création d'un nouveau millésime d'un fichier de données`
  if (job.type === 'replaceDatafileMillesime') return  (job.progress_data.datafile.millesimes === 1) ? `Remplacement d'un fichier de données` : `Remplacement d'un millésime d'un fichier de données`
}
let getUrls = (job) => {
  let ihm = `${ ihmDiffusionInternetExposedUrl }datafile/${ job.progress_data.datafile.rid }`
  let csv = `${ apiDiffusionInternetExposedUrl }v1/datafiles/${ job.progress_data.datafile.rid }/csv?`
  if (job.type === 'createDatafile') return { api: ihm + `?millesime=${ job.data.millesimeDatafile }`, csv: csv + `millesime=${ job.data.millesimeDatafile }&withColumnName=true&withColumnDescription=true`}
  if (job.type === 'addDatafileMillesime') return { api: ihm + `?millesime=${ job.data.millesimeDatafile }`, csv: csv + `millesime=${ job.data.millesimeDatafile }&withColumnName=true&withColumnDescription=true` }
  if (job.type === 'replaceDatafileMillesime') return { api: ihm + `?millesime=${ job.data.millesimeDatafile }`,csv: csv + `millesime=${ job.data.millesimeDatafile }&withColumnName=true&withColumnDescription=true`}
}

module.exports = (job) => {
  let typeJob = getTypeJob(job)
  let jobDate = moment(Number(job.updated_at)).tz('Europe/Paris')
  let urls = getUrls(job)
  let params = {
    user: { name: `${ job.progress_data.user.first_name } ${ job.progress_data.user.last_name }` },
    job: {
      id: job.id,
      type: typeJob,
      finishAt: { day: jobDate.format('DD/MM/YYYY'), time: jobDate.format('HH:mm') },
      duration: Math.floor((job.updated_at - job.started_at)/1000)
    },
    dataset: { title: job.progress_data.dataset.title },
    datafile: {
      title: job.progress_data.datafile.title,
      millesime: job.data.millesimeDatafile,
      rows: job.progress_data.split.totalLines,
      columns: job.progress_data.columns.length,
      url: {
        api: urls.api,
        csv: urls.csv
      },
      creation: job.type === 'createDatafile' ? true : false,
      replaceMillesime: job.type === 'replaceDatafileMillesime' ? true : false,
      addMillesime: job.type === 'addDatafileMillesime' ? true : false
    },
    file: { name: job.data.nameFile }
  }
  return {
    subject: Mustache.render(tplSbuject, params),
    body: Mustache.render(tplBody, params),
    bodyHtml: Mustache.render(tplBodyHtml, params)
  }
}
