const { DateTime } = require('luxon')

function parseDateTime (value, format, timezone) {
  if (format) {
    return DateTime.fromFormat(value, format, { zone: timezone }).toUTC().toISO()
  }

  return DateTime.fromISO(value, { zone: timezone }).toUTC().toISO() ||
    DateTime.fromRFC2822(value, { zone: timezone }).toUTC().toISO()
}

module.exports = parseDateTime
