/* global describe, it, run */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const rdf = require('rdf-ext')
const CsvwParser = require('..')
const JsonLdParser = require('rdf-parser-jsonld')
const N3Parser = require('rdf-parser-n3')
/*
const whiteList = [
  'manifest-rdf#test001',
  'manifest-rdf#test005',
  'manifest-rdf#test006',
  'manifest-rdf#test007',
  'manifest-rdf#test008',
  'manifest-rdf#test009',
  'manifest-rdf#test010',
  'manifest-rdf#test011',
  'manifest-rdf#test012',
  'manifest-rdf#test013',
  'manifest-rdf#test014',
  'manifest-rdf#test017',
  'manifest-rdf#test028',
  'manifest-rdf#test132',
  'manifest-rdf#test152',
  'manifest-rdf#test155',
  'manifest-rdf#test193',
  'manifest-rdf#test195',
  'manifest-rdf#test202',
  'manifest-rdf#test209',
  'manifest-rdf#test231',
  'manifest-rdf#test232',
  'manifest-rdf#test233',
  'manifest-rdf#test234',
  'manifest-rdf#test242',
  'manifest-rdf#test248',
  'manifest-rdf#test259',
  'manifest-rdf#test260'
]
*/

const whiteList = []

const blackList = [
  'manifest-rdf#test273'
]

function datasetFromN3Fs (filename) {
  return rdf.dataset().import(N3Parser.import(fs.createReadStream(filename), {factory: rdf}))
}

function datasetFromJsonLdFs (filename) {
  return rdf.dataset().import(JsonLdParser.import(fs.createReadStream(filename), {factory: rdf}))
}

function loadTests () {
  return datasetFromN3Fs('test/spec/manifest-rdf.ttl').then((manifest) => {
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

    if (typeof whiteList !== 'undefined') {
      tests = tests.filter((test) => {
        return whiteList.indexOf(test.iri) !== -1
      })
    }

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
        const parser = new CsvwParser({factory: rdf})
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

          assert.equal(actual.toCanonical(), expected.toCanonical())
        })
      })
    })

    run()
  })
}).catch((err) => {
  console.error(err.stack)

  run()
})
