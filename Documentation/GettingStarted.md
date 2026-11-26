# Getting started

## Install

```sh
npm install three github:VJigouline/mc-draco-import
```

## Open a file

`loadDraco` takes the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened. It returns a promise of the model.

```ts
import * as THREE from 'three';
import { loadDraco } from 'mc-draco-import';

const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
input.addEventListener('change', async () => {
  const result = await loadDraco(input.files![0]!);
  scene.add(result.group);
  for (const warning of result.warnings) console.warn(warning);
});
```

## What you get

- **`group`:** a `THREE.Group` holding the model, named after the file.
- **`stats`:** counts of what was read.
- **`warnings`:** anything that couldn't be read or was left out.

Draco has no units or up axis. The model is left as it is unless you pass `upAxis: 'z'` or `unitScale`.

## Options

- **`main`** (default the first .drc file): The file to open, if several are given.
- **`draco`** (default —): A decoder module already loaded, such as one made by `createDracoDecoder` in a browser.
- **`dracoOptions`** (default —): Options for loading the decoder, such as `locateFile` for draco_decoder.wasm.
- **`upAxis`** (default 'y'): `'z'` turns a Z-up model to Y up.
- **`unitScale`** (default 1): Metres per unit.
- **`pointSize`** (default 2): Point size in pixels, for point clouds.

See the [API](API.md) for every field of the result.
