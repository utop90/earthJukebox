// Limited link extractor for NASA's download anchors, not a general HTML scraper.
export function nasaUrl(href, base) {
  const url = new URL(href, base);
  if (url.protocol !== 'https:' || url.hostname !== 'svs.gsfc.nasa.gov' || url.username || url.password || url.port) {
    throw new Error('URL fuera del origen NASA SVS permitido');
  }
  return url.href;
}
function decodeEntities(text) {
  return text.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)));
}
export function extractLinks(html, base) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const links = new Set();
  for (const match of clean.matchAll(/<a\b[^>]*\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)) {
    try { links.add(nasaUrl(decodeEntities(match[1] ?? match[2] ?? match[3]), base)); } catch { /* Ignore non-SVS links. */ }
  }
  return [...links];
}
export function parseSource(html, config) {
  const links = extractLinks(html, config.pageUrl);
  const find = filename => {
    const matches = links.filter(link => decodeURIComponent(new URL(link).pathname.split('/').at(-1)) === filename);
    if (matches.length !== 1) throw new Error(config.id + ': archivo ausente o ambiguo: ' + filename);
    return matches[0];
  };
  const { videoFilename, posterFilename, ...metadata } = config;
  if (!videoFilename.endsWith('.mp4')) throw new Error('Se requiere vídeo MP4');
  return { ...metadata, videoUrl: find(videoFilename), posterUrl: find(posterFilename) };
}

