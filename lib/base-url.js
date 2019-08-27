'use strict'

const DefaultURL = 'http://localhost:5601'
const DefaultSpace = 'default'

module.exports = {
  fromFlags,
  DefaultURL,
  DefaultSpace
}

function fromFlags (flags) {
  const urlBase = (flags.urlBase || DefaultURL).replace(/\/+$/, '')
  const space = flags.space || 'default'

  if (space === 'default') return urlBase
  return `${urlBase}/s/${space}`
}
