const namespace = require('../namespace')
const TableSchema = require('./TableSchema')
const RdfUtils = require('./RdfUtils')

class Metadata {
  constructor (dataset, { baseIRI, factory, timezone } = {}) {
    this.factory = factory
    this.dataset = dataset
    this.baseIRI = baseIRI
    this.timezone = timezone
    this.delimiter = ','
    this.quoteChar = '"'

    this.ns = namespace(this.factory)

    this.tableSchemas = []
    this.parse()
  }

  parse () {
    this.parseDialect()

    if (!this.dataset) {
      return
    }

    const tableSchemaNodes = RdfUtils.findNodes(this.dataset, null, this.ns.tableSchema)

    this.tableSchemas = tableSchemaNodes.reduce((arr, tableSchema) => {
      const table = this.dataset.match(null, this.ns.tableSchema, tableSchema).toArray().shift().subject
      const tableGroupQuad = this.dataset.match(null, this.ns.table, table).toArray().shift()
      const tableGroup = tableGroupQuad ? tableGroupQuad.subject : null

      return [...arr, new TableSchema(this.dataset, {
        baseIRI: this.baseIRI,
        factory: this.factory,
        timezone: this.timezone,
        root: tableSchema,
        table,
        tableGroup
      })]
    }, [])
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
