import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { nasaUrl, parseSource } from './nasa-parser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function fetchHtml(url, redirects = 0) {
  nasaUrl(url, url);
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'manual', headers: { Accept: 'text/html' } });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 3) throw new Error('Demasiadas redirecciones');
    const location = response.headers.get('location');
    if (!location) throw new Error('Redirección sin destino');
    return fetchHtml(nasaUrl(location, url), redirects + 1);
  }
  if (!response.ok) throw new Error('NASA devolvió HTTP ' + response.status);
  if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('La ficha no devolvió HTML');
  const reader = response.body.getReader();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 5_000_000) { await reader.cancel(); throw new Error('Ficha demasiado grande'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
export async function importCatalog(configs, outputPath, getHtml = fetchHtml) {
  if (!Array.isArray(configs) || !configs.length) throw new Error('Lista de fuentes vacía');
  if (new Set(configs.map(c => c.id)).size !== configs.length) throw new Error('Identificadores duplicados');
  const videos = [];
  for (const config of configs) {
    nasaUrl(config.pageUrl, config.pageUrl);
    const html = await getHtml(config.pageUrl);
    videos.push(parseSource(html, config));
  }
  const catalog = { schemaVersion: 1, checkedAt: new Date().toISOString(), importMode: 'nasa-html-import', videos };
  const temp = outputPath + '.tmp';
  try {
    await writeFile(temp, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
    await rename(temp, outputPath);
  } finally { await rm(temp, { force: true }); }
  return catalog;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const configs = JSON.parse((await readFile(resolve(root, 'scripts/sources.json'), 'utf8')).replace(/^\uFEFF/, ''));
    const catalog = await importCatalog(configs, resolve(root, 'public/catalog-recent.json'));
    console.log('Catálogo actualizado: ' + catalog.videos.length + ' vídeos. No se han descargado los MP4.');
  } catch (error) {
    console.error('Importación cancelada; se conserva el catálogo anterior.');
    console.error(error.message, error.cause?.code ?? '');
    process.exitCode = 1;
  }
}

