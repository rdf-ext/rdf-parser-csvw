const { finished } = require('readable-stream')

function waitFor (stream) {
  return new Promise((resolve, reject) => {
    finished(stream, err => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

module.exports = waitFor
