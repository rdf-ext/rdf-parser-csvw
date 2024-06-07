import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { datasetEqual } from 'rdf-test/assert.js'
import CsvwParser from '../index.js'
import * as ns from './support/namespaces.js'

const blackList = new Set([
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
])

async function loadTest (testPtr) {
  if (blackList.has(testPtr.value)) {
    return
  }

  const name = testPtr.out(ns.dawg.name).value
  const action = testPtr.out(ns.dawg.action).value
  const result = testPtr.out(ns.dawg.result).value
  const implicit = testPtr.out(ns.csvwt.implicit).values[0]
  const label = name + '<' + testPtr.value + '>'
  const input = extname(action) === '.csv' ? action : implicit
  const metadataUrl = input === action ? implicit : action
  let metadata

  if (metadataUrl && extname(metadataUrl) === '.json') {
    metadata = await rdf.io.dataset.fromURL(`test/spec/${metadataUrl}`)
  }

  return () => {
    it(label, async () => {
      const parser = new CsvwParser({ factory: rdf })
      const inputStream = createReadStream(`test/spec/${input}`)
      const outputStream = parser.import(inputStream, {
        baseIRI: basename(input),
        metadata
      })

      const expected = await rdf.io.dataset.fromURL(`test/spec/${result}`)
      const actual = await rdf.dataset().import(outputStream)

      datasetEqual(actual, expected)
    })
  }
}

async function loadTests () {
  const manifestFile = 'test/spec/manifest-rdf.ttl'
  const tests = []

  try {
    await readFile(manifestFile)
  } catch (err) {
    return Promise.resolve([])
  }

  const manifest = rdf.grapoi({
    dataset: await rdf.io.dataset.fromURL(manifestFile)
  })

  const testPtrs = manifest.hasOut(ns.rdf.type, ns.csvwt.ToRdfTest)

  for (const testPtr of testPtrs) {
    tests.push(await loadTest(testPtr))
  }

  return tests.filter(Boolean)
}

loadTests().then(tests => {
  describe('W3C spec tests', () => {
    for (const test of tests) {
      test()
    }
  })
})
