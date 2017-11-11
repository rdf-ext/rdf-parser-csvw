const metadata = require('./metadata')
const namespace = require('./namespace')
const rdf = require('rdf-data-model')
const Transform = require('readable-stream').Transform

class ObjectParserTransform extends Transform {
  constructor (options) {
    super({
      objectMode: true
    })

    options = options || {}

    this.baseIRI = options.baseIRI || ''
    this.factory = options.factory || rdf
    this.ns = namespace(this.factory)
    this.metadata = metadata(options.metadata, this.baseIRI, this.factory)
    this.tableSchema = options.tableSchema || this.metadata.tableSchemas[0]

    this.contentLine = 0
    this.columns = null
    this.tableGroupNode = this.factory.blankNode()
    this.tableNode = this.factory.blankNode()

    this.processTableGroup()
    this.processTable()
  }

  _transform (obj, encoding, done) {
    this.processRow(obj.line, obj.row).then(done).catch(done)
  }

  processTableGroup () {
    this.push(this.factory.quad(
      this.tableGroupNode,
      this.ns.type,
      this.ns.TableGroup
    ))
  }

  processTable () {
    this.push(this.factory.quad(
      this.tableGroupNode,
      this.ns.table,
      this.tableNode
    ))

    this.push(this.factory.quad(
      this.tableNode,
      this.ns.type,
      this.ns.Table
    ))

    this.push(this.factory.quad(
      this.tableNode,
      this.ns.url,
      this.factory.namedNode(this.baseIRI)
    ))

    if (this.metadata.dataset) {
      const urlQuad = this.metadata.dataset.match(null, this.ns.url).toArray().shift()

      if (urlQuad) {
        this.copySubgraph(this.metadata.dataset.match(urlQuad.subject).filter((quad) => {
          return quad.predicate.value.slice(0, 26) !== 'http://www.w3.org/ns/csvw#'
        }), this.tableNode)
      }
    }
  }

  processRow (line, row) {
    this.contentLine++

    const rowNode = this.factory.blankNode()

    this.push(this.factory.quad(
      this.tableNode,
      this.ns.row,
      rowNode
    ))

    this.push(this.factory.quad(
      rowNode,
      this.ns.type,
      this.ns.Row
    ))

    // describes

    const describesNode = this.tableSchema.aboutUrl(row)

    this.push(this.factory.quad(
      rowNode,
      this.ns.describes,
      describesNode
    ))

    this.tableSchema.columns(row).forEach((column) => {
      this.push(this.factory.quad(
        describesNode,
        column.property,
        column.value
      ))
    })

    // rownum

    this.push(this.factory.quad(
      rowNode,
      this.ns.rownum,
      this.factory.literal(this.contentLine.toString(), this.ns.integer)
    ))

    // url

    const rowUrl = this.factory.namedNode(this.baseIRI + '#row=' + line)

    this.push(this.factory.quad(
      rowNode,
      this.ns.url,
      rowUrl
    ))

    return Promise.resolve()
  }

  copySubgraph (quads, subject) {
    quads.forEach((quad) => {
      this.push(this.factory.quad(
        subject || quad.subject,
        quad.predicate,
        quad.object
      ))

      if (quad.object.termType === 'BlankNode') {
        this.copySubgraph(this.metadata.dataset.match(quad.object))
      }
    })
  }
}

module.exports = ObjectParserTransform
