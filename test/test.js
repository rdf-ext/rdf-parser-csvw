const { rejects } = require('assert')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const { PassThrough } = require('readable-stream')
const CsvwParser = require('../index.js')

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
      await getStream.array(result)
    })
  })
})
