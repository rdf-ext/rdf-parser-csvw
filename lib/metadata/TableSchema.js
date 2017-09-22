const assign = require('lodash/assign')
const difference = require('lodash/difference')
const namespace = require('./namespace')
const rdf = require('rdf-data-model')
const uriTemplate = require('uri-templates')
const url = require('url')
const RdfUtils = require('./RdfUtils')

class TableSchema {
  constructor (dataset, root, baseIRI, factory) {
    this.factory = factory || rdf
    this.dataset = dataset
    this.root = root
    this.baseIRI = baseIRI
    this.ns = namespace(this.factory)

    this.aboutUrl = () => {
      return this.factory.blankNode()
    }

    this.parsedColumns = []
    this.columnsByTitle = {}
    this.allColumns = null

    if (this.dataset) {
      this.aboutUrl = this.parseAboutUrl() || this.aboutUrl
      this.parseColumns()
    }
  }

  parseAboutUrl () {
    const aboutUrl = RdfUtils.findValue(this.dataset, this.root, this.ns.aboutUrl)

    if (!aboutUrl) {
      return
    }

    return (row) => {
      return this.factory.namedNode(url.resolve(this.baseIRI, uriTemplate(aboutUrl).fill(row)))
    }
  }

  parseColumns () {
    const columnNode = RdfUtils.findNode(this.dataset, this.root, this.ns.column)

    this.parsedColumns = RdfUtils.parseArray(this.dataset, columnNode).map((node) => {
      const titles = RdfUtils.findValues(this.dataset, node, this.ns.title)
      const name = RdfUtils.findValue(this.dataset, node, this.ns.name) || titles.slice(0, 1).pop()
      const propertyUrl = RdfUtils.findValue(this.dataset, node, this.ns.propertyUrl) || this.defaultPropertyUrl(name)
      const suppressOutput = RdfUtils.findValue(this.dataset, node, this.ns.suppressOutput)
      const virtual = RdfUtils.findValue(this.dataset, node, this.ns.virtual)
      const valueUrl = RdfUtils.findValue(this.dataset, node, this.ns.valueUrl)

      return {
        datatype: this.parseDatatype(node),
        name: name,
        propertyUrl: propertyUrl ? this.factory.namedNode(propertyUrl) : this.defaultPropertyUrl(name),
        suppressOutput: suppressOutput === 'true',
        titles: titles,
        virtual: virtual,
        valueUrl: valueUrl
      }
    })
  }

  parseDatatype (node) {
    const datatype = RdfUtils.findNode(this.dataset, node, this.ns.datatype)

    if (!datatype) {
      return this.defaultDatatype()
    }

    if (datatype.termType === 'NamedNode') {
      return {base: datatype.value}
    }

    const base = RdfUtils.findValue(this.dataset, datatype, this.ns.base)
    const format = RdfUtils.findValue(this.dataset, datatype, this.ns.format)

    return {
      base: 'http://www.w3.org/2001/XMLSchema#' + (base || 'string'),
      format: format
    }
  }

  columns (row) {
    if (!this.allColumns) {
      this.createAllColumns(row)
    }

    return this.allColumns.map((column) => {
      return assign({}, column, {value: this.value(column, row)})
    })
  }

  value (column, row) {
    if (column.virtual) {
      return this.factory.namedNode(column.valueUrl)
    }

    if (column.valueUrl) {
      return this.factory.namedNode(uriTemplate(column.valueUrl).fill(row))
    }

    const value = column.titles.reduce((value, title) => {
      return value || row[title]
    }, '')

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

  createAllColumns (row) {
    const titles = this.parsedColumns.reduce((titles, column) => {
      return titles.concat(column.titles)
    }, [])

    const undefinedColumns = difference(Object.keys(row), titles).map((title) => {
      return {
        name: title,
        titles: [title],
        propertyUrl: this.defaultPropertyUrl(title),
        datatype: this.defaultDatatype()
      }
    })

    this.allColumns = this.parsedColumns.concat(undefinedColumns)
  }

  defaultPropertyUrl (name) {
    return this.factory.namedNode(this.baseIRI + '#' + encodeURI(name))
  }

  defaultDatatype () {
    return {base: this.ns.string.value}
  }
}

module.exports = TableSchema
