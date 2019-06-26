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

async function lsTypes (baseUrl, id, args = [], opts = {}) {
  return got('api/action/types', {
    baseUrl,
    json: true
  })
}

async function ls (baseUrl, id, args, opts) {
  return got('api/action/_find', {
    baseUrl,
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

  const actionTypeConfig = JSON.parse(actionTypeConfigJSON)

  const body = {
    attributes: {
      actionTypeId: id,
      description,
      actionTypeConfig
    }
  }

  return got.post('api/action', {
    baseUrl,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function get (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  return got(`api/action/${id}`, {
    baseUrl,
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
  const actionTypeConfig = JSON.parse(actionTypeConfigJSON)

  const body = {
    attributes: {
      description,
      actionTypeConfig
    }
  }

  return got.put(`api/action/${id}`, {
    baseUrl,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}

async function del (baseUrl, id, args, opts) {
  if (id == null) throw new Error('id parameter required')

  return got.delete(`api/action/${id}`, {
    baseUrl,
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

  const params = JSON.parse(actionTypeParamsJSON)
  const body = { params }

  return got.post(`api/action/${id}/_fire`, {
    baseUrl,
    json: true,
    body,
    headers: { 'kbn-xsrf': 'what-evs' }
  })
}
