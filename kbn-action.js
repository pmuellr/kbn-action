#!/usr/bin/env node

'use strict'

module.exports = {
  main,
  kbnAction
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

  const [ command, id, ...rest ] = input

  debugLog(`command: ${command} id: ${id}`)
  debugLog(`rest:    ${rest.join(' ')}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  if (!commands.hasOwnProperty(command)) {
    logError(`unknown command: ${command}`)
  }

  commands[command](id, rest, )
}

function logError (message) {
  console.log(`${pkg.name}: ${message}`)
  process.exit(1)
}

function getDebugLog () {
  if (process.env.DEBUG == null) return () => {}

  return function debugLog (message) {
    console.log(`${pkg.name}: ${message}`)
  }
}

// returns parsed args from meow
function parseArgs () {
  const meowOptions = {
    help: getHelpText(),
    flags: {
      help: { type: 'boolean', alias: 'v' },
      version: { type: 'boolean', alias: 'v' },
      urlBase: { type: 'string', alias: 'u', default: 'http://localhost:5601' }
    }
  }

  return meow(meowOptions)
}

async function kbnAction (uri) {

}

function getHelpText () {
  const cmd = pkg.name

  return `
usage:
  ${cmd} ls-types
  ${cmd} ls 
  ${cmd} create <action-type-id> <json: config>
  ${cmd} get <action-id>
  ${cmd} update <action-id> <json: config>
  ${cmd} delete <action-id>
  ${cmd} fire <action-id> <json: params>

options:
  -h --help       print this help
  -v --version    print the version of the program
  -u --urlBase    Kibana base URL
`
}
