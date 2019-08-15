#!/usr/bin/env node

'use strict'

const path = require('path')
const debugLog = getDebugLog()

module.exports = {
  main,
  debugLog
}

const meow = require('meow')

const commands = require('./lib/action-commands')

const PROGRAM = path.basename(__filename)

if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { input, flags } = args

  if (input.length === 0) args.showHelp()
  if (flags.help) args.showHelp()
  if (flags.version) args.showVersion()

  const urlBase = flags.urlBase.replace(/\/+$/, '')
  const [ command, id, ...rest ] = input

  debugLog(`command: ${command} id: ${id}`)
  debugLog(`rest:    ${rest.join(' ')}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  if (!commands.hasOwnProperty(command)) {
    logError(`unknown command: ${command}`)
  }

  const opts = { debugLog }
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
        for (let name in headers) {
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

function getDebugLog () {
  if (process.env.DEBUG == null) return () => {}

  return function debugLog (message) {
    if (typeof message === 'object') message = JSON.stringify(message)
    console.log(`${PROGRAM}: DEBUG: ${message}`)
  }
}

// returns parsed args from meow
function parseArgs () {
  const defaultUrlBase = process.env.KBN_URLBASE || 'http://localhost:5601'
  const meowOptions = {
    help: getHelpText(),
    flags: {
      help: { type: 'boolean', alias: 'v' },
      version: { type: 'boolean', alias: 'v' },
      urlBase: { type: 'string', alias: 'u', default: defaultUrlBase }
    }
  }

  return meow(meowOptions)
}

function getHelpText () {
  return `
usage:
  ${PROGRAM} ls-types
  ${PROGRAM} ls 
  ${PROGRAM} create <action-type-id> <description> <json: config> <json: secrets>
  ${PROGRAM} get <action-id>
  ${PROGRAM} update <action-id> <description> <json: config> <json: secrets>
  ${PROGRAM} delete <action-id>
  ${PROGRAM} execute <action-id> <json: params>

options:
  -h --help       print this help
  -v --version    print the version of the program
  -u --urlBase    Kibana base URL

You can also set the env var KBN_URLBASE as the Kibana base URL.

Set the DEBUG environment variable to any string for additional diagnostics.

For authenticated Kibana access, the url should include the userid/password,
for example "http://elastic:changeme@localhost:5620"
`
}
