/* global describe, it, run */

const assert = require('assert')
const fs = require('fs')
const rdf = require('rdf-ext')
const CsvwParser = require('..')
const JsonLdParser = require('rdf-parser-jsonld')
const N3Parser = require('rdf-parser-n3')

function datasetFromN3Fs (filename) {
  return rdf.dataset().import(N3Parser.import(fs.createReadStream(filename), {factory: rdf}))
}

function datasetFromJsonLdFs (filename) {
  return rdf.dataset().import(JsonLdParser.import(fs.createReadStream(filename), {factory: rdf}))
}

function loadTests () {
  return datasetFromN3Fs('test/spec/manifest-rdf.ttl').then((manifest) => {
    const tests = manifest.match(
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

      return {
        label: label,
        name: name,
        action: action,
        result: result,
        implicit: implicit
      }
    })

    return Promise.all(tests).then((test) => {
      if (test.implicit) {
        return datasetFromJsonLdFs(test.implicit).then((implicit) => {
          test.implicit = implicit

          return test
        })
      }

      return test
    })
  })
}

loadTests().then((tests) => {
  describe('W3C spec tests', () => {
/*
    tests.slice(0, 7).forEach((test) => {
      if (test.implicit) {
        console.log(test.implicit.toString())
      }

      it(test.label, () => {
        const parser = new CsvwParser({factory: rdf})
        const input = fs.createReadStream('test/spec/' + test.action)
        const stream = parser.import(input, {
          baseIRI: test.action
        })

        return Promise.all([
          datasetFromN3Fs('test/spec/' + test.result),
          rdf.dataset().import(stream)
        ]).then((results) => {
          const expected = results[0]
          const actual = results[1]

          if (!actual.equals(expected)) {
            console.error('expected: ' + expected.toString())
            console.error('actual: ' + actual.toString())

            assert(false)
          }
        })
      })
    })
*/
    run()
  })
}).catch(() => {
  run()
})
