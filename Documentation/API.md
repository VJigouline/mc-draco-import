# API

## `loadDraco(input, options?)`

Reads `.drc` and returns a promise of a `DracoLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened.

It throws a `DracoImportError` for input that isn't Draco.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .drc file | The file to open, if several are given. |
| `draco` | — | A decoder module already loaded, such as one made by `createDracoDecoder` in a browser. |
| `dracoOptions` | — | Options for loading the decoder, such as `locateFile` for draco_decoder.wasm. |
| `upAxis` | 'y' | `'z'` turns a Z-up model to Y up. |
| `unitScale` | 1 | Metres per unit. |
| `pointSize` | 2 | Point size in pixels, for point clouds. |

### `DracoLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `group` | `THREE.Group` | The model. |
| `geometryType` | `'mesh' \| 'pointCloud'` | What the file holds. |
| `attributes` | `string[]` | The attributes decoded. |
| `warnings` | `string[]` | Problems that didn't stop the import. |
| `stats` | object | Counts of meshes, triangles, lines and points. |

See the package's `index.d.ts` for every exported type and helper.
