#!/usr/bin/env node

'use strict'

module.exports = {
  main
}

const meow = require('meow')

const pkg = require('./package.json')
const commands = require('./lib/commands')

const debugLog = getDebugLog()

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
    if (err.response == null) logError(err.stack)

    result = err.response
  }

  if (result.statusCode !== 200) {
    logError(`status code ${result.statusCode}\nbody: ${JSON.stringify(result.body, null, 4)}`)
  }

  console.log(JSON.stringify(result.body, null, 4))
}

function logError (message) {
  console.log(`${pkg.name}: ${message}`)
  process.exit(1)
}

function getDebugLog () {
  if (process.env.DEBUG == null) return () => {}

  return function debugLog (message) {
    if (typeof message === 'object') message = JSON.stringify(message)
    console.log(`${pkg.name}: ${message}`)
  }
}

// returns parsed args from meow
function parseArgs () {
  const defaultUrlBase = process.env.KBN_ACTION_URLBASE || 'http://localhost:5601'
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
  const cmd = pkg.name

  return `
usage:
  ${cmd} ls-types
  ${cmd} ls 
  ${cmd} create <action-type-id> <description> <json: config>
  ${cmd} get <action-id>
  ${cmd} update <action-id> <json: config>
  ${cmd} delete <action-id>
  ${cmd} fire <action-id> <json: params>

options:
  -h --help       print this help
  -v --version    print the version of the program
  -u --urlBase    Kibana base URL

You can also set the env var KBN_ACTION_URLBASE as the Kibana base URL.
`
}
