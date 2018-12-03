const fs = require('fs')

class MetadataBuilder {
  static readFirstLine (filename) {
    const stream = fs.createReadStream(filename)
    const chunks = []

    return new Promise((resolve, reject) => {
      const next = () => {
        if (stream.closed) {
          return reject(new Error('reached end of file before line break'))
        }

        const chunk = stream.read()

        if (chunk === null) {
          return setTimeout(next, 10)
        }

        chunks.push(chunk)

        if (chunk.toString().indexOf('\n') !== -1) {
          return resolve(Buffer.concat(chunks).toString().split('\n')[0])
        }

        setTimeout(next, 10)
      }

      next()
    })
  }

  static detectDelimiter (line) {
    const commaCount = line.split(',').length
    const tabCount = line.split('\t').length

    return commaCount > tabCount ? ',' : '\t'
  }

  static extractHeaders (line, delimiter) {
    return line.split(delimiter).map(header => {
      return header.split('"').join('').trim()
    })
  }

  static build (baseIri, headers, { aboutUrl, delimiter = ',', propertyBaseIri = baseIri } = {}) {
    const metadata = { '@context': 'http://www.w3.org/ns/csvw' }

    if (delimiter !== ',') {
      metadata.dialect = {
        delimiter
      }
    }

    aboutUrl = aboutUrl || `${baseIri}{${encodeURIComponent(headers[0])}}`

    const columns = headers.map(header => {
      return {
        titles: header,
        propertyUrl: `${propertyBaseIri}${encodeURIComponent(header)}`
      }
    })

    metadata.tableSchema = {
      aboutUrl,
      columns
    }

    return metadata
  }

  static fromHeaderLine (firstLine, { aboutUrl, baseIri, delimiter, headers, propertyBaseIri } = {}) {
    delimiter = delimiter || MetadataBuilder.detectDelimiter(firstLine)
    headers = headers || MetadataBuilder.extractHeaders(firstLine, delimiter)

    return MetadataBuilder.build(baseIri, headers, { delimiter, propertyBaseIri })
  }

  static fromFile (filename, { aboutUrl, baseIri = `file:///${filename}/`, delimiter, headers, propertyBaseIri } = {}) {
    return MetadataBuilder.readFirstLine(filename).then(firstLine => {
      return MetadataBuilder.fromHeaderLine(firstLine, { aboutUrl, baseIri, delimiter, headers, propertyBaseIri })
    })
  }
}

module.exports = MetadataBuilder
