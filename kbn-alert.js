#!/usr/bin/env node

'use strict'

const path = require('path')
const debugLog = getDebugLog()

module.exports = {
  main,
  debugLog
}

const meow = require('meow')

const baseUrl = require('./lib/base-url')
const commands = require('./lib/alert-commands')

const PROGRAM = path.basename(__filename)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// @ts-ignore
if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { input, flags } = args

  if (input.length === 0) args.showHelp()
  if (flags.help) args.showHelp()
  if (flags.version) args.showVersion()

  const urlBase = baseUrl.fromFlags(flags)
  const [command, id, ...rest] = input

  debugLog(`command: ${command} id: ${id}`)
  debugLog(`rest:    ${rest.join(' ')}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  if (commands[command] == null) {
    logError(`unknown command: ${command}`)
  }

  const opts = { debugLog, ...flags }
  let result
  try {
    result = await commands[command](urlBase, id, rest, opts)
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

  console.log(JSON.stringify(result.body, null, 4))
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
  const defaultUrlBase = process.env.KBN_URLBASE || baseUrl.DefaultURL
  const meowOptions = {
    help: getHelpText(),
    flags: {
      help: { type: 'boolean', alias: 'v' },
      version: { type: 'boolean', alias: 'v' },
      space: { type: 'string', alias: 's', default: baseUrl.DefaultSpace },
      urlBase: { type: 'string', alias: 'u', default: defaultUrlBase },
      tags: { type: 'string', default: '' },
      consumer: { type: 'string', default: 'alerts' },
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
  ${PROGRAM} ls-types
  ${PROGRAM} ls 
  ${PROGRAM} create <alert-type-id> <name> <interval> <json: params> <json: actions> [--consumer XXX] [--tags X,Y,Z]
  ${PROGRAM} get <alert-id>
  ${PROGRAM} update <alert-id> <name> <interval> <json: params> <json: actions> <throttle> [--tags X,Y,Z]
  ${PROGRAM} delete <alert-id>
  ${PROGRAM} state <alert-id>
  ${PROGRAM} status <alert-id>

options:
  -h --help       print this help
  -v --version    print the version of the program
  -u --urlBase    Kibana base URL
  -s --space      Kibana space to use; default: default

You can also set the env var KBN_URLBASE as the Kibana base URL.

Set the DEBUG environment variable to any string for additional diagnostics.

For "create", if the "--consumer" option value is not set, it will default to
"kbn-alert".

The "--tags" option value should be a comma-separated list of tags, defaulting
to an empty list.

For authenticated Kibana access, the url should include the userid/password,
for example "http://elastic:changeme@localhost:5620"
`
}
