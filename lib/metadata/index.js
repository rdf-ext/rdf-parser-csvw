const Metadata = require('./Metadata')

function metadata (input, baseIRI, factory) {
  if (!input || input.forEach) {
    return new Metadata(input, baseIRI, factory)
  }

  return input
}

module.exports = metadata
