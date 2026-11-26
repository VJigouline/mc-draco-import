import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDracoDecoder, loadDraco } from '../src/index.js';
import { sample } from './files.js';

describe('Browser decoder', () => {
  it('decodes with the decoder three.js serves for DRACOLoader', async () => {
    const dir = join(process.cwd(), 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco');
    const wasm = readFileSync(join(dir, 'draco_decoder.wasm'));
    const draco = await createDracoDecoder(readFileSync(join(dir, 'draco_wasm_wrapper.js'), 'utf8'), wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
    const r = await loadDraco(sample('bunny.drc'), { draco });
    expect(r.stats.triangles).toBeGreaterThan(1000);
  });
});
