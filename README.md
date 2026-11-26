# mc-draco-import

A Draco importer for [three.js](https://threejs.org/), written in TypeScript. It decodes Google Draco files, compressed meshes and point clouds, with Google's [draco3d](https://github.com/google/draco) decoder (WebAssembly, Apache 2.0), with their normals, colours and texture coordinates. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadDraco } from 'mc-draco-import';

const result = await loadDraco(await file.arrayBuffer());
scene.add(result.group);
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Compressed meshes and point clouds.
- Positions, normals, colours (as sRGB, alpha dropped) and texture coordinates.
- In Node, draco3d's decoder is loaded when first needed. In browsers, `createDracoDecoder(wrapperSource, wasm)` makes the decoder from the draco_wasm_wrapper.js and draco_decoder.wasm that three.js serves for its DRACOLoader (Draco 1.4 or later).

Generic attributes and metadata are not read. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-draco-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real Draco files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
