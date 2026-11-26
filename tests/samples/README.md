# Draco test files

Real Draco files that the tests load. They are unchanged copies, taken at commit `1d3772857e` of three.js.

| Files | What they cover | Source and licence |
| --- | --- | --- |
| `bunny.drc` | A compressed mesh | The [three.js](https://github.com/mrdoob/three.js) repository (`examples/models/draco`), under its [MIT licence](https://github.com/mrdoob/three.js/blob/dev/LICENSE); no other licence is stated for them. |

The tests also encode a coloured point cloud with draco3d's encoder.

These files keep their own licences. They are test data only, and are not part of the npm package, which includes only `dist`, `Documentation`, `README.md` and `LICENSE`.
