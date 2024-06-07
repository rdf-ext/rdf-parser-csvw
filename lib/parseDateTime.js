import { DateTime } from 'luxon'

function parseDateTime (value, format, timezone) {
  if (format) {
    return DateTime.fromFormat(value, format, { zone: timezone })
  }

  return DateTime.fromISO(value, { zone: timezone }) ||
    DateTime.fromRFC2822(value, { zone: timezone })
}

export default parseDateTime
