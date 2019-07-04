let testCreateJobAddDatafileMillesime = async () => {
  let data = {
    user: {
      id: 'userId',
      name: 'userName',
      email: 'userEmail',
      apiKey: 'userApiKey',
    },
    dataset: {
      id: 'datasetId',
      title: 'datasetTitle'
    },
    datafile: {
      rid: 'datafileRid',
      millesime: 2,
      metadata: {
        title: 'datafileTitle',
        description: 'datafileDescription'
      }
    },
    file: {
      token: 'fileToken',
      title: 'fileTitle'
    }
  }
  try {
    let job = await require('./service/queue/producers/addDatafileMillesime')(data)
    console.info(`job ${ job.type } created with id ${ job.id }`)
  }
  catch (err) {
    console.info(err.name, err.message)
  }
}
let testCreateJobReplaceDatafileMillesime = async () => {
  let data = {
    user: {
      id: 'userId',
      name: 'userName',
      email: 'userEmail',
      apiKey: 'userApiKey',
    },
    dataset: {
      id: 'datasetId',
      title: 'datasetTitle'
    },
    datafile: {
      rid: 'datafileRid',
      millesime: 'datafileMillesime',
      metadata: {
        title: 'datafileTitle',
        description: 'datafileDescription'
      }
    },
    file: {
      token: 'fileToken',
      title: 'fileTitle'
    }
  }
  try {
    let job = await require('./service/queue/producers/replaceDatafileMillesime')(data)
    console.info(`job ${ job.type } created with id ${ job.id }`)
  }
  catch (err) {
    console.info(err.name, err.message)
  }
}
let testCreateJobSendMail = async () => {
  let data = {
    to: {
      id: 'toId',
      email: 'toEmail',
      name: 'toName',
    },
    content: {
      subject: 'contentSubject',
      body: 'bodyContent',
      bodyHtml: 'bodyHtmlContent'
    }
  }
  try {
    let job = await require('./service/queue/producers/sendMail')(data)
    console.info(`job ${ job.type } created with id ${ job.id }`)
  }
  catch (err) {
    console.error(err.name, err.message)
  }
}

testCreateJobCreateDatafile()
