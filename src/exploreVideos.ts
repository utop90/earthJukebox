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
  detail?: Record<Language, string>;
};

export const localize = (es: string, en: string) => ({ es, en });

export function nasaVideo(id: string, folder: string, file: string, poster: string): Video {
  const root = `${nasa}/vis/${folder}/`;
  return { id, src: root + file, poster: root + poster };
}

const eicVideo = (id: string, file: string, poster: string, es: string, en: string): VideoCard => ({
  ...nasaVideo(id, `a000000/a00${id.slice(0, 2)}00/a00${id}`, file, poster),
  title: localize(es, en),
});

const forests = eicVideo('4950', 'GEDI_global_w_colorbar_1080p60.mp4', 'GEDI_global_w_colorbar_0900_searchweb.png', 'La altura de los bosques', 'Forest height');
const dixie = eicVideo('4993', 'Dixie_fire_2021_p30_1080p30.mp4', 'Dixie_fire_2021.7135_searchweb.png', 'El avance del incendio Dixie', 'The spread of the Dixie Fire');
const currents = eicVideo('5425', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p30.mp4', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p_carousel.jpg', 'Corrientes oceánicas', 'Ocean currents');
const ice = eicVideo('5382', 'sea_ice_2024_min_1080p60.mp4', 'sea_ice_2024_min_2160p60.2608_searchweb.png', 'El hielo marino del Ártico', 'Arctic sea ice');
const lightning = eicVideo('5011', 'iss_lightning_sphere_07312023.mp4', 'iss_lightning_preview_searchweb.png', 'Rayos vistos desde el espacio', 'Lightning seen from space');
const wind = eicVideo('5148', 'MC02_stage3_GMAO_near_surface_wind_2048x1024_en.mp4', 'MC02_stage3_GMAO_near_surface_wind_2048x1024_en.00001_print.jpg', 'Vientos cerca de la superficie', 'Near-surface winds');
const heat = eicVideo('5207', '2023GISTEMP_Map_HD.mp4', '2023GISTEMP_Map.00899_searchweb.png', 'Anomalías de temperatura global', 'Global temperature anomalies');
const climate = eicVideo('5190', 'GISTEMP_Spiral_English_degC_2160p60.mp4', 'GISTEMP_Spiral_English_degC_2160p60.01402_print.jpg', 'La espiral climática', 'The climate spiral');
climate.spanishSrc = climate.src.replace('English', 'Spanish');
climate.spanishPoster = climate.poster.replace('English_degC_2160p60.01402_print', 'Spanish_degC_2160p60.01400_full');

// Curated from EIC gallery 40467 and the EIC dashboards linked inside it.
export const earthTopics = [
  { label: localize('Tierra', 'Land'), videos: [forests, dixie] },
  { label: localize('Agua', 'Water'), videos: [currents, ice] },
  { label: localize('Aire', 'Air'), videos: [wind, lightning] },
  { label: localize('Temperatura', 'Temperature'), videos: [heat, climate] },
  { label: localize('Clima', 'Climate'), videos: [climate, ice] },
];

export const nasaSource = (id: string) => `${nasa}/${id}/`;
