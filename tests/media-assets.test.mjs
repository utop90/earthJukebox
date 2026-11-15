import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const publicRoot = new URL('../public/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('media-sources.json', publicRoot), 'utf8'));

test('every advertised local video is a complete MP4, including language and fallback variants', async () => {
  for (const item of manifest.items) {
    const data = await readFile(new URL(item.path, publicRoot));
    assert.ok(data.includes(Buffer.from('soun')), `${item.path}: missing embedded audio track`);
    const atoms = new Set();
    let offset = 0;
    while (offset < data.length) {
      assert.ok(offset + 8 <= data.length, `${item.path}: truncated atom header`);
      let size = data.readUInt32BE(offset);
      const type = data.toString('ascii', offset + 4, offset + 8);
      if (size === 1) {
        assert.ok(offset + 16 <= data.length, `${item.path}: truncated extended header`);
        size = Number(data.readBigUInt64BE(offset + 8));
      } else if (size === 0) size = data.length - offset;
      assert.ok(size >= 8 && offset + size <= data.length, `${item.path}: truncated ${type}`);
      atoms.add(type);
      offset += size;
    }
    for (const type of ['ftyp', 'moov', 'mdat']) {
      assert.ok(atoms.has(type), `${item.path}: missing ${type}`);
    }
  }
});
