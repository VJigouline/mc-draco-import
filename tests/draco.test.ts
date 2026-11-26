import * as THREE from 'three';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { DracoImportError, loadDraco } from '../src/index.js';
import { sample } from './files.js';

const require = createRequire(import.meta.url);

/** Encodes a coloured point cloud with draco3d's encoder. */
async function encodePoints(): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enc: any = await require('draco3d').createEncoderModule({});
  const builder = new enc.PointCloudBuilder();
  const cloud = new enc.PointCloud();
  builder.AddFloatAttribute(cloud, enc.POSITION, 2, 3, new Float32Array([0, 0, 0, 1, 2, 3]));
  builder.AddUInt8Attribute(cloud, enc.COLOR, 2, 3, new Uint8Array([255, 0, 0, 0, 0, 255]));
  const encoder = new enc.Encoder();
  const out = new enc.DracoInt8Array();
  const length = encoder.EncodePointCloudToDracoBuffer(cloud, false, out);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) bytes[i] = out.GetValue(i);
  enc.destroy(out);
  enc.destroy(encoder);
  enc.destroy(cloud);
  enc.destroy(builder);
  return bytes;
}

describe('Draco', () => {
  it('decodes a compressed mesh', async () => {
    const r = await loadDraco(sample('bunny.drc'));
    expect(r.geometryType).toBe('mesh');
    expect(r.attributes).toContain('position');
    expect(r.stats.meshes).toBe(1);
    expect(r.stats.triangles).toBeGreaterThan(1000);
    let mesh: THREE.Mesh | undefined;
    r.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh; });
    expect(mesh!.geometry.getAttribute('normal')).toBeTruthy();
  });

  it('decodes a coloured point cloud', async () => {
    const r = await loadDraco({ name: 'cloud.drc', data: await encodePoints() }, { upAxis: 'z' });
    expect(r.geometryType).toBe('pointCloud');
    expect(r.stats.points).toBe(2);
    expect(r.attributes).toEqual(['position', 'color']);
    let points: THREE.Points | undefined;
    r.group.traverse((o) => { if ((o as THREE.Points).isPoints) points = o as THREE.Points; });
    const c = points!.geometry.getAttribute('color');
    expect([c.getX(0), c.getY(0), c.getZ(1)]).toEqual([1, 0, 1]);
    expect(r.group.rotation.x).toBeCloseTo(-Math.PI / 2);
  });

  it('refuses files that are not Draco', async () => {
    await expect(loadDraco('hello world')).rejects.toThrow(DracoImportError);
  });
});
