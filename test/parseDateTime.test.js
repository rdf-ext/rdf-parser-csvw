import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import parseDateTime from '../lib/parseDateTime.js'

describe('parseDateTime', () => {
  it('should be a function', () => {
    strictEqual(typeof parseDateTime, 'function')
  })

  it('should parse a date time string', () => {
    const dateTime = parseDateTime('2018-01-01T01:00:00.000+0100')

    strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })

  it('should parse a date time string and set the given timezone', () => {
    const dateTime = parseDateTime('2018-01-01T01:00:00', null, 'Europe/Berlin')

    strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })

  it('should parse a date time string using the format argument', () => {
    const dateTime = parseDateTime('20180101 000000', 'yyyyMMdd HHmmss', 'UTC')

    strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })
})
