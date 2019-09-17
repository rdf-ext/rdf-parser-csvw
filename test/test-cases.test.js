/* global describe, it */

const assert = require('assert')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const rdf = require('rdf-ext')
const CsvwParser = require('..')
const JsonLdParser = require('@rdfjs/parser-jsonld')
const N3Parser = require('@rdfjs/parser-n3')

const blackList = [
  '006',
  '007',
  '009',
  '011',
  '012',
  '016',
  '017'
]

function datasetFromN3Fs (filename) {
  filename = path.resolve(filename)

  try {
    fs.readFileSync(filename)
  } catch (err) {
    return Promise.resolve(rdf.dataset())
  }

  const parser = new N3Parser({ baseIRI: new String(''), factory: rdf }) // eslint-disable-line no-new-wrappers

  return rdf.dataset().import(parser.import(fs.createReadStream(filename)))
}

function datasetFromJsonLdFs (filename) {
  const parser = new JsonLdParser({ factory: rdf })

  return rdf.dataset().import(parser.import(fs.createReadStream(path.resolve(filename))))
}

describe('test-cases', () => {
  glob.sync('test/support/test*.csv').forEach((csvFile) => {
    const basePath = path.dirname(csvFile)
    const baseName = path.basename(csvFile, '.csv')
    const metadataFile = path.join(basePath, baseName + '.csv-metadata.json')
    const outputFile = path.join(basePath, baseName + '.nt')
    const id = baseName.slice(4, 7)

    if (blackList.indexOf(id) !== -1) {
      return
    }

    it(baseName, () => {
      return Promise.all([
        datasetFromJsonLdFs(metadataFile),
        datasetFromN3Fs(outputFile)
      ]).then(([metadata, output]) => {
        const parser = new CsvwParser({
          factory: rdf,
          baseIRI: path.basename(csvFile),
          metadata: metadata,
          timezone: 'UTC'
        })
        const input = fs.createReadStream(csvFile)
        const stream = parser.import(input)

        return rdf.dataset().import(stream).then((actual) => {
          assert.strictEqual(actual.toCanonical(), output.toCanonical())
        })
      })
    })
  })
})
