# rdf-parser-csvw

A [CSV on the Web](https://www.w3.org/TR/tabular-data-primer/) parser with [RDFJS Stream interface](https://github.com/rdfjs/representation-task-force/). Consult the [Model for Tabular Data and Metadata on the Web](https://www.w3.org/TR/tabular-data-model/) and [Metadata Vocabulary for Tabular Data](https://www.w3.org/TR/tabular-metadata/) for details about creating the mapping metadata.

The focus of this library is to provide a fast, streaming way to convert tabluar data to RDF. It is not a complete implementation of CSV on the Web but what we need in our projects so far.

For creating the CSV on the Web mapping files you might consider using a lightweight domain specific language (DSL) or a web based frontend:

* [RDF mapping DSL](https://github.com/zazuko/rdf-mapping-dsl-user) - For any kind of mappings
* [RDF Data Cube curation service](https://github.com/zazuko/data-cube-curation/) - Aimed at [OLAP cube](https://en.wikipedia.org/wiki/OLAP_cube) oriented, tabluar output.

## Usage

The package exports the parser as a class, so an instance must be created before it can be used.
The `.import` method, as defined in the [RDFJS specification](http://rdf.js.org/#sink-interface), must be called to do the actual parsing.
It expects a stream of strings.
The method will return a stream which emits the parsed quads.

The constructor accepts an `options` object with the following optional keys:

- `metadata`: Use the metadata to convert the CSV to RDF.
  The metadata must be given as a Dataset using the CSV on the Web ontology.
  This options is required.
- `baseIRI`: Use the IRI to create Named Nodes.
  The value must be a String.
  This options is required.
- `factory`: Use an alternative RDFJS data factory.
  By default the [reference implementation](https://github.com/rdfjs/data-model/) us used.
- `timezone`: Use an alternative timezone to parse date and time values.
  The value must be given as a String as defined in the [Luxon documentation](https://moment.github.io/luxon/docs/manual/zones.html#specifying-a-zone).
  By default `local` will be used.
- `relaxColumnCount`: Don't throw an error if a row has a column count which doesn't match the headers column coun.
- `skipLinesWithError`: Skip lines with error instead of throwing an error and stop parsing.
  This is mainly useful for debugging and should not be used in production environments.

It's also possible to pass options as second argument to the `.import` method.
The options from the constructor and the `.import` method will be merged together.
