const namespace = require('../namespace')
const rdf = require('rdf-data-model')
const TableSchema = require('./TableSchema')

class Metadata {
  constructor (dataset, baseIRI, factory) {
    this.factory = factory || rdf
    this.dataset = dataset
    this.baseIRI = baseIRI || ''

    this.ns = namespace(this.factory)

    this.parse()
  }

  parse () {
    this.parseDialect()

    this.tableSchemas = [new TableSchema(this.dataset, null, this.baseIRI, this.factory)]
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
