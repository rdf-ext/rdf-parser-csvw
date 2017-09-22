/* global describe, it */

const assert = require('assert')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const rdf = require('rdf-ext')
const CsvwParser = require('..')
const JsonLdParser = require('rdf-parser-jsonld')
const N3Parser = require('rdf-parser-n3')
const Promise = require('bluebird')

const blackList = [
  '006',
  '007',
  '009',
  '011',
  '012'
]

function datasetFromN3Fs (filename) {
  filename = path.resolve(filename)

  try {
    fs.readFileSync(filename)
  } catch (err) {
    return Promise.resolve(rdf.dataset())
  }

  return rdf.dataset().import(N3Parser.import(fs.createReadStream(filename), {factory: rdf}))
}

function datasetFromJsonLdFs (filename) {
  return rdf.dataset().import(JsonLdParser.import(fs.createReadStream(path.resolve(filename)), {factory: rdf}))
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
      ]).spread((metadata, output) => {
        const parser = new CsvwParser({
          factory: rdf,
          baseIRI: path.basename(csvFile),
          metadata: metadata
        })
        const input = fs.createReadStream(csvFile)
        const stream = parser.import(input)

        return rdf.dataset().import(stream).then((actual) => {
          assert.equal(actual.toCanonical(), output.toCanonical())
        })
      })
    })
  })
})
