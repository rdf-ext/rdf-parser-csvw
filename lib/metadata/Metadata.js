const namespace = require('../namespace')
const TableSchema = require('./TableSchema')

class Metadata {
  constructor (dataset, { baseIRI, factory, timezone } = {}) {
    this.factory = factory
    this.dataset = dataset
    this.baseIRI = baseIRI
    this.timezone = timezone
    this.delimiter = ','
    this.quoteChar = '"'

    this.ns = namespace(this.factory)

    this.parse()
  }

  parse () {
    this.parseDialect()

    this.tableSchemas = [new TableSchema(this.dataset, {
      baseIRI: this.baseIRI,
      factory: this.factory,
      timezone: this.timezone
    })]
  }

  parseDialect () {
    if (!this.dataset) {
      return
    }

    const dialectQuad = this.dataset.match(null, this.ns.dialect).toArray()[0]

    if (!dialectQuad) {
      return
    }

    const delimiterQuad = this.dataset.match(dialectQuad.object, this.ns.delimiter).toArray()[0]

    if (delimiterQuad) {
      this.delimiter = delimiterQuad.object.value
    }

    const quoteCharQuad = this.dataset.match(dialectQuad.object, this.ns.quoteChar).toArray()[0]

    if (quoteCharQuad) {
      if (quoteCharQuad.object.datatype.equals(this.ns.boolean) && quoteCharQuad.object.value === 'false') {
        this.quoteChar = null
      } else {
        this.quoteChar = quoteCharQuad.object.value
      }
    }
  }
}

module.exports = Metadata
