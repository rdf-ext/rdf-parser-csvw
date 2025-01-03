import { deepStrictEqual, strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import shell from 'shelljs'

const csvwMetadataPath = new URL('../bin/csvw-metadata.js', import.meta.url).pathname

describe('csvw-metadata', () => {
  it('should be a command line tool', () => {
    const result = shell.exec(`"${csvwMetadataPath}"`)

    strictEqual(result.code, 1)
    strictEqual(result.stderr.includes('missing required argument'), true)
  })

  it('should generate a default JSON-LD for the given CSV file', () => {
    const csvUrl = new URL('./support/test001-minimal.csv', import.meta.url)
    const csvPath = csvUrl.pathname
    const expected = {
      '@context': 'http://www.w3.org/ns/csvw',
      tableSchema: {
        aboutUrl: `${csvUrl}/{ID}`,
        columns: [{
          titles: 'ID',
          propertyUrl: `${csvUrl}/ID`
        }, {
          titles: 'String',
          propertyUrl: `${csvUrl}/String`
        }, {
          titles: 'Int',
          propertyUrl: `${csvUrl}/Int`
        }, {
          titles: 'Reference',
          propertyUrl: `${csvUrl}/Reference`
        }]
      }
    }

    const result = shell.exec(`"${csvwMetadataPath}" "${csvPath}"`, { silent: true })
    const metadata = JSON.parse(result.stdout)

    deepStrictEqual(metadata, expected)
  })
})
