/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const csvParser = require('../lib/csvParser')
const PassThrough = require('readable-stream').PassThrough

describe('csvParser', () => {
  it('should be a function', () => {
    assert.equal(typeof csvParser, 'function')
  })

  it('should return a Transform', () => {
    const parser = csvParser()

    assert.equal(parser.readable, true)
    assert.equal(parser.writable, true)
  })

  it('should parse CSV with header', () => {
    const input = new PassThrough()
    const parser = csvParser()

    input.pipe(parser)

    parser.resume()

    input.write('key0,key1\n')
    input.write('value0,value1\n')
    input.end()

    return rdf.waitFor(parser)
  })

  it('should output objects with line number and row data', () => {
    const input = new PassThrough()
    const parser = csvParser()

    input.pipe(parser)

    const output = []
    const expected = [{
      line: 2,
      row: {
        key0: 'value0',
        key1: 'value1'
      }
    }]

    parser.on('data', (data) => {
      output.push(data)
    })

    input.write('key0,key1\n')
    input.write('value0,value1\n')
    input.end()

    return rdf.waitFor(parser).then(() => {
      assert.deepEqual(output, expected)
    })
  })

  it('should parse lines with alternative delimiter', () => {
    const input = new PassThrough()
    const parser = csvParser({delimiter: ';'})

    input.pipe(parser)

    const output = []
    const expected = [{
      line: 2,
      row: {
        key0: 'value0',
        key1: 'value1'
      }
    }]

    parser.on('data', (data) => {
      output.push(data)
    })

    input.write('key0;key1\n')
    input.write('value0;value1\n')
    input.end()

    return rdf.waitFor(parser).then(() => {
      assert.deepEqual(output, expected)
    })
  })
})
