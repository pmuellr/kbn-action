#!/usr/bin/env node

'use strict'

const path = require('path')
const debugLog = getDebugLog()

module.exports = {
  main,
  debugLog
}

const meow = require('meow')
const chalk = require('chalk')

const baseUrl = require('./lib/base-url')
const commands = require('./lib/el-commands')

const PROGRAM = path.basename(__filename)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// @ts-ignore
if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { _, flags } = args

  if (flags.help) args.showHelp()
  if (flags.version) args.showVersion()

  const urlBase = baseUrl.fromFlags(flags)
  const command = 'ls'

  debugLog(`command: ${command}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  const opts = { debugLog, ...flags }
  let result
  try {
    result = await commands[command](urlBase, opts)
  } catch (err) {
    if (err.response == null) {
      debugLogRequest(err)
      debugLog(err.stack)
      logError(err.message)
    }

    result = err.response
  }

  debugLogRequest(result)

  debugLog(`http statusCode: ${result.statusCode}`)
  if (result.statusCode === 302) {
    const headers = result.headers || {}
    const redirect = headers.location

    if (redirect.startsWith('/login')) {
      logError('userid/password required; eg http://elastic:changeme@localhost:5620')
    }

    logError(`redirected to ${redirect}`)
  }

  if (result.statusCode === 204) {
    return
  }

  if (result.statusCode !== 200) {
    logError(`status code ${result.statusCode}\nbody: ${JSON.stringify(result.body, null, 4)}`)
  }

  const providerColor = getColoror()
  const actionColor = getColoror(2)
  const iidColor = getColoror(0)
  const soColor = getColoror(4)

  for (const eventHit of result.body.hits.hits) {
    const event = eventHit._source
    const { provider, action, duration } = event.event
    const timeStamp = event['@timestamp'].substr(11)
    const instanceId = event.kibana.alerting && event.kibana.alerting.instance_id
    const sos = getSOs(event.kibana.saved_objects)

    const parts = []

    const durationString = getDurationString(duration)
    const iid = instanceId ? `iid: ${iidColor(instanceId)}` : chalk.black(' ')

    parts.push(`${timeStamp} ${providerColor(provider)}:${actionColor(action)}`.padEnd(60))
    parts.push(durationString.padEnd(10))
    parts.push(iid.padEnd(22))
    parts.push(`sos: ${sos.map(so => soColor(so)).join(', ')}`)

    console.log(parts.join(' '))
  }
}

function getColoror(initial = 0) {
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
  const map = new Map()
  let index = initial
  return function coloror(string) {
    if (!map.has(string)) {
      map.set(string, index)
      index = (index + 1) % colors.length
    }
    const color = colors[map.get(string)]
    return chalk[color](string)
  }
}

function getDurationString(duration) {
  if (duration == null) return ''

  return ` (${Math.round(duration / 1000000)} ms)`
}

function getSOs(savedObjects) {
  if (savedObjects == null) return []
  return savedObjects.map(so => `${so.type}:${so.id.substr(0,4)}`)
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

function logError (message) {
  console.log(`${PROGRAM}: ${message}`)
  process.exit(1)
}

/** @type { () => ((message: string) => void) } */
function getDebugLog () {
  if (process.env.DEBUG == null) return () => {}

  return function debugLog (message) {
    if (typeof message === 'object') message = JSON.stringify(message)
    console.log(`${PROGRAM}: DEBUG: ${message}`)
  }
}

// returns parsed args from meow
function parseArgs () {
  const defaultUrlBase = process.env.ES_URLBASE || baseUrl.DefaultURL
  const meowOptions = {
    help: getHelpText(),
    flags: {
      help: { type: 'boolean', alias: 'v' },
      version: { type: 'boolean', alias: 'v' },
      space: { type: 'string', alias: 's', default: baseUrl.DefaultSpace },
      urlBase: { type: 'string', alias: 'u', default: defaultUrlBase },
      tags: { type: 'string', default: '' },
      consumer: { type: 'string', default: 'kbn-alert' },
    }
  }

  // @ts-ignore
  const meowResponse = meow(meowOptions)
  if (meowResponse.flags.tags != null) {
    meowResponse.flags.tags = meowResponse.flags.tags
      .split(/,/g)
      .map(tag => tag.trim())
      .filter(tag => !!tag)
  }

  return meowResponse
}

function getHelpText () {
  return `
usage:
  ${PROGRAM}

options:
  -h --help       print this help
  -v --version    print the version of the program
  -u --urlBase    Kibana base URL
  -s --space      Kibana space to use; default: default

You can also set the env var KBN_URLBASE as the Kibana base URL.

Set the DEBUG environment variable to any string for additional diagnostics.

The "--tags" option value should be a comma-separated list of tags, defaulting
to an empty list.

For authenticated Kibana access, the url should include the userid/password,
for example "http://elastic:changeme@localhost:5620"
`
}
