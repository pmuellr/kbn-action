'use strict'

module.exports = {
  all,
  actions,
  action,
  alerts,
  alert,
  es,
}

const got = require('got').default

const { debugLog } = require('../kbn-alert')

async function all (urlBase, _, opts) {
  throw new Error('all command not yet implemented')
}

async function actions (urlBase, _, opts) {
  throw new Error('actions command not yet implemented')
}

async function action (urlBase, actionId, opts) {
  const uri = `api/event_log/action/${actionId}/_find`
  const res = await kbnRequest('GET', urlBase, uri, {
    per_page: 10000,
    start: opts.startDate,
    end: opts.endDate,
  })
  return res.body.data
}

async function alerts (urlBase, _, opts) {
  throw new Error('alerts command not yet implemented')
}

async function alert (urlBase, alertId, opts) {
  const uri = `api/event_log/alert/${alertId}/_find`
  const res = await kbnRequest('GET', urlBase, uri, {
    per_page: 10000,
    start: opts.startDate,
    end: opts.endDate,
  })
  return res.body.data
}

async function es (urlBase) {
  const uri = '.kibana-event-log-*/_search?size=10000&sort=@timestamp'
  debugLog(`http request url: ${urlBase}/${uri}`)

  const result = await got(uri, {
    prefixUrl: urlBase,
    followRedirect: false,
    responseType: 'json',
  })

  return result.body.hits.hits
}

async function kbnRequest(method, prefixUrl, uri, searchParams) {
  let results
  try {
    return await got(uri, {
      method,
      prefixUrl,
      followRedirect: false,
      responseType: 'json',
      searchParams,
    })
  
  } catch (err) {
    if (err.response == null) {
      throw err
    }

    debugLogRequest(err.response)
  
    if (err.response.statusCode === 302) {
      const headers = err.response.headers || {}
      const redirect = headers.location
  
      if (redirect.startsWith('/login')) {
        throw new Error('userid/password required; eg http://elastic:changeme@localhost:5620')
      }
  
      throw new Error(`redirected to ${redirect}`)
    }

    throw err
  }
}

function debugLogRequest (result) {
  if (result) {
    if (result.request) {
      if (result.request.gotOptions) {
        const headers = result.request.gotOptions.headers || {}
        const printedRequestHeaders = new Set(['kbn-xsrf', 'content-type'])
        for (const name in headers) {
          if (!printedRequestHeaders.has(name)) continue
          debugLog(`http request header ${name}: ${headers[name]}`)
        }
      }
    }
  }
}
