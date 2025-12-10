# standards

Libraries, constants and functions that are standard to MTCC and that can be used across different applications to achieve consistency.

### Installation

```sh
npm i https://github.com/MTCC-Plc/standards#{hash of the commit}
```

Unlike a regular install from the npm registry, this package will be fetched from GitHub.

In order to pin to a specific version, the hash of the commit should be passed at the end of the url. If unsure which commit to use, pick the latest one. For example:

```sh
npm i https://github.com/MTCC-Plc/standards#cb32233
```

Either the short or long hash are fine.

### Libraries

Nestjs libraries can be imported.
Check the library readmes for details.

- [Herald](./src/libs/herald/README.md) - Integration with the Herald API.
- [Cluster](./src/libs/cluster/README.md) - Clustering a Nestjs app.
- [Standard Logger](./src/libs/logger/README.md) - Standard logger for a Nestjs app.
- [Search](./src/libs/search/README.md) - Integration with the Meilisearch API.
- [Storage](./src/libs/storage/README.md) - Integration with the Storage Service.
- [Napis](./src/libs/napis/README.md) - Integration with the National APIs.

### Usage

`standards-core` is a separate repo for splitting functionality
of `standards` that do not have external dependencies.
`standard-core` is a subset of `standards`, so both packages are not required.
The idea is to use `standards-core` in front-end applications and `standards` in backend applications.

See documentation for [standards-core](https://github.com/MTCC-Plc/standards-core/blob/main/README.md#Usage)
