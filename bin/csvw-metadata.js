#!/usr/bin/env node

const MetadataBuilder = require('../lib/MetadataBuilder')

const program = require('commander')

program
  .arguments('<filename>')
  .option('--base-iri <iri>', 'base IRI for aboutUrl and properties')
  .option('--delimiter <delimiter>', 'enforce delimiter, don\'t detect')
  .option('--about-url <aboutUrl>', 'manually set aboutUrl')
  .option('--property-base-iri <propertyBaseIri>', 'use a different base IRI for properties')
  .action((filename, { baseIri, delimiter, aboutUrl, propertyBaseIri } = {}) => {
    MetadataBuilder.fromFile(filename, { baseIri, delimiter, aboutUrl, propertyBaseIri }).then(metadata => {
      process.stdout.write(JSON.stringify(metadata, null, ' '))
    }).catch(err => console.error(err))
  })

program.parse(process.argv)
