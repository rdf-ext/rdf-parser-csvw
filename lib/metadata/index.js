import Metadata from './Metadata.js'

function metadata (input, { baseIRI, factory, timezone } = {}) {
  if (!input || typeof input.match === 'function') {
    return new Metadata(input, { baseIRI, factory, timezone })
  }

  return input
}

export default metadata
