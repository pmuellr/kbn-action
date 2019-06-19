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

async function lsTypes (id, args = [], opts = {}) {
  console.log('woulda run ls-types')
  console.log(`id:   ${id}`)
  console.log(`args: ${args.join(' ')}`)
  console.log(`opts: ${JSON.stringify(opts)}`)
}

async function ls (id, args, opts) {
}

async function create (id, args, opts) {
}

async function get (id, args, opts) {
}

async function update (id, args, opts) {
}

async function del (id, args, opts) {
}

async function fire (id, args, opts) {
}
