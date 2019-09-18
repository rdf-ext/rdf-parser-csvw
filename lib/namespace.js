const rdf = require('@rdfjs/data-model')

function namespace (factory) {
  factory = factory || rdf

  return {
    aboutUrl: factory.namedNode('http://www.w3.org/ns/csvw#aboutUrl'),
    base: factory.namedNode('http://www.w3.org/ns/csvw#base'),
    boolean: factory.namedNode('http://www.w3.org/2001/XMLSchema#boolean'),
    column: factory.namedNode('http://www.w3.org/ns/csvw#column'),
    datatype: factory.namedNode('http://www.w3.org/ns/csvw#datatype'),
    date: factory.namedNode('http://www.w3.org/2001/XMLSchema#date'),
    dateTime: factory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'),
    delimiter: factory.namedNode('http://www.w3.org/ns/csvw#delimiter'),
    describes: factory.namedNode('http://www.w3.org/ns/csvw#describes'),
    dialect: factory.namedNode('http://www.w3.org/ns/csvw#dialect'),
    format: factory.namedNode('http://www.w3.org/ns/csvw#format'),
    integer: factory.namedNode('http://www.w3.org/2001/XMLSchema#integer'),
    lang: factory.namedNode('http://www.w3.org/ns/csvw#lang'),
    name: factory.namedNode('http://www.w3.org/ns/csvw#name'),
    null: factory.namedNode('http://www.w3.org/ns/csvw#null'),
    propertyUrl: factory.namedNode('http://www.w3.org/ns/csvw#propertyUrl'),
    quoteChar: factory.namedNode('http://www.w3.org/ns/csvw#quoteChar'),
    row: factory.namedNode('http://www.w3.org/ns/csvw#row'),
    rownum: factory.namedNode('http://www.w3.org/ns/csvw#rownum'),
    string: factory.namedNode('http://www.w3.org/2001/XMLSchema#string'),
    suppressOutput: factory.namedNode('http://www.w3.org/ns/csvw#suppressOutput'),
    table: factory.namedNode('http://www.w3.org/ns/csvw#table'),
    title: factory.namedNode('http://www.w3.org/ns/csvw#title'),
    type: factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    url: factory.namedNode('http://www.w3.org/ns/csvw#url'),
    valueUrl: factory.namedNode('http://www.w3.org/ns/csvw#valueUrl'),
    virtual: factory.namedNode('http://www.w3.org/ns/csvw#virtual'),
    Row: factory.namedNode('http://www.w3.org/ns/csvw#Row'),
    Table: factory.namedNode('http://www.w3.org/ns/csvw#Table'),
    TableGroup: factory.namedNode('http://www.w3.org/ns/csvw#TableGroup')
  }
}

module.exports = namespace
