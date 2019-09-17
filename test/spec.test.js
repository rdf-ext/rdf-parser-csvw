/* global describe, it */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const rdf = require('rdf-ext')
const CsvwParser = require('..')
const JsonLdParser = require('@rdfjs/parser-jsonld')
const N3Parser = require('@rdfjs/parser-n3')

const blackList = [
  'manifest-rdf#test016',
  'manifest-rdf#test023',
  'manifest-rdf#test027',
  'manifest-rdf#test029',
  'manifest-rdf#test030',
  'manifest-rdf#test031',
  'manifest-rdf#test032',
  'manifest-rdf#test033',
  'manifest-rdf#test034',
  'manifest-rdf#test035',
  'manifest-rdf#test036',
  'manifest-rdf#test037',
  'manifest-rdf#test038',
  'manifest-rdf#test039',
  'manifest-rdf#test116',
  'manifest-rdf#test118',
  'manifest-rdf#test121',
  'manifest-rdf#test124',
  'manifest-rdf#test149',
  'manifest-rdf#test158',
  'manifest-rdf#test168',
  'manifest-rdf#test170',
  'manifest-rdf#test171',
  'manifest-rdf#test183',
  'manifest-rdf#test187',
  'manifest-rdf#test188',
  'manifest-rdf#test189',
  'manifest-rdf#test190',
  'manifest-rdf#test228',
  'manifest-rdf#test229',
  'manifest-rdf#test235',
  'manifest-rdf#test236',
  'manifest-rdf#test237',
  'manifest-rdf#test245',
  'manifest-rdf#test246',
  'manifest-rdf#test263',
  'manifest-rdf#test264',
  'manifest-rdf#test268',
  'manifest-rdf#test273', // never remove me
  'manifest-rdf#test282',
  'manifest-rdf#test283',
  'manifest-rdf#test284',
  'manifest-rdf#test285',
  'manifest-rdf#test305',
  'manifest-rdf#test306',
  'manifest-rdf#test307'
]

function datasetFromN3Fs (filename) {
  const parser = new N3Parser({ baseIRI: new String('') }) // eslint-disable-line no-new-wrappers

  return rdf.dataset().import(parser.import(fs.createReadStream(filename), { factory: rdf }))
}

function datasetFromJsonLdFs (filename) {
  const parser = new JsonLdParser()

  return rdf.dataset().import(parser.import(fs.createReadStream(filename), { factory: rdf }))
}

function loadTests () {
  const manifestFile = 'test/spec/manifest-rdf.ttl'

  try {
    fs.readFileSync(manifestFile)
  } catch (err) {
    return Promise.resolve([])
  }

  return datasetFromN3Fs(manifestFile).then((manifest) => {
    let tests = manifest.match(
      null,
      rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      rdf.namedNode('http://www.w3.org/2013/csvw/tests/vocab#ToRdfTest')
    ).toArray().map((test) => {
      return test.subject
    }).map((test) => {
      const name = manifest.match(test, rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#name'))
        .toArray()
        .map((t) => {
          return t.object.value
        })
        .shift()

      const action = manifest.match(test, rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#action'))
        .toArray()
        .map((t) => {
          return t.object.value
        })
        .shift()

      const result = manifest.match(test, rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#result'))
        .toArray()
        .map((t) => {
          return t.object.value
        })
        .shift()

      const implicit = manifest.match(test, rdf.namedNode('http://www.w3.org/2013/csvw/tests/vocab#implicit'))
        .toArray()
        .map((t) => {
          return t.object.value
        })
        .shift()

      const label = name + '<' + test.value + '>'

      const input = path.extname(action) === '.csv' ? action : implicit
      const metadata = input === action ? implicit : action

      return {
        iri: test.value,
        label: label,
        name: name,
        input: input,
        metadata: metadata,
        result: result
      }
    })

    if (typeof blackList !== 'undefined') {
      tests = tests.filter((test) => {
        return blackList.indexOf(test.iri) === -1
      })
    }

    return Promise.all(tests.map((test) => {
      if (test.metadata) {
        if (path.extname(test.metadata) === '.json') {
          return datasetFromJsonLdFs(path.join(__dirname, 'spec', test.metadata)).then((metadata) => {
            test.metadata = metadata

            return test
          })
        }
      }

      return test
    }))
  })
}

loadTests().then((tests) => {
  describe('W3C spec tests', () => {
    tests.forEach((test) => {
      it(test.label, () => {
        const parser = new CsvwParser({ factory: rdf })
        const input = fs.createReadStream('test/spec/' + test.input)
        const stream = parser.import(input, {
          baseIRI: path.basename(test.input),
          metadata: test.metadata
        })

        return Promise.all([
          datasetFromN3Fs('test/spec/' + test.result),
          rdf.dataset().import(stream)
        ]).then((results) => {
          const expected = results[0]
          const actual = results[1]

          assert.strictEqual(actual.toCanonical(), expected.toCanonical())
        })
      })
    })
  })
}).catch((err) => {
  console.error(err.stack)
})
