'use strict'

module.exports = {
  watch: watchCommand,
}

const got = require('got').default

const { debugLog } = require('../kbn-tm')

async function watchCommand (esURL) {
  setInterval(runIteration, 1000, esURL);
  return new Promise(() => {})
}

async function runIteration(esURL) {
  const uri = '.kibana_task_manager/_search'
  const searchOpts = {
    size: 10000,
  }
  const response = await esRequest('GET', esURL, uri, searchOpts)
  const tasks = response.body.hits.hits.map(so => {
    const task = so._source.task
    task.updated_at = so._source.updated_at
    return task
  })

  const tasksByStatus = splitTasksByStatus(tasks)
  const statuses = Object.keys(tasksByStatus)

  console.log(new Date().toISOString().replace('T', ' '))
  for (const status of statuses) {
    const tasks = tasksByStatus[status]
    const count = `${tasks.length}`.padStart(10)

    console.log(`    ${status.padEnd(10)}: ${count} tasks`)
    // for (const task of tasks) {
    //   printTask(task)
    // }
  }
}

function printTask(task) {
  console.log(`        ${task.taskType}`)
  console.log(`            runAt:     ${task.runAt}`)
  if (task.retryAt) {
    console.log(`            retryAt:   ${task.runAt}`)
  }
  if (task.startedAt) {
    console.log(`            startedAt: ${task.runAt}`)
  }
  if (task.attempts) {
    console.log(`            attempts:  ${task.attempts}`)
  }
}

function splitTasksByStatus(tasks) {
  const result = {}
  for (const task of tasks) {
    const status = task.status
    if (result[status] == null) {
      result[status] = []
    }
    result[status].push(task)
  }
  return result
}

async function esRequest(method, prefixUrl, uri, searchParams) {
  let results
  debugLog(`http request url: ${prefixUrl}/${uri} searchParams: ${JSON.stringify(searchParams)}`)
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
