/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const ObjectParserTransform = require('../lib/ObjectParserTransform')
const { PassThrough } = require('readable-stream')

const ns = {
  csvw: {
    Row: rdf.namedNode('http://www.w3.org/ns/csvw#Row'),
    Table: rdf.namedNode('http://www.w3.org/ns/csvw#Table'),
    TableGroup: rdf.namedNode('http://www.w3.org/ns/csvw#TableGroup'),
    describes: rdf.namedNode('http://www.w3.org/ns/csvw#describes'),
    row: rdf.namedNode('http://www.w3.org/ns/csvw#row'),
    rownum: rdf.namedNode('http://www.w3.org/ns/csvw#rownum'),
    table: rdf.namedNode('http://www.w3.org/ns/csvw#table'),
    url: rdf.namedNode('http://www.w3.org/ns/csvw#url')
  },
  rdf: {
    type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  },
  xsd: {
    integer: rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')
  }
}

describe('ObjectParserTransform', () => {
  it('should be a constructor', () => {
    assert.strictEqual(typeof ObjectParserTransform, 'function')
  })

  it('should have a Transform interface', () => {
    const parser = new ObjectParserTransform()

    assert.strictEqual(parser.readable, true)
    assert.strictEqual(parser.writable, true)
  })

  it('should parse object', () => {
    const input = new PassThrough({ objectMode: true })
    const parser = new ObjectParserTransform()

    input.pipe(parser)

    parser.resume()

    input.write({
      line: 2,
      row: {
        key0: 'value0',
        key1: 'value1'
      }
    })

    input.end()

    return rdf.waitFor(parser)
  })

  it('should output RDF objects', () => {
    const input = new PassThrough({ objectMode: true })
    const parser = new ObjectParserTransform({ factory: rdf })

    input.pipe(parser)

    const tableGroup = rdf.blankNode()
    const table = rdf.blankNode()
    const row = rdf.blankNode()
    const object = rdf.blankNode()

    const expected = rdf.dataset()

    expected.add(rdf.quad(tableGroup, ns.rdf.type, ns.csvw.TableGroup))
    expected.add(rdf.quad(tableGroup, ns.csvw.table, table))

    expected.add(rdf.quad(table, ns.rdf.type, ns.csvw.Table))
    expected.add(rdf.quad(table, ns.csvw.url, rdf.namedNode('')))
    expected.add(rdf.quad(table, ns.csvw.row, row))

    expected.add(rdf.quad(row, ns.rdf.type, ns.csvw.Row))
    expected.add(rdf.quad(row, ns.csvw.describes, object))
    expected.add(rdf.quad(row, ns.csvw.rownum, rdf.literal('1', ns.xsd.integer)))
    expected.add(rdf.quad(row, ns.csvw.url, rdf.namedNode('#row=2')))

    expected.add(rdf.quad(object, rdf.namedNode('#key0'), rdf.literal('value0')))
    expected.add(rdf.quad(object, rdf.namedNode('#key1'), rdf.literal('value1')))

    input.write({
      line: 2,
      row: {
        key0: 'value0',
        key1: 'value1'
      }
    })

    input.end()

    return rdf.dataset().import(parser).then((actual) => {
      assert.strictEqual(actual.toCanonical(), expected.toCanonical())
    })
  })
})
