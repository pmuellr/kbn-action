'use strict'

module.exports = {
  'ls-types': lsTypes,
  ls,
  create,
  get,
  update,
  delete: del,
  execute
}

const got = require('got')

const { debugLog } = require('../kbn-action')
const sloppyJSON = require('sloppy-json')

const JSONparse = sloppyJSON.parse

async function lsTypes (baseUrl, id, args = [], opts = {}) {
  const uri = 'api/action/types'
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function ls (baseUrl, id, args, opts) {
  const uri = 'api/action/_find?per_page=10000'
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function create (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [description, configJSON, secretsJSON] = args
  if (description == null) throw new Error('description parameter required')

  if (configJSON == null) {
    throw new Error('JSON config object required')
  }

  if (secretsJSON == null) {
    throw new Error('JSON secrets object required')
  }

  const config = JSONparse(configJSON)
  const secrets = JSONparse(secretsJSON)

  const body = {
    actionTypeId: id,
    description,
    config,
    secrets
  }

  const uri = 'api/action'
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

  const uri = `api/action/${id}`
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got(uri, {
    baseUrl,
    followRedirect: false,
    json: true
  })
}

async function update (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [description, configJSON, secretsJSON] = args
  if (description == null) throw new Error('description parameter required')

  if (configJSON == null) {
    throw new Error('JSON config object required')
  }

  if (secretsJSON == null) {
    throw new Error('JSON secrets object required')
  }

  const config = JSONparse(configJSON)
  const secrets = JSONparse(secretsJSON)

  const body = {
    description,
    config,
    secrets
  }

  const uri = `api/action/${id}`
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

  const uri = `api/action/${id}`
  debugLog(`http request url: ${baseUrl}/${uri}`)

  return got.delete(uri, {
    baseUrl,
    followRedirect: false,
    json: true,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function execute (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [paramsJSON] = args

  if (paramsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(paramsJSON)
  const body = { params }

  const uri = `api/action/${id}/_execute`
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
