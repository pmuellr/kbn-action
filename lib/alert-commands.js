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

const got = require('got').default

const { debugLog } = require('../kbn-alert')
const hJSON = require('hjson')

const JSONparse = hJSON.parse

async function lsTypes (prefixUrl, id, args = [], opts = {}) {
  const uri = 'api/alert/types'
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
  })
}

async function ls (prefixUrl, id, args, opts) {
  const uri = 'api/alert/_find?per_page=10000'
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
  })
}

async function create (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [name, interval, paramsJSON, actionsJSON] = args
  debugLog(`create: ${JSON.stringify({name, interval, paramsJSON, actionsJSON})}`)
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

  const body = JSON.stringify({
    alertTypeId: id,
    name,
    schedule: { interval },
    actions,
    consumer: opts.consumer,
    tags: opts.tags,
    params,
  })

  const uri = 'api/alert'
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

  const uri = `api/alert/${id}`
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
  })
}

async function update (prefixUrl, id, args, opts) {
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

  const body = JSON.stringify({
    name,
    interval,
    actions,
    params,
    throttle,
    tags: opts.tags,
  })

  const uri = `api/alert/${id}`
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

  const uri = `api/alert/${id}`
  debugLog(`http request url: ${prefixUrl}/${uri}`)

  return got.delete(uri, {
    prefixUrl,
    followRedirect: false,
    responseType: 'json',
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function fire (prefixUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  const [paramsJSON] = args

  if (paramsJSON == null) {
    throw new Error('JSON params object required')
  }

  const params = JSONparse(paramsJSON)
  const body = JSON.stringify({ params })

  const uri = `api/alert/${id}/_fire`
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
