const rdf = require('rdf-data-model')

const ns = {
  first: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
  nil: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
  rest: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
}

class RdfArray {
  static parse (dataset, root, array) {
    array = array || []

    if (!root) {
      return array
    }

    root = root.object || root

    const current = dataset.match(root)

    const firstTriple = current.match(null, ns.first).toArray().shift()

    if (firstTriple) {
      array.push(firstTriple.object)

      const restTriple = current.match(null, ns.rest).toArray().shift()

      if (restTriple && !restTriple.object.equals(ns.nil)) {
        RdfArray.parse(dataset, restTriple.object, array)
      }
    }

    return array
  }
}

module.exports = RdfArray
