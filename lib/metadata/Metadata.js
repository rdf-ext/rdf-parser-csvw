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
    this.lineTerminators = null

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

    const dialectQuad = [...this.dataset.match(null, this.ns.dialect)][0]

    if (!dialectQuad) {
      return
    }

    const delimiterQuad = [...this.dataset.match(dialectQuad.object, this.ns.delimiter)][0]

    if (delimiterQuad) {
      this.delimiter = delimiterQuad.object.value
    }

    const lineTerminatorsQuads = [...this.dataset.match(dialectQuad.object, this.ns.lineTerminators)]

    if (lineTerminatorsQuads.length > 0) {
      this.lineTerminators = lineTerminatorsQuads.map(q => q.object.value)
    }

    const quoteCharQuad = [...this.dataset.match(dialectQuad.object, this.ns.quoteChar)][0]

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
