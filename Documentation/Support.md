# Formats and support

mc-draco-import reads Draco with Google's draco3d decoder.

## What is read

- Compressed meshes and point clouds.
- Positions, normals, colours (as sRGB, alpha dropped) and texture coordinates.
- In Node, draco3d's decoder is loaded when first needed. In browsers, `createDracoDecoder(wrapperSource, wasm)` makes the decoder from the draco_wasm_wrapper.js and draco_decoder.wasm that three.js serves for its DRACOLoader (Draco 1.4 or later).

## Orientation and units

Draco has no units or up axis. The model is left as it is unless you pass `upAxis: 'z'` or `unitScale`.

## Limits

Generic attributes and metadata are not read.
