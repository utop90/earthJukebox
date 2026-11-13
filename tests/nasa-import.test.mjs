import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractLinks, parseSource } from '../scripts/nasa-parser.mjs';
import { importCatalog } from '../scripts/import-nasa.mjs';

const config = { id: '5505', pageUrl: 'https://svs.gsfc.nasa.gov/5505/', videoFilename: 'selected.mp4', posterFilename: 'poster.png' };
const fixture = '<a href="/vis/selected.mp4">MP4</a><a href="/vis/selected.mp4">duplicate</a><a href="/vis/other.mp4">Other version</a><a href="/vis/poster.png">Poster</a>';
test('resolves relative anchors and deduplicates downloads', () => {
  assert.equal(extractLinks(fixture, config.pageUrl).length, 3);
  const video = parseSource(fixture, config);
  assert.equal(video.videoUrl, 'https://svs.gsfc.nasa.gov/vis/selected.mp4');
  assert.equal(video.posterUrl, 'https://svs.gsfc.nasa.gov/vis/poster.png');
});
test('ignores external hosts, scripts, comments and unsafe protocols', () => {
  const html = '<a href="https://evil.test/selected.mp4">x</a><a href="javascript:alert(1)">x</a><!-- <a href="/bad.mp4">x</a> --><script>let a = \'<a href="/bad2.mp4">\';</script><a href="/ok.mp4?a=1&amp;b=2">ok</a>';
  assert.deepEqual(extractLinks(html, config.pageUrl), ['https://svs.gsfc.nasa.gov/ok.mp4?a=1&b=2']);
});
test('fails instead of silently selecting an unrelated video', () => {
  assert.throws(() => parseSource('<a href="/other.mp4">x</a>', config), /ausente/);
});
test('handles single-quoted, uppercase and unquoted attributes', () => {
  assert.equal(extractLinks("<A HREF='/a.mp4'>x</A><a href=/b.mp4>x</a>", config.pageUrl).length, 2);
});
test('a failed import preserves the complete previous catalog', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'earth-import-'));
  const output = join(dir, 'catalog.json');
  try {
    await writeFile(output, 'original');
    await assert.rejects(importCatalog([config, { ...config, id: '2' }], output, async url => {
      if (url) throw new Error('Network unavailable');
    }));
    assert.equal(await readFile(output, 'utf8'), 'original');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('successful import writes source URLs and explicit import provenance', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'earth-import-'));
  try {
    const output = join(dir, 'catalog.json');
    const result = await importCatalog([config], output, async () => fixture);
    assert.equal(result.videos.length, 1);
    assert.equal(JSON.parse(await readFile(output, 'utf8')).importMode, 'nasa-html-import');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('bundled catalog matches source selection and only uses NASA assets', async () => {
  const read = async path => JSON.parse((await readFile(new URL(path, import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
  const catalog = await read('../public/catalog-recent.json');
  const sources = await read('../scripts/sources.json');
  assert.equal(catalog.videos.length, sources.length);
  for (const source of sources) {
    const video = catalog.videos.find(v => v.id === source.id);
    assert.ok(video);
    assert.equal(new URL(video.videoUrl).hostname, 'svs.gsfc.nasa.gov');
    assert.ok(video.videoUrl.endsWith(source.videoFilename));
    assert.ok(video.posterUrl.endsWith(source.posterFilename));
  }
});

