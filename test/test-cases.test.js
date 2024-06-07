import { strictEqual } from 'node:assert'
import { createReadStream } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { glob } from 'glob'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import CsvwParser from '../index.js'

const blackList = new Set([
  '006',
  '007',
  '009',
  '011',
  '012',
  '016',
  '017'
])

async function loadTest (csvFile) {
  const basePath = dirname(csvFile)
  const baseName = basename(csvFile, '.csv')
  const metadataFile = join(basePath, baseName + '.csv-metadata.json')
  const outputFile = join(basePath, baseName + '.nt')
  const id = baseName.slice(4, 7)

  if (blackList.has(id)) {
    return
  }

  return () => {
    it(baseName, async () => {
      const metadata = await rdf.io.dataset.fromURL(metadataFile)
      const output = await rdf.io.dataset.fromURL(outputFile)

      const parser = new CsvwParser({
        factory: rdf,
        baseIRI: basename(csvFile),
        metadata,
        timezone: 'UTC'
      })
      const input = createReadStream(csvFile)
      const stream = parser.import(input)
      const actual = await rdf.dataset().import(stream)

      strictEqual(actual.toCanonical(), output.toCanonical())
    })
  }
}

async function loadTests () {
  const csvFiles = await glob('test/support/test*.csv')
  const tests = []

  for (const csvFile of csvFiles.sort()) {
    tests.push(await loadTest(csvFile))
  }

  return tests.filter(Boolean)
}

loadTests().then(tests => {
  describe('test-cases', () => {
    for (const test of tests) {
      test()
    }
  })
})
