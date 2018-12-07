const Metadata = require('./Metadata')

function metadata (input, { baseIRI, factory, timezone } = {}) {
  if (!input || input.forEach) {
    return new Metadata(input, { baseIRI, factory, timezone })
  }

  return input
}

module.exports = metadata
