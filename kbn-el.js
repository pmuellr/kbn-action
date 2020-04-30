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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PROGRAM = path.basename(__filename)
const COMMANDS = new Set('all actions action alerts alert es'.split(/\s+/))

// @ts-ignore
if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { _, flags, input } = args

  if (flags.help) args.showHelp()
  if (flags.version) args.showVersion()

  let urlBase = baseUrl.fromFlags(flags)
  let [command, commandArg] = input

  if (flags.es) {
    urlBase = flags.es
    command = 'es'
  }

  if (!command) args.showHelp()

  if (command == 'action' && !commandArg) {
    logError('the action command requires an action id argument')
  }

  if (command == 'alert' && !commandArg) {
    logError('the alert command requires an alert id argument')
  }

  if (!COMMANDS.has(command)) {
    logError(`invalid command "${command}"`)
  }

  debugLog(`command: ${command}${commandArg ? ` ${commandArg}` : ''}`)
  debugLog(`flags:   ${JSON.stringify(flags)}`)

  debugLog(`start/end flags:      ${JSON.stringify({startDate: flags.startDate, endDate: flags.endDate, duration: flags.duration})}`)
  const { startDate, endDate } = getDatesFromFlags(flags.startDate, flags.endDate, flags.duration)
  debugLog(`start/end calculated: ${JSON.stringify({startDate: new Date(startDate), endDate: new Date(endDate)})}`)

  const opts = { debugLog, ...flags }
  opts.startDate = new Date(startDate).toISOString()
  opts.endDate = new Date(endDate).toISOString()

  let results
  try {
    results = await commands[command](urlBase, commandArg, opts)
  } catch (err) {
    logError(err.message)
  }

  if (flags.json) {
    for (const eventResult of results) {
      console.log(JSON.stringify(eventResult))
    }
    return
  }

  const providerColor = getColoror()
  const actionColor = getColoror(2)
  const iidColor = getColoror(0)
  const soColor = getColoror(4)

  for (const eventResult of results) {
    const event = eventResult._source ? eventResult._source : eventResult
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

    if (event.error && event.error.message) {
      console.log(`    ${event.error.message}`)
    }
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
      help: { type: 'boolean', alias: 'h' },
      version: { type: 'boolean', alias: 'v' },
      space: { type: 'string', alias: 's', default: baseUrl.DefaultSpace },
      urlBase: { type: 'string', alias: 'u', default: defaultUrlBase },
      es: { type: 'string' },
      startDate: { type: 'string', alias: 'b' },
      endDate: { type: 'string', alias: 'e' },
      duration: { type: 'string', alias: 'd' },
      json: { type: 'boolean', alias: 'j' }
    }
  }

  // @ts-ignore
  return meow(meowOptions)
}

function getDatesFromFlags(startDateFlag, endDateFlag, durationFlag) {
  let duration = 1000 * 60 * 10 // 10 minutes
  let endDate = Date.now()
  let startDate = endDate - duration

  startDateFlag = getDateFromString(startDateFlag)
  endDateFlag = getDateFromString(endDateFlag)
  durationFlag = getDurationMillis(durationFlag)

  if (startDateFlag && endDateFlag) {
    startDate = startDateFlag
    endDate = endDateFlag
  }

  else if (startDateFlag && durationFlag) {
    startDate = startDateFlag
    endDate = startDateFlag + durationFlag
  }

  else if (startDateFlag) {
    startDate = startDateFlag
    endDate = Date.now()
  }

  else if (endDateFlag && durationFlag) {
    startDate = endDateFlag - durationFlag
    endDate = endDateFlag
  }

  else if (endDateFlag) {
    startDate = endDateFlag - duration
    endDate = endDateFlag
  }

  else if (durationFlag) {
    startDate = Date.now() - durationFlag
    endDate = Date.now()
  }

  if (startDate > endDate) {
    logError(`startDate > endDate: ${new Date(startDate)} > ${new Date(endDate)}`)
  }

  return { startDate, endDate }
}

/** @type { (dateString: string | null) => number | null } */
function getDateFromString(dateString) {
  if (dateString == null) return null
  dateString = `${dateString}`

  const epochMillis = Date.parse(dateString)
  if (!isNaN(epochMillis)) {
    return epochMillis
  }

  const duration = getDurationMillis(dateString)
  if (duration != null) {
    return Date.now() - duration
  }

  return null
}

/** @type { (string: null | string) => null | number } */
function getDurationMillis (string) {
  if (string == null) return null
  string = `${string}`

  const match = string.match(/^(\d+)(s|m|h|d)$/)
  if (match == null) return null

  const units = parseInt(match[1], 10)
  if (isNaN(units)) return null

  switch(match[2]) {
    case 's': return units * 1000
    case 'm': return units * 1000 * 60
    case 'h': return units * 1000 * 60 * 60
    case 'd': return units * 1000 * 60 * 60 * 24
  }

  throw new Error(`unexpected unit ${match[2]}`)
}

function getHelpText () {
  return `
write Kibana event log entries to stdout

usage:
  ${PROGRAM} all
  ${PROGRAM} actions
  ${PROGRAM} action <action-id>
  ${PROGRAM} alerts
  ${PROGRAM} alert <alert-id>

options:
  -h --help               print this help
  -v --version            print the version of the program
  -u --urlBase  <url>     Kibana base URL
  -s --space <space>      Kibana space to use; default: default
     --es <es-url>        return raw data from elasticsearch
  -b --startDate <date>   start date of search
  -e --endDate <date>     end date of search
  -d --duration <time>    duration of search

You can also set the env var KBN_URLBASE as the Kibana base URL.

The default endDate is now, the default duration is 10 minutes, and the
default startDate is 10 minutes before now.  The time should be specified
as a string of digits followed by a unit character s, m, h, d (for seconds
minutes, hours, days).  The date can be any date parseable with Date.parse()
or a time in the duration format (duration before now).

By default, output is generated as ansi-colored lines with chalk, so you can use
the environment variable FORCE_COLOR=0 to not generate ansi sequences, or use
FORCE_COLOR=1 to generate ansi sequences when ordinarily they would not be (eg,
if you redirect stdout).  The --json option does generate ansi sequences.

Using the --es option, all event log documents will be written.

Set the DEBUG environment variable to any string for additional diagnostics.

For authenticated Kibana access, the url should include the userid/password,
for example "http://elastic:changeme@localhost:5620"
`
}
