const rdf = require('@rdfjs/data-model')

const ns = {
  first: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
  nil: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
  rest: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
}

class RdfUtils {
  static parseArray (dataset, root, array) {
    array = array || []

    if (!root) {
      return array
    }

    const current = dataset.match(root)

    const firstTriple = current.match(null, ns.first).toArray().shift()

    if (firstTriple) {
      array.push(firstTriple.object)

      const restTriple = current.match(null, ns.rest).toArray().shift()

      if (restTriple && !restTriple.object.equals(ns.nil)) {
        RdfUtils.parseArray(dataset, restTriple.object, array)
      }
    }

    return array
  }

  static findNode (dataset, root, property) {
    return RdfUtils.findNodes(dataset, root, property).shift()
  }

  static findNodes (dataset, root, property) {
    return dataset.match(root, property).toArray().map(q => q.object)
  }

  static findValue (dataset, root, property) {
    return RdfUtils.findValues(dataset, root, property).shift()
  }

  static findValues (dataset, root, property) {
    return RdfUtils.findNodes(dataset, root, property).map(n => n.value)
  }
}

module.exports = RdfUtils
