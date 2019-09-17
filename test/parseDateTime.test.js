/* global describe, it */

const assert = require('assert')
const parseDateTime = require('../lib/parseDateTime')

describe('parseDateTime', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof parseDateTime, 'function')
  })

  it('should parse a date time string', () => {
    const dateTime = parseDateTime('2018-01-01T01:00:00.000+0100')

    assert.strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })

  it('should parse a date time string and set the given timezone', () => {
    const dateTime = parseDateTime('2018-01-01T01:00:00', null, 'Europe/Berlin')

    assert.strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })

  it('should parse a date time string using the format argument', () => {
    const dateTime = parseDateTime('20180101 000000', 'yyyyMMdd HHmmss', 'UTC')

    assert.strictEqual(dateTime.toUTC().toISO(), '2018-01-01T00:00:00.000Z')
  })
})
