const DataModelFactory = require('@rdfjs/data-model')
const DatasetFactory = require('@rdfjs/dataset')

const factory = { ...DataModelFactory, ...DatasetFactory }

module.exports = factory
