const Metadata = require('./Metadata')

function metadata (input, { baseIRI, factory, timezone } = {}) {
  if (!input || typeof input.match === 'function') {
    return new Metadata(input, { baseIRI, factory, timezone })
  }

  return input
}

module.exports = metadata
