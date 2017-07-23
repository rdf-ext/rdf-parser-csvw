const uriTemplate = require('uri-templates')
const RdfArray = require('./RdfArray')

class TableSchema {
  constructor (factory, dataset, root, baseIRI) {
    this.factory = factory
    this.baseIRI = baseIRI
    this.ns = this.buildNamespace()

    this.aboutUrl = () => {
      return this.factory.blankNode()
    }

    this.columns = (row) => {
      return Object.keys(row).map((key) => {
        const column = {
          propertyUrl: this.factory.namedNode(this.baseIRI + '#' + encodeURI(key)),
          title: key
        }

        column.value = this.value.bind(this, column)

        return column
      })
    }

    if (dataset) {
      this.aboutUrl = this.parseAboutUrl(dataset, root) || this.aboutUrl
      this.columns = this.parseColumns(dataset, root) || this.columns
    }
  }

  parseAboutUrl (dataset, root) {
    const aboutUrlQuad = dataset.match(root, this.ns.aboutUrl).toArray().shift()
    const aboutUrlValue = aboutUrlQuad && aboutUrlQuad.object && aboutUrlQuad.object.value

    if (!aboutUrlValue) {
      return
    }

    return (row) => {
      return this.factory.namedNode(uriTemplate(aboutUrlValue).fill(row))
    }
  }

  parseColumns (dataset, root) {
    const columns = RdfArray.parse(dataset, dataset.match(root, this.ns.column).toArray().shift()).map((node) => {
      const propertyUrlQuad = dataset.match(node, this.ns.propertyUrl).toArray().shift()
      const titleQuad = dataset.match(node, this.ns.title).toArray().shift()
      const virtualQuad = dataset.match(node, this.ns.virtual).toArray().shift()
      const valueUrlQuad = dataset.match(node, this.ns.valueUrl).toArray().shift()

      const column = {
        propertyUrl: this.factory.namedNode(propertyUrlQuad && propertyUrlQuad.object.value),
        title: titleQuad && titleQuad.object.value,
        virtual: virtualQuad && virtualQuad.object.value,
        valueUrl: valueUrlQuad && valueUrlQuad.object.value
      }

      column.value = this.value.bind(this, column)

      return column
    })

    return () => {
      return columns
    }
  }

  buildNamespace () {
    return {
      aboutUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#aboutUrl'),
      column: this.factory.namedNode('http://www.w3.org/ns/csvw#column'),
      propertyUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#propertyUrl'),
      title: this.factory.namedNode('http://www.w3.org/ns/csvw#title'),
      valueUrl: this.factory.namedNode('http://www.w3.org/ns/csvw#valueUrl'),
      virtual: this.factory.namedNode('http://www.w3.org/ns/csvw#virtual')
    }
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

    return this.factory.literal(value)
  }
}

module.exports = TableSchema
