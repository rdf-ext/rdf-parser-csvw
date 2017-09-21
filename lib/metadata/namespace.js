const rdf = require('rdf-data-model')

function namespace (factory) {
  factory = factory || rdf

  return {
    aboutUrl: factory.namedNode('http://www.w3.org/ns/csvw#aboutUrl'),
    base: factory.namedNode('http://www.w3.org/ns/csvw#base'),
    column: factory.namedNode('http://www.w3.org/ns/csvw#column'),
    datatype: factory.namedNode('http://www.w3.org/ns/csvw#datatype'),
    date: factory.namedNode('http://www.w3.org/2001/XMLSchema#date'),
    delimiter: factory.namedNode('http://www.w3.org/ns/csvw#delimiter'),
    dialect: factory.namedNode('http://www.w3.org/ns/csvw#dialect'),
    format: factory.namedNode('http://www.w3.org/ns/csvw#format'),
    name: factory.namedNode('http://www.w3.org/ns/csvw#name'),
    propertyUrl: factory.namedNode('http://www.w3.org/ns/csvw#propertyUrl'),
    string: factory.namedNode('http://www.w3.org/2001/XMLSchema#string'),
    suppressOutput: factory.namedNode('http://www.w3.org/ns/csvw#suppressOutput'),
    title: factory.namedNode('http://www.w3.org/ns/csvw#title'),
    valueUrl: factory.namedNode('http://www.w3.org/ns/csvw#valueUrl'),
    virtual: factory.namedNode('http://www.w3.org/ns/csvw#virtual')
  }
}

module.exports = namespace
