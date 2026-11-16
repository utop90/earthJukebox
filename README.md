# 🛰️🎧🌍 Earth Jukebox🌍🎧🛰️
### NASA Space Apps Challenge 2026 | Space Bokeronas

**Turning Earth's visual data into an immersive sound experience.**

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202026-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![Team](https://img.shields.io/badge/Team-Space%20Bokeronas-E85D75?style=for-the-badge)](#the-team)
[![Built with](https://img.shields.io/badge/React-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#technology-stack)
[![Vite](https://img.shields.io/badge/Vite-Fast%20Development-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#technology-stack)

**Earth Jukebox** is a web application developed by **Space Bokeronas**, a two-member full stack developers team at the NASA Space Apps Challenge 2026.

Inspired by NASA's Earth Information Center (EIC), the project explores how scientific visualisations of our planet can become an alternative way of experiencing Earth science through sound.

Our goal is to make complex Earth science data more accessible, engaging and intuitive by connecting visual information with audio experiences.

---

##  The Concept:

What if we could listen to our planet?

Earth Jukebox explores the relationship between visual data and sound through sonification: the process of translating information into audio.

The project uses selected visualisations from NASA's Scientific Visualization Studio (SVS), particularly content associated with the Earth Information Center.

The audio tracks are generated from the brightness information of video frames. They are not recordings of natural Earth sounds, but audio representations of visual data.

By combining scientific visualisations, video and sonification, Earth Jukebox aims to offer an alternative perspective on phenomena such as ocean temperature anomalies and changes in our planet's systems.

##  Features:

- **NASA video catalogue:** A curated collection of official NASA Earth Information Center visualisations.
- **Chronological organisation:** Videos are sorted by publication date, with the newest entries displayed first.
- **HTML5 video player:** Native playback controls, no autoplay and on-demand loading using `preload="none"`.
- **Search and filtering:** Find relevant scientific visualisations more easily.
- **Source traceability:** Every entry includes a link to its original NASA page.
- **Error handling:** Retry functionality and a direct link to the original source when a video cannot be loaded.
- **Audio sonification:** MP4 videos include AAC audio tracks generated from image brightness information.
- **Curated scientific content:** Video selections, dates and descriptions are reviewed against their official NASA source pages.

## Tech Stack:

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety and application logic |
| Vite | Development server and production build |
| HTML5 Video | Video playback |
| Node.js | Import scripts and development tooling |
| FFmpeg / FFprobe | Audio generation and media verification |
| Native Node.js Test Runner | Automated testing |
| NASA Scientific Visualization Studio | Scientific visualisation sources |

##  Getting Started:

### Requirements

- Node.js 22.12 or later (Node.js 24 recommended).
- npm.

### Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal by Vite.

### Production build

```bash
npm run build
```

After a successful installation, commit the generated `package-lock.json` to the repository.

## 🛰️ NASA Content Importer

Earth Jukebox includes a Node.js script for refreshing the selected NASA video links.

Run:

```bash
npm run import:nasa
```

The importer:

1. Reads the NASA source pages configured in `scripts/sources.json`.
2. Extracts HTML links from those pages.
3. Selects explicitly configured video and thumbnail filenames.
4. Validates HTTPS requests against the `svs.gsfc.nasa.gov` host.
5. Applies time, response-size and redirect limits.
6. Preserves the previous catalogue if any source fails.

The importer does not crawl the entire NASA website or download video files.

To add a new visualisation, review its official NASA page first, then update its video selection and credits in `sources.json`.

**Initial catalogue:** The entries were prepared from manually reviewed official NASA pages on 13 November 2026. The `importMode` field identifies this initial curated dataset; it does not represent an automatically completed import.

The importer refreshes configured links but does not automatically discover new NASA publications.

## 📁 Project Structure :

```text
earth-jukebox/
│
├── public/
│   ├── media/
│   │   └── audio/
│   ├── catalog-recent.json
│   └── catalog.json
│
├── scripts/
│   └── sources.json
│
├── src/
│   └── [application source files]
│
├── package.json
├── package-lock.json
└── README.md
```

**Catalogue files:**

- `public/catalog-recent.json`: Active catalogue containing the selected recent visualisations.
- `public/catalog.json`: Historical catalogue retained for reference.

Entries are sorted by `publishedAt` in descending order. The `updatedAt` field represents the date of the NASA source page consulted, not the upload date of the video file.

## 🎧 Audio Generation and Testing :

The audio component is generated from video image brightness information.

It does not represent recorded environmental sounds or direct measurements of sound in nature.

To regenerate the audio tracks, run:

```bash
npm run media:sonify
```

This operation requires FFmpeg and FFprobe.

To validate the audio:

```bash
npm run test:audio
```

The audio verification process checks:

- Whether every audio track can be decoded.
- Audio duration.
- Volume levels.
- Silent gaps longer than 0.5 seconds.

Video streams are copied without re-encoding. The media manifest is updated only after all files have been processed successfully.

## Testing and Quality Assurance :

Run the automated tests:

```bash
npm test
```

Build the application:

```bash
npm run build
```

The native Node.js tests cover:

- Video link selection.
- Duplicate detection.
- External links.
- Changes in NASA HTML structures.
- Catalogue preservation when an import fails.
- Integrity of the initial catalogue.

**Testing note:** HTML fixtures are synthetic test data. They do not replace a live import against NASA's servers.

### Verification Status:

| Check | Status |
|---|---|
| Automated Node.js tests | Passed — 7 tests |
| Production build | Successful |
| Initial catalogue integrity | Covered by automated tests |
| Browser playback | Pending verification |
| Live NASA import | Pending verification |

During the initial setup, DNS resolution errors (`ENOTFOUND`) prevented access to `registry.npmjs.org` and `svs.gsfc.nasa.gov`.

In a subsequent review, dependencies became available, all seven automated tests passed and the production build completed successfully.

Browser playback and a live import remain to be verified.

## Technical considerations:

- Videos are streamed directly from NASA on demand.
- Thumbnails also require an internet connection.
- Native HTML5 video controls are used, without autoplay.
- `preload="none"` avoids unnecessary initial media loading.
- Canvas and `crossOrigin` are not currently used.
- Browser playback of an external video does not automatically grant permission to read its pixels. Future pixel-level processing will require same-origin assets or verified CORS permissions.
- External web fonts use a sans-serif fallback when unavailable.

##Sources and Credits to NASA  :

The project uses scientific visualisations published by NASA's Scientific Visualization Studio.

**Official sources:**

- [NASA Earth Information Center](https://svs.gsfc.nasa.gov/gallery/earth-information-center/)
- [El Niño 2026: Sea Surface Temperature Anomaly](https://svs.gsfc.nasa.gov/5688/) — 27 October 2026.
- [El Niño 2026: Ocean Apparent Visible Wavelength](https://svs.gsfc.nasa.gov/5687/) — 27 October 2026.
- [Solar System: EIC Display](https://svs.gsfc.nasa.gov/5674/) — 20 October 2026.

**Credits:** NASA's Scientific Visualization Studio. Full individual credits are retained on the original NASA pages.

Earth Jukebox is an independent educational and experimental project. It is not an official NASA website, nor is it endorsed by NASA.

## 👩‍💻 The Team :

### Space Bokeronas — Málaga, Spain

Developed during the **NASA Space Apps Challenge 2026**, held in Málaga on 14–15 November 2026.

- **Sara Bengoa** — Mid-Full Stack Developer
- **Lavinia** — https://github.com/codinglavinia- Full Stack Developer | Cybersecurity | AI | Remote sensing and Geospatial Analysis



## Our Vision:

Earth Jukebox is an exploration of how technology can make scientific information more inclusive and engaging.

By connecting data visualisation and sound, we want to encourage people to discover our planet from a different perspective.

**Because Earth is not only something we see. It is something we can learn to listen to.**

---

## 🌍🎧🛰️Earth Jukebox🌍🎧🛰️ :
### NASA Space Apps Challenge 2026 | Space Bokeronas

**Transformando los datos visuales de la Tierra en una experiencia sonora inmersiva.**

**Earth Jukebox** es una aplicación web desarrollada por **Space Bokeronas**, un equipo de dos integrantes de Málaga, España, durante el NASA Space Apps Challenge 2026.

Inspirado en el Earth Information Center (EIC) de la NASA, el proyecto explora cómo las visualizaciones científicas de nuestro planeta pueden convertirse en una forma alternativa de experimentar la ciencia de la Tierra a través del sonido.

Nuestro objetivo es acercar los datos científicos a las personas mediante la combinación de información visual y experiencias sonoras.

## El concepto :

¿Y si pudiéramos escuchar nuestro planeta?

Earth Jukebox explora la relación entre los datos visuales y el sonido mediante la sonificación: el proceso de transformar información en representaciones sonoras.

El proyecto utiliza visualizaciones seleccionadas del Scientific Visualization Studio (SVS) de la NASA, especialmente contenidos relacionados con el Earth Information Center.

Las pistas de audio se generan a partir de la información de luminosidad de los fotogramas de vídeo. No son grabaciones de sonidos naturales de la Tierra, sino representaciones sonoras de información visual.

La combinación de visualizaciones científicas, vídeo y sonificación pretende ofrecer una perspectiva diferente sobre fenómenos como las anomalías de temperatura oceánica y los cambios en los sistemas terrestres.

## Funcionalidades:

- **Catálogo de vídeos NASA:** colección seleccionada de visualizaciones oficiales del Earth Information Center.
- **Orden cronológico:** vídeos organizados por fecha de publicación, mostrando primero los más recientes.
- **Reproductor HTML5:** controles nativos, sin reproducción automática y carga bajo demanda mediante `preload="none"`.
- **Búsqueda y filtros:** permiten localizar visualizaciones científicas.
- **Trazabilidad de las fuentes:** cada contenido incluye un enlace a su página original de NASA.
- **Gestión de errores:** opción de reintento y enlace directo a la fuente original cuando falla la reproducción.
- **Sonificación de audio:** vídeos MP4 con pistas AAC generadas a partir de la luminosidad de las imágenes.
- **Contenido científico seleccionado:** fechas, descripciones y vídeos revisados manualmente en las páginas oficiales.

## Tecnologías utilizadas :

| Tecnología | Aplicación |
|---|---|
| React | Interfaz de usuario |
| TypeScript | Tipado y lógica de aplicación |
| Vite | Servidor de desarrollo y compilación |
| HTML5 Video | Reproducción de vídeo |
| Node.js | Scripts de importación y herramientas |
| FFmpeg / FFprobe | Generación y validación de audio |
| Node.js Test Runner | Pruebas automatizadas |
| NASA Scientific Visualization Studio | Fuentes de visualizaciones científicas |

## Instalación y ejecución :

### Requisitos:

- Node.js 22.12 o superior (se recomienda Node.js 24).
- npm.

### Instalación:

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
npm install
npm run dev
```

Abrir la URL local que muestra Vite en la terminal.

Para generar la versión de producción:

```bash
npm run build
```

Después de una instalación correcta, añadir `package-lock.json` al repositorio.

## 🛰️ Importador de contenidos NASA

Para actualizar los enlaces configurados:

```bash
npm run import:nasa
```

El importador:

1. Consulta las páginas definidas en `scripts/sources.json`.
2. Extrae los enlaces HTML.
3. Selecciona los nombres exactos de los vídeos y las miniaturas.
4. Valida las peticiones HTTPS contra el dominio `svs.gsfc.nasa.gov`.
5. Aplica límites de tiempo, tamaño de respuesta y redirecciones.
6. Conserva el catálogo anterior si alguna fuente falla.

El importador no rastrea todo el sitio web de NASA ni descarga los vídeos.

Para incorporar una nueva visualización, primero hay que revisar su página oficial y después añadir la selección y los créditos correspondientes a `sources.json`.

**Catálogo inicial:** preparado a partir de enlaces revisados manualmente en las páginas oficiales el 13 de noviembre de 2026. El campo `importMode` distingue este catálogo inicial de una importación automática ejecutada.

Las fechas y descripciones están seleccionadas y revisadas manualmente. El importador actualiza enlaces, pero no descubre automáticamente las nuevas publicaciones.

## 📁 Estructura de datos :

- `public/catalog-recent.json`: catálogo activo de visualizaciones recientes.
- `public/catalog.json`: catálogo histórico conservado como referencia.

Los vídeos se ordenan por `publishedAt` en orden descendente. El campo `updatedAt` refleja la fecha de consulta de la página NASA, no la fecha de subida del archivo de vídeo.

## 🎧 Generación y validación del audio

El audio se genera a partir de la información de luminosidad de las imágenes de los vídeos.

No representa sonidos ambientales grabados ni mediciones acústicas directas de la naturaleza.

Para regenerar las pistas:

```bash
npm run media:sonify
```

Se necesitan FFmpeg y FFprobe.

Para comprobar los archivos de audio:

```bash
npm run test:audio
```

El proceso verifica:

- Decodificación de las pistas.
- Duración del audio.
- Niveles de volumen.
- Ausencia de silencios superiores a 0,5 segundos.

Los flujos de vídeo se copian sin recodificación. El manifiesto multimedia solo se actualiza cuando todos los archivos han terminado de procesarse correctamente.

## QA Testing  :

```bash
npm test
npm run build
```

Las pruebas nativas de Node.js cubren:

- Selección de enlaces de vídeo.
- Detección de duplicados.
- Enlaces externos.
- Cambios en la estructura HTML de NASA.
- Conservación del catálogo ante errores de importación.
- Integridad del catálogo inicial.

Las fixtures HTML son datos de prueba sintéticos y no sustituyen una ejecución real contra los servidores de NASA.

### Estado de verificación:

| Comprobación | Estado |
|---|---|
| Pruebas automatizadas Node.js | Superadas — 7 pruebas |
| Compilación de producción | Correcta |
| Integridad del catálogo inicial | Cubierta por pruebas |
| Reproducción en navegador | Pendiente de verificación |
| Importación en vivo desde NASA | Pendiente de verificación |

Durante el primer intento de instalación se produjeron errores DNS (`ENOTFOUND`) al acceder a `registry.npmjs.org` y `svs.gsfc.nasa.gov`.

En una revisión posterior, las dependencias estuvieron disponibles, las siete pruebas automatizadas finalizaron correctamente y la compilación de producción se completó con éxito.

La reproducción en navegador y la importación en vivo siguen pendientes de verificación.

## Consideraciones técnicas:

- Los vídeos se reproducen directamente desde NASA bajo demanda.
- Las miniaturas también requieren conexión a Internet.
- Se utilizan los controles nativos de HTML5, sin reproducción automática.
- `preload="none"` evita la carga multimedia inicial innecesaria.
- Actualmente no se utilizan Canvas ni `crossOrigin`.
- Que un navegador pueda reproducir un vídeo externo no garantiza que permita leer sus píxeles. Para futuras operaciones de procesamiento será necesario utilizar recursos del mismo origen o verificar los permisos CORS.
- Las fuentes tipográficas externas disponen de una alternativa sans-serif.

## Fuentes y créditos:

- [NASA Earth Information Center](https://svs.gsfc.nasa.gov/gallery/earth-information-center/)
- [El Niño 2026: Sea Surface Temperature Anomaly](https://svs.gsfc.nasa.gov/5688/) — 27 de octubre de 2026.
- [El Niño 2026: Ocean Apparent Visible Wavelength](https://svs.gsfc.nasa.gov/5687/) — 27 de octubre de 2026.
- [Solar System: EIC Display](https://svs.gsfc.nasa.gov/5674/) — 20 de octubre de 2026.

**Créditos:** NASA's Scientific Visualization Studio. Se mantienen los créditos completos en las páginas originales de NASA.

Earth Jukebox es un proyecto independiente, educativo y experimental. No es una página web oficial de NASA ni cuenta con su respaldo institucional.

## 👩‍💻 El equipo

### Space Bokeronas — Málaga, España

Desarrollado durante el **NASA Space Apps Challenge 2026**, celebrado en Málaga los días 14 y 15 de noviembre de 2026.
- **Sara Bengoa** — Mid-Full Stack Developer
- **Lavinia** — https://github.com/codinglavinia- Full Stack Developer | Cybersecurity | AI | Remote sensing and Geospatial Analysis

## Nuestra visión:

Earth Jukebox explora cómo la tecnología puede hacer que la información científica sea más accesible, inclusiva y atractiva.

Conectando la visualización de datos y el sonido, queremos invitar a las personas a descubrir nuestro planeta desde una perspectiva diferente.

**Porque la Tierra no solo es algo que vemos. También es algo que podemos aprender a escuchar.**

---

<p align="center">
  🛰️🌍 <strong>EARTH JUKEBOX</strong> 🌍🛰️
  <br>
  <em>Listen to the planet. Discover the science. Explore above and beyond.</em>
  <br><br>
  <strong>Space Bokeronas | Málaga, Spain | NASA Space Apps Challenge 2026</strong>
</p>
