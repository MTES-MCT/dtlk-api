let redis_cfg = {
  is_sentinel: process.env.REDIS_IS_SENTINEL == "true" ? true : false,
  prefix: `alimentation-${process.env.PLATFORM}`
}
if (redis_cfg.is_sentinel) {
  redis_cfg.sentinel = {
    hosts: eval(process.env.REDIS_SENTINELS),
    master_name: process.env.REDIS_SENTINEL_MASTER_NAME
  }
}
else {
  redis_cfg.standalone = {
    host: process.env.REDIS_STANDALONE_HOST,
    port: process.env.REDIS_STANDALONE_PORT
  }
}

let env = {
  platform: process.env.PLATFORM,
  mongodb: {
    udata_uri: process.env.MONGODB_UDATA_URI,
    hub_uri: process.env.MONGODB_HUB_URI,
  },
  queue: {
    redis: redis_cfg,
    ui_port: process.env.REDIS_UI_DOCKER_PORT
  },
  api_alimentation_intranet: {
    port: process.env.API_ALIMENTATION_INTRANET_DOCKER_PORT,
    basePath: process.env.API_ALIMENTATION_INTRANET_DOCKER_BASEPATH,
    exposed_url: {
      scheme: process.env.API_ALIMENTATION_INTRANET_EXPOSED_URL_SCHEME,
      host: process.env.API_ALIMENTATION_INTRANET_EXPOSED_URL_HOST,
      port: process.env.API_ALIMENTATION_INTRANET_EXPOSED_URL_PORT,
      path: process.env.API_ALIMENTATION_INTRANET_EXPOSED_URL_PATH
    },
    logs: process.env.LOG // 'dev' or 'combined' for production
  },
  api_diffusion_internet: {
    port: process.env.API_DIFFUSION_INTERNET_DOCKER_PORT,
    basePath: process.env.API_DIFFUSION_INTERNET_DOCKER_BASEPATH,
    exposed_url: {
      scheme: process.env.API_DIFFUSION_INTERNET_EXPOSED_URL_SCHEME,
      host: process.env.API_DIFFUSION_INTERNET_EXPOSED_URL_HOST,
      port: process.env.API_DIFFUSION_INTERNET_EXPOSED_URL_PORT,
      path: process.env.API_DIFFUSION_INTERNET_EXPOSED_URL_PATH
    },
    logs: process.env.LOG // 'dev' or 'combined' for production
  },
  udata_base_url: process.env.UDATA_BASE_URL,
  ihm_diffusion_url: process.env.IHM_DIFFUSION_URL,
  mailer: {
    transport: process.env.MAILER_TRANSPORT,
    smtp: {
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT
    },
    from: {
      name: process.env.MAILER_FROM_NAME,
      address: process.env.MAILER_FROM_ADDRESS
    },
    replyTo: {
      name: process.env.MAILER_REPLY_TO_NAME,
      address: process.env.MAILER_REPLY_TO_ADDRESS
    }
  },
  uploadedFiles: {
    directory: process.env.UPLOADED_FILES_DIRECTORY,
    maxAttachmentSize: {
      value: process.env.UPLOADED_FILES_MAX_ATTACHMENT_SIZE_VALUE,
      display: process.env.UPLOADED_FILES_MAX_ATTACHMENT_SIZE_DISPLAY
    },
    maxRetentionTime: process.env.UPLOADED_FILES_MAX_RETENTION_TIME,
    allowedExtensions: process.env.UPLOADED_FILES_ALLOWED_EXTENSIONS
  }
}

module.exports = env
