'use strict'

module.exports = {
  all: allCommand,
  actions: actionsCommand,
  action: actionCommand,
  alerts: alertsCommand,
  alert: alertCommand,
  es: esCommand,
}

const got = require('got').default

const { ls: lsActions } = require('./action-commands')
const { ls: lsAlerts } = require('./alert-commands')
const { debugLog } = require('../kbn-alert')

async function allCommand (urlBase, _, opts) {
  return await collectEventLogPromises([
    actionsCommand(urlBase, _, opts),
    alertsCommand(urlBase, _, opts),
  ])
}

async function actionsCommand (urlBase, _, opts) {
  const { body: actions } = await lsActions(urlBase)

  const elPromises = actions.map(action => 
    actionCommand(urlBase, action.id, opts)
  )

  return await collectEventLogPromises(elPromises)
}

async function actionCommand (urlBase, actionId, opts) {
  const uri = `api/event_log/action/${actionId}/_find`
  const res = await kbnRequest('GET', urlBase, uri, {
    per_page: 10000,
    start: opts.startDate,
    end: opts.endDate,
  })

  if (res == null) return []
  return res.body.data
}

async function alertsCommand (urlBase, _, opts) {
  const { body: { data: alerts } } = await lsAlerts(urlBase)

  const elPromises = alerts.map(alert => 
    alertCommand(urlBase, alert.id, opts)
  )

  return await collectEventLogPromises(elPromises)
}

async function alertCommand (urlBase, alertId, opts) {
  const uri = `api/event_log/alert/${alertId}/_find`
  const res = await kbnRequest('GET', urlBase, uri, {
    per_page: 10000,
    start: opts.startDate,
    end: opts.endDate,
  })
  if (res == null) return []
  return res.body.data
}

async function esCommand (urlBase, _, opts) {
  const uri = '.kibana-event-log-*/_search?size=10000&sort=@timestamp'
  debugLog(`http request url: ${urlBase}/${uri}`)

  const res = await got(uri, {
    prefixUrl: urlBase,
    followRedirect: false,
    responseType: 'json',
    searchParams: {
      size: 10000,
      sort: '@timestamp',
      q: `@timestamp:[${opts.startDate} TO ${opts.endDate}]`
    }
  })
  if (res == null) return []

  return res.body.hits.hits
}

async function collectEventLogPromises(elPromises) {
  await Promise.all(elPromises)

  let results = []
  for (const elPromise of elPromises) {
    results = results.concat(await elPromise)
  }

  return results.sort((e1, e2) => 
    e1['@timestamp'].localeCompare(e2['@timestamp'])
  )
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
      throw new Error(`error in http request ${method} ${uri}: ${err.message}`)
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

    if (err.response.statusCode === 404) {
      return null
    }

    throw new Error(`error in http request ${method} ${uri}: ${err.message}`)
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
