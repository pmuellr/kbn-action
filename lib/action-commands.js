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

  const [ description, actionTypeConfigJSON ] = args
  if (description == null) throw new Error('description parameter required')

  if (actionTypeConfigJSON == null) {
    throw new Error('JSON config object required')
  }

  const actionTypeConfig = JSONparse(actionTypeConfigJSON)

  const body = {
    attributes: {
      actionTypeId: id,
      description,
      actionTypeConfig
    }
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

  const [ description, actionTypeConfigJSON ] = args
  if (description == null) throw new Error('description parameter required')

  if (actionTypeConfigJSON == null) {
    throw new Error('JSON config object required')
  }
  const actionTypeConfig = JSONparse(actionTypeConfigJSON)

  const body = {
    attributes: {
      description,
      actionTypeConfig
    }
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

async function fire (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [ actionTypeParamsJSON ] = args

  if (actionTypeParamsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(actionTypeParamsJSON)
  const body = { params }

  const uri = `api/action/${id}/_fire`
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
