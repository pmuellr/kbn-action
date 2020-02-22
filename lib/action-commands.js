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

const got = require('got').default

const { debugLog } = require('../kbn-action')
const hJSON = require('hjson')

const JSONparse = hJSON.parse

async function lsTypes (prefixUrl, id, args = [], opts = {}) {
  const uri = 'api/action/types'
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json'
  })
}

async function ls (prefixUrl, id, args, opts) {
  const uri = 'api/action/_find?per_page=10000'
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json'
  })
}

async function create (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [name, configJSON, secretsJSON] = args
  if (name == null) throw new Error('name parameter required')

  if (configJSON == null) {
    throw new Error('JSON config object required')
  }

  if (secretsJSON == null) {
    throw new Error('JSON secrets object required')
  }

  const config = JSONparse(configJSON)
  const secrets = JSONparse(secretsJSON)

  const body = JSON.stringify({
    actionTypeId: id,
    name,
    config,
    secrets
  })

  const uri = 'api/action'
  debugLog(`http request url: ${prefixUrl}/${uri}`)
  debugLog(`http request body: ${body}`)

  return got.post(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function get (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const uri = `api/action/${id}`
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json'
  })
}

async function update (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [name, configJSON, secretsJSON] = args
  if (name == null) throw new Error('name parameter required')

  if (configJSON == null) {
    throw new Error('JSON config object required')
  }

  if (secretsJSON == null) {
    throw new Error('JSON secrets object required')
  }

  const config = JSONparse(configJSON)
  const secrets = JSONparse(secretsJSON)

  const body = JSON.stringify({
    name,
    config,
    secrets
  })

  const uri = `api/action/${id}`
  debugLog(`http request url: ${prefixUrl}/${uri}`)
  debugLog(`http request body: ${body}`)

  return got.put(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function del (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const uri = `api/action/${id}`
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got.delete(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function execute (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [paramsJSON] = args

  if (paramsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(paramsJSON)
  const body = JSON.stringify({ params })

  const uri = `api/action/${id}/_execute`
  debugLog(`http request url: ${prefixUrl}/${uri}`)
  debugLog(`http request body: ${body}`)

  return got.post(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}
