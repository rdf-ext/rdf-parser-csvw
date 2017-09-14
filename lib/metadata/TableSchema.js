const uriTemplate = require('uri-templates')
const url = require('url')
const RdfArray = require('./RdfArray')

class TableSchema {
  constructor (factory, dataset, root, baseIRI) {
    this.factory = factory
    this.baseIRI = baseIRI
    this.ns = this.buildNamespace()

    this.aboutUrl = () => {
      return this.factory.blankNode()
    }

    this.parsedColumns = {}
    this.parsedVirtualColumns = []

    if (dataset) {
      this.aboutUrl = this.parseAboutUrl(dataset, root) || this.aboutUrl
      this.parsedColumns = this.parseColumns(dataset, root)
      this.parsedVirtualColumns = Object.keys(this.parsedColumns).filter(c => this.parsedColumns[c].virtual)
    }
  }

  parseAboutUrl (dataset, root) {
    const aboutUrlQuad = dataset.match(root, this.ns.aboutUrl).toArray().shift()
    const aboutUrlValue = aboutUrlQuad && aboutUrlQuad.object && aboutUrlQuad.object.value

    if (!aboutUrlValue) {
      return
    }

    return (row) => {
      return this.factory.namedNode(url.resolve(this.baseIRI, uriTemplate(aboutUrlValue).fill(row)))
    }
  }

  parseColumns (dataset, root) {
    return RdfArray.parse(dataset, dataset.match(root, this.ns.column).toArray().shift()).map((node) => {
      const nameQuad = dataset.match(node, this.ns.name).toArray().shift()
      const propertyUrlQuad = dataset.match(node, this.ns.propertyUrl).toArray().shift()
      const suppressOutputQuad = dataset.match(node, this.ns.suppressOutput).toArray().shift()
      const titleQuad = dataset.match(node, this.ns.title).toArray().shift()
      const virtualQuad = dataset.match(node, this.ns.virtual).toArray().shift()
      const valueUrlQuad = dataset.match(node, this.ns.valueUrl).toArray().shift()

      const column = {
        datatype: this.parseDatatype(dataset, node),
        name: nameQuad && nameQuad.object.value,
        propertyUrl: propertyUrlQuad ? this.factory.namedNode(propertyUrlQuad.object.value) : undefined,
        suppressOutput: suppressOutputQuad && suppressOutputQuad.object.value === 'true',
        title: titleQuad && titleQuad.object.value,
        virtual: virtualQuad && virtualQuad.object.value,
        valueUrl: valueUrlQuad && valueUrlQuad.object.value
      }

      column.value = this.value.bind(this, column)

      return column
    }).reduce((columns, column) => {
      columns[column.title] = column

      return columns
    }, {})
  }

  parseDatatype (dataset, root) {
    const datatypeQuad = dataset.match(root, this.ns.datatype).toArray().shift()

    if (!datatypeQuad) {
      return
    }

    if (datatypeQuad.object.termType === 'NamedNode') {
      return {
        base: datatypeQuad.object.value
      }
    }

    const baseQuad = dataset.match(datatypeQuad.object, this.ns.base).toArray().shift()
    const base = baseQuad && baseQuad.object.value
    const formatQuad = dataset.match(datatypeQuad.object, this.ns.format).toArray().shift()

    return {
      base: 'http://www.w3.org/2001/XMLSchema#' + (base || 'string'),
      format: formatQuad && formatQuad.object.value
    }
  }

  buildNamespace () {
    return {
      aboutUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#aboutUrl'),
      base: this.factory.namedNode('http://www.w3.org/ns/csvw#base'),
      column: this.factory.namedNode('http://www.w3.org/ns/csvw#column'),
      datatype: this.factory.namedNode('http://www.w3.org/ns/csvw#datatype'),
      date: this.factory.namedNode('http://www.w3.org/2001/XMLSchema#date'),
      format: this.factory.namedNode('http://www.w3.org/ns/csvw#format'),
      name: this.factory.namedNode('http://www.w3.org/ns/csvw#name'),
      propertyUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#propertyUrl'),
      string: this.factory.namedNode('http://www.w3.org/2001/XMLSchema#string'),
      suppressOutput: this.factory.namedNode('http://www.w3.org/ns/csvw#suppressOutput'),
      title: this.factory.namedNode('http://www.w3.org/ns/csvw#title'),
      valueUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#valueUrl'),
      virtual: this.factory.namedNode('http://www.w3.org/ns/csvw#virtual')
    }
  }

  columns (row) {
    const keys = Object.keys(row).concat(this.parsedVirtualColumns)

    return keys.map((key) => {
      const column = Object.create(this.parsedColumns[key] || null)

      column.datatype = column.datatype || {base: this.ns.string.value}
      column.name = column.name || key
      column.propertyUrl = column.propertyUrl || this.factory.namedNode(this.baseIRI + '#' + encodeURI(column.name))
      column.title = column.title || column.name
      column.value = this.value(column, row)

      return column
    })
  }

  value (column, row) {
    if (column.virtual) {
      return this.factory.namedNode(column.valueUrl)
    }

    if (column.valueUrl) {
      return this.factory.namedNode(uriTemplate(column.valueUrl).fill(row))
    }

    const value = row[column.title]

    if (value === '') {
      return
    }

    if (column.datatype.base === this.ns.date.value) {
      const dateValue = new Date(value)
      const fixedDateValue = new Date(dateValue.valueOf() - dateValue.getTimezoneOffset() * 1000 * 60)
      const stringValue = fixedDateValue.toISOString().slice(0, 10)

      return this.factory.literal(stringValue, this.ns.date)
    } else if (column.datatype.base) {
      return this.factory.literal(value, this.factory.namedNode(column.datatype.base))
    }
  }
}

module.exports = TableSchema
