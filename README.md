# Earth Jukebox — primera etapa

Aplicación React + TypeScript + Vite para explorar vídeos oficiales del Earth Information Center.
Incluye catálogo, reproductor HTML5, búsqueda, filtros, enlaces de procedencia y estados de error.
Todavía no genera sonido ni extrae fotogramas.

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
Este proyecto no es una web oficial de NASA.

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
La instalación y el importador en vivo están bloqueados por DNS. Por ello aún no se han validado
el build ni la interfaz en navegador. Ejecutar instalación, importación y build al disponer de red.
No hay lockfile generado ni se han descargado paquetes correctamente.

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
