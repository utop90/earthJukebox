# 🛰️🌍Earth Jukebox 🛰️🌍
# NASA SPACE APPS Challenge 2026
# team :Space Bokeronas (Málaga,Spain)
"Earth Jukebox"  generates for the user dynamic sonifications from NASA's EIC visual frames. 
## Features :

- Video catalog sorted by publication date (newest first).
- HTML5 player with native controls, no autoplay, and on-demand loading (`preload="none"`).
- Search and content filters.
- Provenance link to the original NASA page for each video.
- Error handling: retry and a link to the original if a video fails to load.

## Requirements :

- [Node.js](https://nodejs.org/) 22.12 or later (Node 24 recommended).
- npm.

## Installation and Development:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

To build for production:

```bash
npm run build
```

> After a successful install, commit `package-lock.json` to the repository.

## Importing NASA Links

```bash
npm run import:nasa
```

The importer requires no installed dependencies and runs directly with Node.

- It reads the pages defined in `scripts/sources.json`, extracts their HTML links, and selects the exact video and thumbnail filenames. Explicit selection prevents confusing different resolutions or variants with the intended asset.
- It does not crawl the NASA site or download videos.
- It only accepts HTTPS requests to the `svs.gsfc.nasa.gov` host, with limits on time, size, and redirects.
- If any source fails, the previous catalog is kept.

To add a video, first review its NASA page, then add its selection and credits to `sources.json`.

**Note on the initial catalog:** it was prepared from links manually reviewed on the official pages on 13/11/2026. The `importMode` field distinguishes this data from an automatically executed import. Measurements and descriptions in `sources.json` are curated, not extracted.

## Data Structure

- `public/catalog-recent.json`: active catalog.
- `public/catalog.json`: historical catalog, kept for reference.
- Videos are sorted by `publishedAt` in descending order. `updatedAt` reflects the date of the NASA page consulted, not the upload date of the video file.

Dates and selections are reviewed manually. The importer refreshes links but **does not automatically discover** the latest publications.

## Testing :

The player uses MP4s with embedded AAC sonification in `public/media/audio`.
Audio is generated from each video's image brightness, not recorded Earth sounds.
To regenerate it, run `npm run media:sonify` (requires FFmpeg and FFprobe).
Run `npm run test:audio` to decode every audio track, check its duration and
volume, and reject silent gaps longer than half a second. Video streams are
copied without re-encoding. The manifest switches only after all files finish.

```bash
npm test
npm run build
```

The native Node tests cover link selection, duplicates, external links, HTML changes, catalog preservation on failure, and integrity of the initial catalog.

> The HTML fixtures are synthetic. They do not replace a real run against NASA's servers.

## Verification Status

- On the first install attempt, the environment could not resolve `registry.npmjs.org` or `svs.gsfc.nasa.gov` (`ENOTFOUND` errors).
- In a later review, dependencies were available: `npm test` passed 7 tests and `npm run build` compiled successfully.
- **Pending:** browser playback verification and a live import run.

## Technical Notes

- Videos stream directly from NASA on demand. Thumbnails also require a connection.
- `Canvas` and `crossOrigin` are not used at this stage. If pixel reading is needed later, assets must be served from the same origin or CORS must be verified. A browser being able to play an external video does not grant permission to read its pixels.
- External web fonts fall back to a sans-serif stack.

## Sources and Credits

Official pages used:

- [Earth Information Center](https://svs.gsfc.nasa.gov/gallery/earth-information-center/)
- [El Niño 2026: Sea Surface Temperature Anomaly](https://svs.gsfc.nasa.gov/5688/) (27/10/2026)
- [El Niño 2026: Ocean Apparent Visible Wavelength](https://svs.gsfc.nasa.gov/5687/) (27/10/2026)
- [Solar System: EIC Display](https://svs.gsfc.nasa.gov/5674/) (20/10/2026)

**Credits:** NASA's Scientific Visualization Studio. The pages retain the full credits for each piece.

*This project is not an official NASA website.*

## License

To be defined by the author. Videos and materials belong to NASA and are used under NASA's content use policies.

# 🛰️🌍Earth Jukebox 🛰️🌍

Aplicación React + TypeScript + Vite para explorar vídeos oficiales del Earth Information Center.
Incluye catálogo, reproductor HTML5, búsqueda, filtros, enlaces de procedencia y estados de error.


## Ejecutar

Requiere Node.js 22.12+ (o Node 24) y npm.

```powershell
npm install
npm run dev
```

Abrir la URL local que imprima Vite. Para compilar: `npm run build`.
La instalación genera package-lock.json; añadirlo al repositorio tras instalar correctamente.

## Importar enlaces de NASA

```powershell
npm run import:nasa
```

Este comando funciona con Node sin instalar dependencias. Consulta las tres fichas definidas en
scripts/sources.json, extrae sus enlaces HTML y selecciona los nombres exactos de vídeo y miniatura.
La selección explícita evita confundir una resolución o variante diferente con la pieza elegida.
No recorre todo el sitio y no descarga los vídeos. Acepta únicamente HTTPS del host svs.gsfc.nasa.gov,
limita tiempo, tamaño y redirecciones. Si falla cualquier fuente conserva el catálogo anterior.
Para añadir una pieza, revisar primero la ficha NASA y añadir su selección y créditos a sources.json.

El catálogo inicial fue preparado a partir de enlaces revisados en las fichas oficiales el 13/11/2026;
importMode lo distingue de una importación ejecutada automáticamente. No se presenta como scraping
completado desde esta terminal. Las medidas y descripciones de sources.json son curadas, no extraídas.

## Fuentes

- https://svs.gsfc.nasa.gov/gallery/earth-information-center/
- https://svs.gsfc.nasa.gov/5688/ — El Niño 2026: Sea Surface Temperature Anomaly (27/10/2026).
- https://svs.gsfc.nasa.gov/5687/ — El Niño 2026: Ocean Apparent Visible Wavelength (27/10/2026).
- https://svs.gsfc.nasa.gov/5674/ — Solar System: EIC Display (20/10/2026).

Créditos: NASA's Scientific Visualization Studio. Las fichas conservan los créditos completos.


## Pruebas

```powershell
npm test
npm run build
```

Las pruebas nativas de Node cubren selección, duplicados, enlaces externos, cambios de HTML,
conservación del catálogo ante fallos e integridad del catálogo inicial.
Las fixtures HTML son sintéticas; no sustituyen una ejecución real contra NASA.

## Estado de verificación en este entorno

La terminal devolvió ENOTFOUND para registry.npmjs.org y svs.gsfc.nasa.gov.
La instalación inicial estuvo bloqueada por DNS. En la revisión posterior las dependencias ya estaban disponibles: npm test pasó 7 pruebas y npm run build compiló correctamente. La reproducción en navegador y la importación en vivo siguen pendientes de verificación.

## Vídeos y siguiente etapa

Los vídeos se reproducen desde NASA bajo demanda (preload=none), con controles nativos y sin autoplay.
Las imágenes de portada también requieren conexión. Un fallo de vídeo muestra reintento y enlace al original.
En esta etapa no se utiliza Canvas ni crossOrigin: la futura lectura de píxeles exigirá descargar/servir
los activos desde el mismo origen o comprobar CORS. El navegador puede reproducir vídeo externo sin que
eso garantice permiso para leer sus píxeles. Las fuentes tipográficas externas tienen fallback sans-serif.


## Selección por fecha (13/11/2026)

El catálogo sustituye los ejemplos históricos por tres publicaciones recientes con vínculo EIC verificado.
Se ordena por publishedAt descendente. updatedAt es la fecha de la ficha NASA consultada, no la fecha
de subida de cada byte del vídeo. Los dos vídeos oceánicos se actualizan diariamente en NASA.
Las fechas y la selección son revisadas manualmente; el importador refresca enlaces, no descubre
automáticamente las últimas publicaciones. El buscador de NASA no permitió verificar un ranking exhaustivo.

El catálogo activo es public/catalog-recent.json. catalog.json se conserva como catálogo histórico; estaba bloqueado por otro proceso durante la actualización.
