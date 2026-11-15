import type { Language } from './LanguageSwitch';

const nasa = 'https://svs.gsfc.nasa.gov';

export type Video = {
  id: string;
  poster: string;
  src: string;
  spanishSrc?: string;
  spanishPoster?: string;
  fallbackSrc?: string;
};

export type VideoCard = Video & {
  title: Record<Language, string>;
  keyword?: Record<Language, string>;
  detail?: Record<Language, string>;
  period?: Record<Language, string>;
  captions?: { language: Language; src: string }[];
  transcript?: Record<Language, string>;
};

export const localize = (es: string, en: string) => ({ es, en });

export function nasaVideo(id: string, folder: string, file: string, poster: string): Video {
  const root = `${nasa}/vis/${folder}/`;
  return { id, src: root + file, poster: root + poster };
}

const eicVideo = (
  id: string, file: string, poster: string,
  title: Record<Language, string>, keyword: Record<Language, string>, detail: Record<Language, string>,
): VideoCard => ({
  ...nasaVideo(id, `a000000/a00${id.slice(0, 2)}00/a00${id}`, file, poster),
  title,
  keyword,
  detail,
});

const forests = eicVideo('4950', 'GEDI_global_w_colorbar_1080p60.mp4', 'GEDI_global_w_colorbar_0900_searchweb.png',
  localize('La altura de los bosques', 'Forest height'),
  localize('Bosques', 'Forests'),
  localize('Un mapa de la altura de las copas de los árboles en todo el mundo.', 'A global map of how high the forest canopy reaches.'));
const dixie = eicVideo('4993', 'Dixie_fire_2021_p30_1080p30.mp4', 'Dixie_fire_2021.7135_searchweb.png',
  localize('El avance del incendio Dixie', 'The spread of the Dixie Fire'),
  localize('Incendios', 'Wildfires'),
  localize('Sigue cómo se extendió el incendio por California en 2021.', 'Follow the fire as it spread across California in 2021.'));
const currents = eicVideo('5425', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p30.mp4', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p_carousel.jpg',
  localize('Corrientes oceánicas', 'Ocean currents'),
  localize('Océanos', 'Oceans'),
  localize('Observa los remolinos que dibujan las corrientes en el océano.', 'Watch ocean currents curl into swirling eddies.'));
const ice = eicVideo('5382', 'sea_ice_2024_min_1080p60.mp4', 'sea_ice_2024_min_2160p60.2608_searchweb.png',
  localize('El hielo marino del Ártico', 'Arctic sea ice'),
  localize('Hielo marino', 'Sea ice'),
  localize('Sigue el retroceso del hielo hasta su mínimo de 2024.', 'Follow the ice as it shrinks to its 2024 minimum.'));
const lightning = eicVideo('5011', 'iss_lightning_sphere_07312023.mp4', 'iss_lightning_preview_searchweb.png',
  localize('Rayos vistos desde el espacio', 'Lightning seen from space'),
  localize('Tormentas', 'Storms'),
  localize('Observa desde arriba cómo los relámpagos iluminan las tormentas.', 'See flashes of lightning inside storms from above.'));
const wind = eicVideo('5148', 'MC02_stage3_GMAO_near_surface_wind_2048x1024_en.mp4', 'MC02_stage3_GMAO_near_surface_wind_2048x1024_en.00001_print.jpg',
  localize('Vientos cerca de la superficie', 'Near-surface winds'),
  localize('Viento', 'Wind'),
  localize('Sigue el movimiento del aire sobre continentes y océanos.', 'Follow the movement of air over continents and oceans.'));
const heat = eicVideo('5207', '2023GISTEMP_Map_HD.mp4', '2023GISTEMP_Map.00899_searchweb.png',
  localize('Anomalías de temperatura global', 'Global temperature anomalies'),
  localize('Temperatura', 'Temperature'),
  localize('Observa dónde se registraron temperaturas por encima y por debajo de la media.', 'See where temperatures were above or below average.'));
const climate = eicVideo('5190', 'GISTEMP_Spiral_English_degC_2160p60.mp4', 'GISTEMP_Spiral_English_degC_2160p60.01402_print.jpg',
  localize('La espiral climática', 'The climate spiral'),
  localize('Clima', 'Climate'),
  localize('Una espiral muestra cómo ha aumentado la temperatura global con el tiempo.', 'A spiral traces the rise in global temperatures over time.'));
climate.spanishSrc = climate.src.replace('English', 'Spanish');
climate.spanishPoster = climate.poster.replace('English_degC_2160p60.01402_print', 'Spanish_degC_2160p60.01400_full');

// Curated from EIC gallery 40467 and the EIC dashboards linked inside it.
export const earthTopics = [
  { icon: 'land', label: localize('Tierra', 'Land'), videos: [forests, dixie] },
  { icon: 'water', label: localize('Agua', 'Water'), videos: [currents, ice] },
  { icon: 'air', label: localize('Aire', 'Air'), videos: [wind, lightning] },
  { icon: 'temperature', label: localize('Temperatura', 'Temperature'), videos: [heat, climate] },
  { icon: 'climate', label: localize('Clima', 'Climate'), videos: [climate, ice] },
] as const;

export const nasaSource = (id: string) => `${nasa}/${id}/`;
export const explorerCopy = {
  es: {
    title: 'Explora la Tierra', intro: 'La sonificación convierte datos en sonido para que puedas oír sus cambios y patrones.',
    modes: 'Modos de exploración', tabs: [['Escucha la Tierra', 'Explora por elementos'], ['Escucha cómo ha cambiado', 'Nueve preguntas sobre el planeta']],
    all: 'Todas', categories: 'Elementos de la Tierra',
    related: 'Pregunta relacionada', back: 'Volver a las pistas por elementos', details: 'Detalles', close: 'Cerrar',
    play: 'Reproducir vídeo', pause: 'Pausar vídeo', openPlayer: 'Abrir reproductor', player: 'Reproductor', playing: 'Reproduciendo vídeo', queued: 'En cola',
    visual: 'Qué se ve', period: 'Período de los datos', sound: 'Tono y volumen', source: 'Fuente', unknown: 'Por confirmar',
    pending: 'Sonificación pendiente. La correspondencia entre los datos, el tono y el volumen está por confirmar.',
    transcript: 'Transcripción y descripción sonora', transcriptPending: 'La descripción sonora y los subtítulos están pendientes.',
    error: 'No se pudo reproducir el vídeo. Consulta la fuente en Detalles.',
  },
  en: {
    title: 'Explore Earth', intro: 'Sonification turns data into sound so you can hear its changes and patterns.',
    modes: 'Exploration modes', tabs: [['Listen to Earth', 'Explore by element'], ['Listen to how Earth has changed', 'Nine questions about our planet']],
    all: 'All', categories: 'Earth elements',
    related: 'Related question', back: 'Return to tracks by element', details: 'Details', close: 'Close',
    play: 'Play video', pause: 'Pause video', openPlayer: 'Open player', player: 'Player', playing: 'Playing video', queued: 'Queued',
    visual: 'What you see', period: 'Data period', sound: 'Pitch and volume', source: 'Source', unknown: 'To be confirmed',
    pending: 'Sonification pending. The mapping from data to pitch and volume is to be confirmed.',
    transcript: 'Transcript and sound description', transcriptPending: 'A sound description and captions are pending.',
    error: 'The video could not be played. See the source under Details.',
  },
};

