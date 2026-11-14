export type MapVideo = {
  id: string;
  title: string;
  description: string;
  descriptionEs: string;
  image: string;
  video: string;
};

function eicVideo(id: string, title: string, description: string, descriptionEs: string, poster: string, file: string): MapVideo {
  const root = `https://svs.gsfc.nasa.gov/vis/a000000/a00${id.slice(0, 2)}00/a00${id}/`;
  return { id, title, description, descriptionEs, image: root + poster, video: root + file };
}

const dixie = eicVideo('4993', 'Spread of the Dixie Fire', 'Satellite detections trace the spread of the 2021 fire across northern California.', 'Las detecciones satelitales muestran el avance del incendio de 2021 en el norte de California.', 'Dixie_fire_2021.7135_searchweb.png', 'Dixie_fire_2021_p30_1080p30.mp4');
const agulhas = eicVideo('5505', 'The Agulhas Current', 'Explore the currents and eddies off southern Africa.', 'Explora las corrientes y los remolinos del sur de África.', 'OceanFlows_3840x108030fps.png', 'OceanFlows_AgulhasCurrent_3840x1080.mp4');
const forests = eicVideo('4950', 'GEDI Forest Height', 'This global map uses measurements from the International Space Station to show forest height.', 'Este mapa mundial usa mediciones de la Estación Espacial Internacional para mostrar la altura de los bosques.', 'GEDI_global_w_colorbar_0900_searchweb.png', 'GEDI_global_w_colorbar_1080p60.webm');
const night = eicVideo('5313', 'Change in Night Lights', 'This global series compares night lighting between 2012 and 2023 and zooms into several regions.', 'Esta serie mundial compara la iluminación nocturna entre 2012 y 2023 y amplía varias regiones.', 'nightlights_flat_series_and_change_wZooms_13_EIC.02599_searchweb.png', 'nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4');
const lightning = eicVideo('5011', 'Lightning from the International Space Station', 'This global visualisation shows lightning detections between 2017 and 2023.', 'Esta visualización mundial muestra detecciones de rayos entre 2017 y 2023.', 'iss_lightning_preview_searchweb.png', 'iss_lightning_sphere_07312023.mp4');
const arctic = eicVideo('5046', 'Arctic Sea Ice', 'Follow the Arctic sea ice as it expands and recedes through the seasons.', 'Sigue cómo el hielo marino del Ártico se extiende y retrocede con las estaciones.', 'arctic_sea_ice_w_dates.2023121_searchweb.png', 'arctic_sea_ice_2024_w_dates.mp4');
const antarctic = eicVideo('5064', 'Antarctic Sea Ice', 'See the seasonal changes in sea ice surrounding Antarctica.', 'Observa los cambios estacionales del hielo marino que rodea la Antártida.', 'antarctic_sea_ice_w_dates.2023121_searchweb.png', 'antarctic_sea_ice_2024_w_dates.mp4');
const rainfall = eicVideo('4897', 'Seasonal Global Precipitation', 'Compare seasonal rainfall patterns across the world using satellite precipitation data.', 'Compara los patrones estacionales de lluvia en el mundo con datos satelitales de precipitación.', 'imergvar_1080p.now_print.jpg', 'imerganomrob_w_dates_1080p15.mp4');
const currents = eicVideo('5425', 'Perpetual Ocean 2', 'Follow the Kuroshio Current, the Agulhas Current and the Gulf Stream.', 'Sigue las corrientes de Kuroshio y Agulhas y la corriente del Golfo.', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p_carousel.jpg', 'perpetual_ocean2_CLOSE_093_clean_noDate_1080p30.mp4');

export type MapPlace = {
  name: string;
  nameEs: string;
  lat: number;
  lon: number;
  videos: MapVideo[];
};

export const mapPlaces: MapPlace[] = [
  { name: 'Arctic Ocean', nameEs: 'Océano Ártico', lat: 77, lon: -28, videos: [arctic] },
  { name: 'California, United States', nameEs: 'California, Estados Unidos', lat: 40, lon: -122, videos: [dixie] },
  { name: 'Gulf Stream', nameEs: 'Corriente del Golfo', lat: 34, lon: -64, videos: [currents] },
  { name: 'Eastern Pacific', nameEs: 'Pacífico oriental', lat: 7, lon: -121, videos: [rainfall] },
  { name: 'Amazon basin', nameEs: 'Cuenca del Amazonas', lat: -5, lon: -60, videos: [forests, rainfall, lightning] },
  { name: 'Western Europe', nameEs: 'Europa occidental', lat: 49, lon: 3, videos: [night] },
  { name: 'Ukraine', nameEs: 'Ucrania', lat: 49, lon: 32, videos: [night] },
  { name: 'Eastern Mediterranean', nameEs: 'Mediterráneo oriental', lat: 34, lon: 30, videos: [night] },
  { name: 'Congo basin', nameEs: 'Cuenca del Congo', lat: -2, lon: 23, videos: [forests, lightning] },
  { name: 'Southern Africa', nameEs: 'África austral', lat: -37, lon: 27, videos: [agulhas, currents] },
  { name: 'India', nameEs: 'India', lat: 22, lon: 78, videos: [night, rainfall, lightning] },
  { name: 'Indonesia', nameEs: 'Indonesia', lat: -2, lon: 115, videos: [forests, rainfall] },
  { name: 'Japan and the Kuroshio', nameEs: 'Japón y corriente de Kuroshio', lat: 33, lon: 144, videos: [currents] },
  { name: 'Northern Australia', nameEs: 'Norte de Australia', lat: -15, lon: 137, videos: [rainfall, lightning] },
  { name: 'Antarctica', nameEs: 'Antártida', lat: -70, lon: 0, videos: [antarctic] },
];
