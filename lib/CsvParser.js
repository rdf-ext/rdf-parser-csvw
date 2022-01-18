const { Parser } = require('csv-parse')
const { Transform } = require('readable-stream')

class CsvParser extends Transform {
  constructor ({ delimiter, lineTerminators, quoteChar, relaxColumnCount, skipLinesWithError } = {}) {
    super({
      readableObjectMode: true
    })

    this.parser = new Parser({
      columns: true,
      delimiter,
      info: true,
      bom: true,
      quote: quoteChar,
      record_delimiter: lineTerminators || [],
      relax_column_count: relaxColumnCount,
      skip_lines_with_error: skipLinesWithError
    })

    this.parser.on('error', err => {
      this.destroy(err)
    })

    this.parser.push = data => {
      if (!data) {
        return
      }

      this.push({
        line: data.info.lines,
        row: data.record
      })
    }
  }

  _transform (chunk, encoding, callback) {
    this.parser.write(chunk, encoding, callback)
  }

  _flush (callback) {
    this.parser.end(callback)
  }
}

module.exports = CsvParser
