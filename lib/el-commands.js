'use strict'

module.exports = {
  ls,
}

const got = require('got').default

const { debugLog } = require('../kbn-alert')

async function ls (prefixUrl, id, args, opts) {
  const uri = '.kibana-event-log-8.0.0/_search?size=10000&sort=@timestamp'
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
  })
}
