const multipipe = require('multipipe')
const through = require('through2')
const LineStream = require('byline').LineStream
const Parser = require('csv-parse').Parser

function csvParser (options) {
  options = options || {}

  let line = 0
  let row = null

  const parser = new Parser({
    columns: true,
    delimiter: options.delimiter
  })

  parser.push = (newRow) => {
    row = newRow
  }

  return multipipe(new LineStream(), through.obj(function (chunk, encoding, callback) {
    parser.__write(chunk.toString() + '\n', false)

    line++

    if (row) {
      this.push({
        line: line,
        row: row
      })

      row = null
    }

    callback()
  }))
}

module.exports = csvParser
