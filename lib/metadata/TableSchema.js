const difference = require('lodash/difference')
const namespace = require('../namespace')
const parseDateTime = require('../parseDateTime')
const uriTemplate = require('uri-templates')
const url = require('url')
const RdfUtils = require('./RdfUtils')

class TableSchema {
  constructor (dataset, { root, baseIRI, factory, timezone } = {}) {
    this.factory = factory
    this.dataset = dataset
    this.root = root
    this.baseIRI = baseIRI
    this.timezone = timezone
    this.ns = namespace(this.factory)

    this.aboutUrl = () => {
      return this.factory.blankNode()
    }

    this.parsedColumns = []
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

    const aboutUrlTemplate = uriTemplate(aboutUrl)

    return (row) => {
      return this.factory.namedNode(url.resolve(this.baseIRI, aboutUrlTemplate.fill(row))) // eslint-disable-line node/no-deprecated-api
    }
  }

  parseColumns () {
    const columnNode = RdfUtils.findNode(this.dataset, this.root, this.ns.column)

    this.parsedColumns = RdfUtils.parseArray(this.dataset, columnNode).map((node) => {
      const titles = RdfUtils.findValues(this.dataset, node, this.ns.title)
      const name = RdfUtils.findValue(this.dataset, node, this.ns.name) || titles[0]
      const aboutUrl = RdfUtils.findValue(this.dataset, node, this.ns.aboutUrl)
      const language = RdfUtils.findValue(this.dataset, node, this.ns.lang)
      const nullValue = RdfUtils.findValue(this.dataset, node, this.ns.null)
      const propertyUrl = RdfUtils.findValue(this.dataset, node, this.ns.propertyUrl)
      const suppressOutput = RdfUtils.findValue(this.dataset, node, this.ns.suppressOutput)
      const virtual = RdfUtils.findValue(this.dataset, node, this.ns.virtual)
      const valueUrl = RdfUtils.findValue(this.dataset, node, this.ns.valueUrl)

      return {
        aboutUrl: aboutUrl && uriTemplate(aboutUrl),
        datatype: this.parseDatatype(node),
        language: language && uriTemplate(language),
        name,
        nullValue,
        propertyUrl: (propertyUrl && uriTemplate(propertyUrl)) || this.defaultPropertyUrl(name),
        suppressOutput: suppressOutput === 'true',
        titles,
        virtual,
        valueUrl: valueUrl && uriTemplate(valueUrl)
      }
    })
  }

  parseDatatype (node) {
    const datatype = RdfUtils.findNode(this.dataset, node, this.ns.datatype)

    if (!datatype) {
      return this.defaultDatatype()
    }

    if (datatype.termType === 'NamedNode') {
      return { base: datatype.value }
    }

    const base = RdfUtils.findValue(this.dataset, datatype, this.ns.base)
    const format = RdfUtils.findValue(this.dataset, datatype, this.ns.format)

    return {
      base: this.factory.namedNode('http://www.w3.org/2001/XMLSchema#' + (base || 'string')),
      format: format
    }
  }

  columns (row) {
    if (!this.allColumns) {
      this.createAllColumns(row)
    }

    return this.allColumns.map((column) => {
      return {
        subject: this.subject(column, row),
        property: this.property(column, row),
        value: this.value(column, row)
      }
    }).filter((column) => {
      return column.value !== undefined
    })
  }

  subject (column, row) {
    if (!column.aboutUrl) {
      return null
    }

    return this.factory.namedNode(url.resolve(this.baseIRI, column.aboutUrl.fill(row))) // eslint-disable-line node/no-deprecated-api
  }

  value (column, row) {
    if (column.suppressOutput) {
      return undefined
    }

    if (column.valueUrl) {
      return this.factory.namedNode(column.valueUrl.fill(row))
    }

    const value = column.titles.reduce((value, title) => {
      return value || row[title]
    }, '')

    if (value === '') {
      return undefined
    }

    if (column.nullValue && value === column.nullValue) {
      return undefined
    }

    if (column.datatype.base.value === this.ns.dateTime.value) {
      return this.factory.literal(parseDateTime(value, column.datatype.format, this.timezone).toISO(), this.ns.dateTime)
    }

    if (column.datatype.base.value === this.ns.date.value) {
      return this.factory.literal(parseDateTime(value, column.datatype.format, this.timezone).toFormat('yyyy-MM-dd'), this.ns.date)
    }

    if (column.datatype.base) {
      return this.factory.literal(value, (column.language && column.language.fill(row).toLowerCase()) || column.datatype.base)
    }
  }

  property (column, row) {
    return this.factory.namedNode(column.propertyUrl.fill(row))
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
    return {
      fill: () => {
        return this.baseIRI + '#' + encodeURI(name)
      }
    }
  }

  defaultDatatype () {
    return { base: this.ns.string.value }
  }
}

module.exports = TableSchema
