const rdf = require('rdf-data-model')
const TableSchema = require('./metadata/TableSchema')
const Transform = require('readable-stream').Transform

class ObjectParserTransform extends Transform {
  constructor (options) {
    super({
      objectMode: true
    })

    options = options || {}

    this.baseIRI = options.baseIRI || ''
    this.factory = options.factory || rdf

    this.contentLine = 0
    this.columns = null
    this.tableGroupNode = this.factory.blankNode()
    this.tableNode = this.factory.blankNode()
    this.tableSchema = new TableSchema(this.factory, options.metadata, null, this.baseIRI)

    this.processTableGroup()
    this.processTable()
  }

  _transform (obj, encoding, done) {
    this.processRow(obj.line, obj.row).then(done).catch(done)
  }

  processTableGroup () {
    this.push(this.factory.quad(
      this.tableGroupNode,
      this.factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      this.factory.namedNode('http://www.w3.org/ns/csvw#TableGroup')
    ))
  }

  processTable () {
    this.push(this.factory.quad(
      this.tableGroupNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#table'),
      this.tableNode
    ))

    this.push(this.factory.quad(
      this.tableNode,
      this.factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      this.factory.namedNode('http://www.w3.org/ns/csvw#Table')
    ))

    this.push(this.factory.quad(
      this.tableNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#url'),
      this.factory.namedNode(this.baseIRI)
    ))
  }

  processRow (line, row) {
    this.contentLine++

    const rowNode = this.factory.blankNode()

    this.push(this.factory.quad(
      this.tableNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#row'),
      rowNode
    ))

    this.push(this.factory.quad(
      rowNode,
      this.factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      this.factory.namedNode('http://www.w3.org/ns/csvw#Row')
    ))

    // describes

    const describesNode = this.tableSchema.aboutUrl(row)

    this.push(this.factory.quad(
      rowNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#describes'),
      describesNode
    ))

    this.tableSchema.columns(row).forEach((column) => {
      const value = column.virtual ? column.valueUrl : this.factory.literal(row[column.title])

      if (value.value === '') {
        return
      }

      this.push(this.factory.quad(
        describesNode,
        column.propertyUrl,
        value
      ))
    })

    // rownum

    this.push(this.factory.quad(
      rowNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#rownum'),
      this.factory.literal(this.contentLine.toString(), this.factory.namedNode('http://www.w3.org/2001/XMLSchema#integer'))
    ))

    // url

    const rowUrl = this.factory.namedNode(this.baseIRI + '#row=' + line)

    this.push(this.factory.quad(
      rowNode,
      this.factory.namedNode('http://www.w3.org/ns/csvw#url'),
      rowUrl
    ))

    return Promise.resolve()
  }
}

module.exports = ObjectParserTransform
