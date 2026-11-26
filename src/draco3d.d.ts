// draco3d ships no types; the module is typed in draco-types.ts.

declare module 'draco3d/draco_decoder_nodejs.js' {
  const createDecoderModule: (options?: object) => Promise<unknown>;
  export default createDecoderModule;
}
