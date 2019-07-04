let { queue: config } = require('../../env')
let kue = require('kue')
let Redis = require('ioredis')

let queue_cfg

if (config.redis.is_sentinel) {
  queue_cfg = {
    prefix: config.redis.prefix,
    redis: {
      createClientFactory: () => new Redis({
        sentinels: config.redis.sentinel.hosts,
        name: config.redis.sentinel.master_name
      })
    }
  }
} else {
  queue_cfg = {
    prefix: config.redis.prefix,
    redis: {
      createClientFactory: () => new Redis({
        host: config.redis.standalone.host,
        port: config.redis.standalone.port
      })
    }
  }
}

let queue = kue.createQueue(queue_cfg)

queue.on('error', function (queueError) {
  console.error('queue in error', queueError)
})

module.exports = queue
