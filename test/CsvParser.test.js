/* global describe, it */

const assert = require('assert')
const getStream = require('get-stream')
const CsvParser = require('../lib/CsvParser')
const { PassThrough } = require('readable-stream')
const waitFor = require('./support/waitFor')

describe('csvParser', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof CsvParser, 'function')
  })

  it('should return a Transform', () => {
    const parser = new CsvParser()

    assert.strictEqual(parser.readable, true)
    assert.strictEqual(parser.writable, true)
  })

  it('should parse CSV with header', () => {
    const input = new PassThrough()
    const parser = new CsvParser()

    input.pipe(parser)

    parser.resume()

    input.write('key0,key1\n')
    input.write('value0,value1\n')
    input.end()

    return waitFor(parser)
  })

  it('should parse CSV with BOM', async () => {
    const input = new PassThrough()
    const parser = new CsvParser()

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

    input.write('\ufeffkey0,key1\n')
    input.write('value0,value1\n')
    input.end()

    await waitFor(parser)

    assert.deepStrictEqual(output, expected)
  })

  it('should output objects with line number and row data', () => {
    const input = new PassThrough()
    const parser = new CsvParser()

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

    return waitFor(parser).then(() => {
      assert.deepStrictEqual(output, expected)
    })
  })

  it('should parse lines with alternative delimiter', () => {
    const input = new PassThrough()
    const parser = new CsvParser({ delimiter: ';' })

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

    return waitFor(parser).then(() => {
      assert.deepStrictEqual(output, expected)
    })
  })

  it('should parse lines with alternative lineTerminator and UTF16LE encoding', () => {
    const input = new PassThrough()
    const parser = new CsvParser({ lineTerminators: ['\r\n'] })

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

    input.write(new Uint8Array([0xff, 0xfe]))
    input.write('key0,key1\r\n', 'utf16le')
    input.write('value0,value1\r\n', 'utf16le')
    input.end()

    return waitFor(parser).then(() => {
      assert.deepStrictEqual(output, expected)
    })
  })

  it('should handle errors', async () => {
    const input = new PassThrough()
    const parser = new CsvParser({ delimiter: ';' })

    input.pipe(parser)
    input.write('kzy1,key2\n')
    input.write('value1_1;value2_1\n')
    input.write('value1_2,value2_2\n')
    input.end()

    await assert.rejects(async () => {
      await getStream.array(parser)
    })
  })
})
