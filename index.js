const assign = require('lodash/assign')
const csvParser = require('./lib/csvParser')
const Metadata = require('./lib/metadata')
const ObjectParserTransform = require('./lib/ObjectParserTransform')

class Parser {
  constructor (options) {
    this.options = options
  }

  import (input, options) {
    options = assign({}, this.options, options)
    options.metadata = new Metadata(options.metadata, options.baseIRI, options.factory)

    const reader = csvParser({
      delimiter: options.metadata.delimiter,
      relaxColumnCount: options.relaxColumnCount
    })

    const output = new ObjectParserTransform(assign({tableSchema: options.metadata.tableSchemas[0]}, options))

    input.on('end', () => {
      if (!output.readable) {
        output.emit('end')
      }
    })

    input.on('error', (err) => {
      output.emit('error', err)
    })

    input.pipe(reader).pipe(output)

    return output
  }

  static import (input, options) {
    return (new Parser(options)).import(input)
  }
}

module.exports = Parser
