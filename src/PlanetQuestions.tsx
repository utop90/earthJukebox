import type { Language } from './LanguageSwitch';
import { localize, nasaVideo, type VideoCard } from './exploreVideos';
import './planet-questions.css';

const level = nasaVideo('5516', 'a000000/a005500/a005516', 'seaLevelRise_2024_English.mp4', 'seaLevelRise_2024.jpg');

const tracks = [
  {
    ...level,
    spanishSrc: level.src.replace('English', 'Spanish'),
    spanishPoster: level.poster.replace('.jpg', '_Spanish.jpg'),
    area: localize('Nivel del mar', 'Sea level'),
    title: localize('¿Cuánto ha subido el nivel del mar?', 'How much has the ocean risen?'),
    detail: localize('Nivel medio global · 1993–2024', 'Global mean sea level · 1993–2024'),
  },
  {
    ...nasaVideo('5631', 'a000000/a005600/a005631', 'CanadianWildfires2023_SmokeIntensity_short_1920x1080.mp4', 'CanadianWildfires2023_SmokeIntensity_short_1920x1080.png'),
    area: localize('Calidad del aire', 'Air quality'),
    title: localize('¿Hasta dónde viajó el humo de los incendios de Canadá?', 'How far did smoke from the Canadian wildfires travel?'),
    detail: localize('Norteamérica · 6–10 de junio de 2023', 'North America · 6–10 June 2023'),
  },
  {
    ...nasaVideo('31053', 'a030000/a031000/a031053', 'CMG_0_05_Deg_Monthly_NDVI_1080p.mp4', 'CMG_0_05_Deg_Monthly_NDVI_searchweb.png'),
    area: localize('Biodiversidad', 'Biodiversity'),
    title: localize('¿Cómo cambia el verdor de la vegetación en el mundo?', 'How does vegetation greenness change around the world?'),
    detail: localize('Índice de vegetación Terra MODIS · desde febrero de 2000', 'Terra MODIS vegetation index · from February 2000'),
  },
  {
    ...nasaVideo('4993', 'a000000/a004900/a004993', 'Dixie_fire_2021_p30_1080p30.mp4', 'Dixie_fire_2021.7135_searchweb.png'),
    area: localize('Incendios forestales', 'Wildfires'),
    title: localize('¿Cómo se extendió el incendio Dixie?', 'How did the Dixie Fire spread?'),
    detail: localize('California · 14 de julio–22 de octubre de 2021', 'California · 14 July–22 October 2021'),
  },
  {
    ...nasaVideo('5024', 'a000000/a005000/a005024', 'co2airs_60South_1920x1080p30.mp4', 'co2airs_60South_1920x108030p.0794_print.jpg'),
    area: localize('Gases de efecto invernadero', 'Greenhouse gases'),
    title: localize('¿Cómo ha cambiado el CO₂ atmosférico?', 'How has atmospheric CO₂ changed?'),
    detail: localize('CO₂ atmosférico global · septiembre de 2002–octubre de 2022', 'Global atmospheric CO₂ · September 2002–October 2022'),
  },
  {
    ...nasaVideo('5313', 'a000000/a005300/a005313', 'nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4', 'nightlights_flat_series_and_change_wZooms_13_EIC.02599_searchweb.png'),
    fallbackSrc: nasaVideo('5475', 'a000000/a005400/a005475', 'nightlights_2012-2024_KSC_SOS_04_plus2_4096x2048_30p_h264.mp4', '').src,
    area: localize('Energía', 'Energy'),
    title: localize('¿Dónde se ilumina más el mundo de noche?', 'Where is the world getting brighter at night?'),
    detail: localize('Luces nocturnas · 2012–2023', 'Nighttime lights · 2012–2023'),
  },
  {
    ...nasaVideo('2893', 'a000000/a002800/a002893', 'eqmollweide_1080p30.mp4', 'earthquakes_pre.jpg'),
    area: localize('Desastres', 'Disasters'),
    title: localize('¿Dónde se concentran los terremotos?', 'Where do earthquakes cluster?'),
    detail: localize('Terremotos acumulados en el mundo · 1980–1995', 'Cumulative global earthquakes · 1980–1995'),
  },
  {
    ...nasaVideo('31178', 'a030000/a031100/a031178', 'GRACE_GLOBAL_7D_RTZSM_030_1080p10.webm', 'GRACE_GLOBAL_7D_RTZSM_030_20251124.png'),
    fallbackSrc: nasaVideo('31178', 'a030000/a031100/a031178', 'GRACE_GLOBAL_7D_RTZSM_030_1080p10.mp4', '').src,
    area: localize('Recursos hídricos', 'Water resources'),
    title: localize('¿Dónde cambia la humedad del suelo?', 'Where does soil moisture change?'),
    detail: localize('Humedad en la zona de las raíces · 2003–2021', 'Root zone soil moisture · 2003–2021'),
  },
  {
    ...nasaVideo('15025', 'a010000/a015000/a015025', 'Saudi_Arabia_Crops_-_Web.mp4', 'SaudiArabia_SearchWeb.jpg'),
    area: localize('Agricultura', 'Agriculture'),
    title: localize('¿Cómo cambian los cultivos del desierto a lo largo del año?', 'How do desert crops change through the year?'),
    detail: localize('Arabia Saudí · enero de 2024–enero de 2025', 'Saudi Arabia · January 2024–January 2025'),
  },
];

export default function PlanetQuestions({ language, onSelect }: { language: Language; onSelect: (track: VideoCard) => void }) {
  return <>
    <div className="planet-tracks">
      {tracks.map((track, index) => <button key={track.id} type="button" className="planet-track" aria-haspopup="dialog" onClick={() => onSelect(track)}>
        <img className="planet-track-poster" src={(language === 'es' && track.spanishPoster) || track.poster}
          alt="" decoding="async" loading={index < 3 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} />
        <span className="planet-track-copy">
          <span className="planet-area">{track.area[language]}</span>
          <strong className="planet-question">{track.title[language]}</strong>
          <span className="planet-period">{track.detail[language]}</span>
        </span>
        <span className="planet-track-play" aria-hidden="true">▶</span>
      </button>)}
    </div>
  </>;
}
