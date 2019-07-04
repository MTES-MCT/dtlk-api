let nodemailer = require('nodemailer')
let { mailer: config } = require('../../env')
let { mailer: errors } = require('../errors')

let from = config.from
let replyTo = config.replyTo

let transportConfig

if (config.transport === 'sendmail') {
  transportConfig = {
    sendmail: true,
    args: ['-f', from]
  }
}
if (config.transport === 'smtp') {
  transportConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    tls: { rejectUnauthorized: false } // do not fail on invalid certs because melanie2 certificate is self-signed
  }
}

let mailer = () => nodemailer.createTransport(transportConfig)


module.exports = {
  sendMail: async (to, content) => {
    try {
      return await mailer().sendMail( {
        from: from,
        replyTo: replyTo,
        to: to.email,
        subject: content.subject,
        text: content.body,
        html: content.bodyHtml
      })
    }
    catch (err) {
      throw new errors.SendMailError(`Erreur lors de l'envoi du mail`)
    }
  }
}
