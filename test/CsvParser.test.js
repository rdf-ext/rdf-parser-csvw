import { deepStrictEqual, rejects, strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import { PassThrough } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import CsvParser from '../lib/CsvParser.js'

describe('csvParser', () => {
  it('should be a function', () => {
    strictEqual(typeof CsvParser, 'function')
  })

  it('should return a Transform', () => {
    const parser = new CsvParser()

    strictEqual(parser.readable, true)
    strictEqual(parser.writable, true)
  })

  it('should parse CSV with header', async () => {
    const input = new PassThrough()
    const parser = new CsvParser()

    input.pipe(parser)

    parser.resume()

    input.write('key0,key1\n')
    input.write('value0,value1\n')
    input.end()

    await chunks(parser)
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

    parser.on('data', data => {
      output.push(data)
    })

    input.write('\ufeffkey0,key1\n')
    input.write('value0,value1\n')
    input.end()

    await chunks(parser)

    deepStrictEqual(output, expected)
  })

  it('should output objects with line number and row data', async () => {
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

    parser.on('data', data => {
      output.push(data)
    })

    input.write('key0,key1\n')
    input.write('value0,value1\n')
    input.end()

    await chunks(parser)

    deepStrictEqual(output, expected)
  })

  it('should parse lines with alternative delimiter', async () => {
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

    parser.on('data', data => {
      output.push(data)
    })

    input.write('key0;key1\n')
    input.write('value0;value1\n')
    input.end()

    await chunks(parser)

    deepStrictEqual(output, expected)
  })

  it('should parse lines with alternative lineTerminator and UTF16LE encoding', async () => {
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

    parser.on('data', data => {
      output.push(data)
    })

    input.write(new Uint8Array([0xff, 0xfe]))
    input.write('key0,key1\r\n', 'utf16le')
    input.write('value0,value1\r\n', 'utf16le')
    input.end()

    await parser

    deepStrictEqual(output, expected)
  })

  it('should handle errors', async () => {
    const input = new PassThrough()
    const parser = new CsvParser({ delimiter: ';' })

    input.pipe(parser)
    input.write('kzy1,key2\n')
    input.write('value1_1;value2_1\n')
    input.write('value1_2,value2_2\n')
    input.end()

    await rejects(async () => {
      await chunks(parser)
    })
  })
})
