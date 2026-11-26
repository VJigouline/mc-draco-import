// Decodes Google Draco files (.drc), compressed meshes and point clouds, with Google's draco3d
// decoder (WebAssembly, Apache 2.0), into three.js geometry with normals, colours and texture
// coordinates.

import * as THREE from 'three';
import type { DracoAttribute, DracoDecoder, DracoGeometry, DracoModule, DracoModuleOptions } from './draco-types.js';
import { countModel, ImportFiles, orient, type ImportInput, type ImportStats } from './common.js';

export { ImportFiles, countModel } from './common.js';
export type { ImportInput, ImportFile, ImportData, ImportStats } from './common.js';
export type { DracoModule, DracoModuleOptions } from './draco-types.js';

export interface DracoOptions {
  /** The .drc file to open, if several are given. By default, the first. */
  main?: string;
  /** A draco3d decoder module already loaded. */
  draco?: DracoModule;
  /** Options for loading the decoder, such as `locateFile`, for bundlers that don't serve draco_decoder.wasm next to its script. */
  dracoOptions?: DracoModuleOptions;
  /** Draco has no up axis; the default is Y up. Use 'z' for Z-up models. */
  upAxis?: 'y' | 'z';
  /** Metres per unit. Draco has no units; the default, 1, leaves the model as it is. */
  unitScale?: number;
  /** Point size in pixels, for point clouds. Default 2. */
  pointSize?: number;
}

export interface DracoLoadResult {
  /** The mesh or point cloud, in a group named after the file. */
  group: THREE.Group;
  /** What the file holds. */
  geometryType: 'mesh' | 'pointCloud';
  /** The attributes decoded: position, normal, color, uv. */
  attributes: string[];
  warnings: string[];
  stats: ImportStats;
}

export class DracoImportError extends Error {
  override name = 'DracoImportError';
}

let shared: Promise<DracoModule> | undefined;

/** Loads the decoder once and keeps it for later calls. */
export function loadDracoDecoder(options?: DracoModuleOptions): Promise<DracoModule> {
  // draco3d's decoder is built for Node; it is loaded only when needed, so browser bundles that pass `draco` leave it out.
  if (!shared) shared = import('draco3d/draco_decoder_nodejs.js').then((m) => m.default(options ?? {}) as Promise<DracoModule>);
  return shared;
}

/**
 * Makes a decoder module from Google's browser decoder, as three.js serves it for DRACOLoader:
 * the text of draco_wasm_wrapper.js and the bytes of draco_decoder.wasm.
 */
export function createDracoDecoder(wrapperSource: string, wasm: ArrayBuffer): Promise<DracoModule> {
  // Hiding Node's globals makes the wrapper take its plain path, which uses the bytes given.
  const factory = new Function('process', 'require', 'module', 'exports', `${wrapperSource}\nreturn DracoDecoderModule;`)(undefined, undefined, undefined, undefined) as (options: object) => Promise<DracoModule>;
  return factory({ wasmBinary: wasm });
}

function decodeAttribute(draco: DracoModule, decoder: DracoDecoder, geometry: DracoGeometry, attribute: DracoAttribute): Float32Array {
  const count = geometry.num_points();
  const size = attribute.num_components();
  const byteLength = count * size * 4;
  const ptr = draco._malloc(byteLength);
  try {
    decoder.GetAttributeDataArrayForAllPoints(geometry, attribute, draco.DT_FLOAT32, byteLength, ptr);
    return new Float32Array(draco.HEAPF32.buffer, ptr, count * size).slice();
  } finally {
    draco._free(ptr);
  }
}

/** Decodes a .drc file into a mesh, or points for a point cloud. */
export async function loadDraco(input: ImportInput, options: DracoOptions = {}): Promise<DracoLoadResult> {
  const files = await ImportFiles.from(input, 'model.drc');
  const main = files.main(['drc'], options.main) ?? files.files[0];
  if (!main) throw new DracoImportError('There is no .drc file to open');
  if (new TextDecoder().decode(main.bytes.subarray(0, 5)) !== 'DRACO') throw new DracoImportError(`${main.name} is not a Draco file: it does not start with DRACO`);
  const draco = options.draco ?? (await loadDracoDecoder(options.dracoOptions));
  const decoder = new draco.Decoder();
  const array = new Int8Array(main.bytes.buffer, main.bytes.byteOffset, main.bytes.byteLength);
  const type = decoder.GetEncodedGeometryType(array);
  const isMesh = type === draco.TRIANGULAR_MESH;
  if (!isMesh && type !== draco.POINT_CLOUD) {
    draco.destroy(decoder);
    throw new DracoImportError(`${main.name} holds neither a mesh nor a point cloud`);
  }
  const dracoGeometry = isMesh ? new draco.Mesh() : new draco.PointCloud();
  const warnings: string[] = [];
  const geometry = new THREE.BufferGeometry();
  const attributes: string[] = [];
  try {
    const status = isMesh ? decoder.DecodeArrayToMesh(array, array.byteLength, dracoGeometry) : decoder.DecodeArrayToPointCloud(array, array.byteLength, dracoGeometry);
    if (!status.ok() || dracoGeometry.ptr === 0) throw new DracoImportError(`${main.name} could not be decoded: ${status.error_msg()}`);
    const take = (kind: number, name: string, itemSize?: number) => {
      const id = decoder.GetAttributeId(dracoGeometry, kind);
      if (id < 0) return;
      const attribute = decoder.GetAttribute(dracoGeometry, id);
      let data = decodeAttribute(draco, decoder, dracoGeometry, attribute);
      const size = attribute.num_components();
      if (name === 'color') {
        // Integer colours are scaled to 0 to 1, and converted from sRGB to linear; an alpha channel is dropped.
        const dataType = attribute.data_type();
        const scale = dataType === draco.DT_UINT8 ? 1 / 255 : dataType === draco.DT_UINT16 ? 1 / 65535 : 1;
        const rgb = new Float32Array((data.length / size) * 3);
        const c = new THREE.Color();
        for (let i = 0, j = 0; i < data.length; i += size, j += 3) {
          c.setRGB(data[i]! * scale, data[i + 1]! * scale, data[i + 2]! * scale, THREE.SRGBColorSpace);
          rgb[j] = c.r;
          rgb[j + 1] = c.g;
          rgb[j + 2] = c.b;
        }
        data = rgb;
      }
      geometry.setAttribute(name, new THREE.BufferAttribute(data, itemSize ?? (name === 'color' ? 3 : size)));
      attributes.push(name);
    };
    take(draco.POSITION, 'position');
    take(draco.NORMAL, 'normal');
    take(draco.COLOR, 'color');
    take(draco.TEX_COORD, 'uv');
    if (!geometry.getAttribute('position')) throw new DracoImportError(`${main.name} has no positions`);
    if (isMesh) {
      const faces = (dracoGeometry.num_faces as () => number).call(dracoGeometry);
      const byteLength = faces * 3 * 4;
      const ptr = draco._malloc(byteLength);
      decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(draco.HEAPF32.buffer, ptr, faces * 3).slice(), 1));
      draco._free(ptr);
    }
  } finally {
    draco.destroy(dracoGeometry);
    draco.destroy(decoder);
  }

  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.drc$/i, '');
  const vertexColors = !!geometry.getAttribute('color');
  let object: THREE.Object3D;
  if (isMesh) {
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
    object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ name, color: vertexColors ? 0xffffff : 0xcccccc, vertexColors, roughness: 0.6, metalness: 0, side: THREE.DoubleSide }));
  } else {
    object = new THREE.Points(geometry, new THREE.PointsMaterial({ name, color: vertexColors ? 0xffffff : 0x888888, vertexColors, size: options.pointSize ?? 2, sizeAttenuation: false }));
  }
  object.name = name;
  geometry.computeBoundingSphere();
  const group = orient(object, name, options.upAxis === 'z', options.unitScale ?? 1);
  return { group, geometryType: isMesh ? 'mesh' : 'pointCloud', attributes, warnings, stats: countModel(group) };
}
