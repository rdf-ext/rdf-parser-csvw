import rdf from '@rdfjs/data-model'
import CsvParser from './lib/CsvParser.js'
import parseMetadata from './lib/metadata/index.js'
import ObjectParserTransform from './lib/ObjectParserTransform.js'

class Parser {
  constructor ({ metadata, baseIRI = '', factory = rdf, timezone, relaxColumnCount, skipLinesWithError } = {}) {
    this.metadata = metadata
    this.baseIRI = baseIRI
    this.factory = factory
    this.timezone = timezone
    this.relaxColumnCount = relaxColumnCount
    this.skipLinesWithError = skipLinesWithError
  }

  import (input, {
    metadata = this.metadata,
    baseIRI = this.baseIRI,
    factory = this.factory,
    timezone = this.timezone,
    relaxColumnCount = this.relaxColumnCount,
    skipLinesWithError = this.skipLinesWithError
  } = {}) {
    const parsedMetadata = parseMetadata(metadata, { baseIRI, factory, timezone })

    const reader = new CsvParser({
      delimiter: parsedMetadata.delimiter,
      lineTerminators: parsedMetadata.lineTerminators,
      quoteChar: parsedMetadata.quoteChar,
      relaxColumnCount,
      skipLinesWithError
    })

    const output = new ObjectParserTransform({ baseIRI, factory, metadata: parsedMetadata, timezone })

    input.on('end', () => {
      if (!output.readable) {
        output.end()
      }
    })

    reader.on('error', err => {
      output.destroy(err)
    })

    input.on('error', err => {
      output.destroy(err)
    })

    input.pipe(reader).pipe(output)

    return output
  }

  static import (input, options) {
    return (new Parser(options)).import(input)
  }
}

export default Parser
