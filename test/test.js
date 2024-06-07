import { rejects } from 'node:assert'
import { describe, it } from 'mocha'
import { PassThrough } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import CsvwParser from '../index.js'

describe('rdf-parser-csv', () => {
  it('should handle errors', async () => {
    const input = new PassThrough()
    const parser = new CsvwParser()

    input.write('kzy1,key2\n')
    input.write('value1_1;value2_1\n')
    input.write('value1_2,value2_2\n')
    input.end()

    const result = parser.import(input)

    await rejects(async () => {
      await chunks(result)
    })
  })
})
