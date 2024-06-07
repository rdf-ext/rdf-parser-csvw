import rdf from 'rdf-ext'

const csvwt = rdf.namespace('http://www.w3.org/2013/csvw/tests/vocab#')
const dawg = rdf.namespace('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#')
const rdfns = rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

export {
  csvwt,
  dawg,
  rdfns as rdf
}
