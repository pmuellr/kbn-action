#!/usr/bin/env node

'use strict'

const path = require('path')
const debugLog = getDebugLog()

module.exports = {
  main,
  debugLog
}

const meow = require('meow')

const commands = require('./lib/tm-commands')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PROGRAM = path.basename(__filename)
const COMMANDS = new Set('watch'.split(/\s+/))

// @ts-ignore
if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { _, flags, input } = args

  if (flags.help) args.showHelp()
  if (flags.version) args.showVersion()

  const esURL = flags.es || process.env['ES_URL'] || 'https://elastic:changeme@localhost:9200'
  let [command, commandArg] = input

  if (!command) args.showHelp()

  if (!COMMANDS.has(command)) {
    logError(`invalid command "${command}"`)
  }

  debugLog(`command: ${command}${commandArg ? ` ${commandArg}` : ''}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  const opts = { debugLog, ...flags }

  let results
  try {
    results = await commands[command](esURL, opts)
  } catch (err) {
    logError(err.message)
  }

  if (flags.json) {
    for (const eventResult of results) {
      console.log(JSON.stringify(eventResult))
    }
    return
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
  const meowOptions = {
    help: getHelpText(),
    flags: {
      help: { type: 'boolean', alias: 'h' },
      version: { type: 'boolean', alias: 'v' },
      es: { type: 'string' },
    }
  }

  // @ts-ignore
  return meow(meowOptions)
}

function getHelpText () {
  return `
return information about the Kibana task manager

usage:
  ${PROGRAM} watch

options:
  -h --help               print this help
  -v --version            print the version of the program
  -e --es <es-url>        url to elasticsearch, with auth credentials

You can also set the env var ES_URL as the elasticsearch URL.

Set the DEBUG environment variable to any string for additional diagnostics.
`
}
