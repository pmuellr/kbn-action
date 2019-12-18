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

  const [name, interval, paramsJSON, actionsJSON] = args
  if (interval == null) throw new Error('interval parameter required')

  if (name == null) throw new Error('name parameter required')

  if (paramsJSON == null) {
    throw new Error('JSON alert type params object required')
  }

  const params = JSONparse(paramsJSON)

  if (actionsJSON == null) {
    throw new Error('JSON actions required')
  }

  let actions = JSONparse(actionsJSON)
  if (!Array.isArray(actions)) actions = [actions]

  const body = {
    alertTypeId: id,
    name,
    schedule: { interval },
    actions,
    params
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

  const [name, interval, paramsJSON, actionsJSON, throttle = null] = args
  if (name == null) throw new Error('name parameter required')

  if (interval == null) throw new Error('interval parameter required')

  if (paramsJSON == null) {
    throw new Error('JSON alert type params object required')
  }

  const params = JSONparse(paramsJSON)

  if (actionsJSON == null) {
    throw new Error('JSON actions required')
  }

  let actions = JSONparse(actionsJSON)
  if (!Array.isArray(actions)) actions = [actions]

  const body = {
    name,
    interval,
    actions,
    params,
    throttle,
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

  const [paramsJSON] = args

  if (paramsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(paramsJSON)
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
