// The parts of Google's draco3d decoder module that this package uses.

export interface DracoStatus { ok(): boolean; error_msg(): string }
export interface DracoAttribute { num_components(): number; data_type(): number; normalized(): boolean; attribute_type(): number }
export interface DracoGeometry { ptr: number; num_points(): number; num_faces?(): number }
export interface DracoDecoder {
  GetEncodedGeometryType(array: Int8Array): number;
  DecodeArrayToMesh(array: Int8Array, byteLength: number, mesh: DracoGeometry): DracoStatus;
  DecodeArrayToPointCloud(array: Int8Array, byteLength: number, cloud: DracoGeometry): DracoStatus;
  GetAttributeId(geometry: DracoGeometry, type: number): number;
  GetAttribute(geometry: DracoGeometry, id: number): DracoAttribute;
  GetAttributeDataArrayForAllPoints(geometry: DracoGeometry, attribute: DracoAttribute, dataType: number, byteLength: number, ptr: number): boolean;
  GetTrianglesUInt32Array(mesh: DracoGeometry, byteLength: number, ptr: number): boolean;
}
export interface DracoModule {
  Decoder: new () => DracoDecoder;
  Mesh: new () => DracoGeometry;
  PointCloud: new () => DracoGeometry;
  TRIANGULAR_MESH: number;
  POINT_CLOUD: number;
  POSITION: number;
  NORMAL: number;
  COLOR: number;
  TEX_COORD: number;
  GENERIC: number;
  DT_FLOAT32: number;
  DT_INT8: number;
  DT_UINT8: number;
  DT_INT16: number;
  DT_UINT16: number;
  HEAPF32: Float32Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  destroy(object: unknown): void;
}
export interface DracoModuleOptions {
  /** Where to find draco_decoder.wasm, given its file name. */
  locateFile?: (name: string, prefix: string) => string;
  wasmBinary?: ArrayBuffer | Uint8Array;
}
