'use strict'

const DefaultESURL = 'https://localhost:9200'
const DefaultURL = 'http://localhost:5601'
const DefaultSpace = 'default'

module.exports = {
  fromFlags,
  DefaultESURL,
  DefaultURL,
  DefaultSpace
}

function fromFlags (flags) {
  const urlBase = (flags.urlBase || DefaultURL).replace(/\/+$/, '')
  const space = flags.space || 'default'

  if (space === 'default') return urlBase
  return `${urlBase}/s/${space}`
}
