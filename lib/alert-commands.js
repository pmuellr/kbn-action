'use strict'

module.exports = {
  'ls-types': lsTypes,
  ls,
  create,
  get,
  update,
  delete: del,
  fire
}

const got = require('got')

const { debugLog } = require('../kbn-alert')
const sloppyJSON = require('sloppy-json')

const JSONparse = sloppyJSON.parse

async function lsTypes (baseUrl, id, args = [], opts = {}) {
  const uri = 'api/alert/types'
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function ls (baseUrl, id, args, opts) {
  const uri = 'api/alert/_find?per_page=10000'
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function create (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [ interval, alertTypeParamsJSON, actionsJSON ] = args
  if (interval == null) throw new Error('interval parameter required')

  if (alertTypeParamsJSON == null) {
    throw new Error('JSON alert type params object required')
  }

  const alertTypeParams = JSONparse(alertTypeParamsJSON)

  if (actionsJSON == null) {
    throw new Error('JSON actions required')
  }

  let actions = JSONparse(actionsJSON)
  if (!Array.isArray(actions)) actions = [actions]

  const body = {
    alertTypeId: id,
    interval,
    actions,
    alertTypeParams
  }

  const uri = 'api/alert'
  debugLog(`http request url: ${baseUrl}/${uri}`)
  debugLog(`http request body: ${JSON.stringify(body, null, 4)}`)

  return got.post(uri, {
    baseUrl,
    followRedirect: false,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function get (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const uri = `api/alert/${id}`
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function update (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [ intervalString, alertTypeParamsJSON, actionsJSON ] = args
  if (intervalString == null) throw new Error('interval parameter required')

  const interval = parseInt(intervalString)
  if (isNaN(interval)) throw new Error(`interval parameter must be a number (was ${intervalString})`)

  if (alertTypeParamsJSON == null) {
    throw new Error('JSON alert type params object required')
  }

  const alertTypeParams = JSONparse(alertTypeParamsJSON)

  if (actionsJSON == null) {
    throw new Error('JSON actions required')
  }

  let actions = JSONparse(actionsJSON)
  if (!Array.isArray(actions)) actions = [actions]

  const body = {
    interval,
    actions,
    alertTypeParams
  }

  const uri = `api/alert/${id}`
  debugLog(`http request url: ${baseUrl}/${uri}`)
  debugLog(`http request body: ${JSON.stringify(body, null, 4)}`)

  return got.put(uri, {
    baseUrl,
    followRedirect: false,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function del (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const uri = `api/alert/${id}`
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got.delete(uri, {
    baseUrl,
    followRedirect: false,
    json: true,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function fire (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [ alertTypeParamsJSON ] = args

  if (alertTypeParamsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(alertTypeParamsJSON)
  const body = { params }

  const uri = `api/alert/${id}/_fire`
  debugLog(`http request url: ${baseUrl}/${uri}`)
  debugLog(`http request body: ${JSON.stringify(body, null, 4)}`)

  return got.post(uri, {
    baseUrl,
    followRedirect: false,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}
