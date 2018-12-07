const namespace = require('../namespace')
const TableSchema = require('./TableSchema')

class Metadata {
  constructor (dataset, { baseIRI, factory, timezone } = {}) {
    this.factory = factory
    this.dataset = dataset
    this.baseIRI = baseIRI
    this.timezone = timezone

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

    const dialectQuad = this.dataset.match(null, this.ns.dialect).toArray().shift()

    if (!dialectQuad) {
      return
    }

    const delimiterQuad = this.dataset.match(dialectQuad.object, this.ns.delimiter).toArray().shift()

    if (delimiterQuad) {
      this.delimiter = delimiterQuad.object.value
    }
  }
}

module.exports = Metadata
