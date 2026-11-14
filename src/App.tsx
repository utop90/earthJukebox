import { useEffect, useMemo, useState } from 'react';
import LanguageSwitch, { type Language } from './LanguageSwitch';

type Video = { tags?: string[]; id: string; title: string; category: string; description: string; pageUrl: string; credit: string; videoUrl: string; posterUrl: string; resolution: string; sizeLabel: string; publishedAt: string; updatedAt: string; updatesDaily: boolean };
type Catalog = { schemaVersion: number; checkedAt: string; importMode: string; videos: Video[] };
const playbackStorageKey = 'earth-jukebox-play-counts';
const sortOptions = ['Release date', 'Update date', 'Popularity (this browser)'] as const;
type SortOption = typeof sortOptions[number];

function readPlayCounts(): Record<string, number> {
  
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(playbackStorageKey) ?? '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return Object.fromEntries(Object.entries(stored).filter(([id, count]) =>
        /^\d+$/.test(id) && Number.isSafeInteger(count) && count > 0
      ));
    }
  } catch { /* Playback still works when browser storage is unavailable. */ }
  return {};
}

function matchesCategory(video: Video, category: string) {
  return video.category === category || video.tags?.includes(category);
}

const formatDate = (date: string, language: Language) => new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
const isMediaSourceUrl = (value: unknown) => {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'svs.gsfc.nasa.gov'; } catch { return false; }
};
function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== 'object') return false;
  const data = value as Catalog;
  return data.schemaVersion === 1 && typeof data.checkedAt === 'string' &&
    Array.isArray(data.videos) && data.videos.length > 0 &&
    new Set(data.videos.map(v => v?.id)).size === data.videos.length &&
    data.videos.every(v => v && ['id', 'title', 'category', 'description', 'credit', 'resolution', 'sizeLabel', 'publishedAt', 'updatedAt'].every(k => typeof v[k as keyof Video] === 'string') &&
      (v.tags === undefined || (Array.isArray(v.tags) && v.tags.every(tag => typeof tag === 'string'))) &&
      Number.isFinite(Date.parse(v.publishedAt)) && Number.isFinite(Date.parse(v.updatedAt)) && typeof v.updatesDaily === 'boolean' && isMediaSourceUrl(v.pageUrl) && isMediaSourceUrl(v.videoUrl) && isMediaSourceUrl(v.posterUrl));
}
function Player({ video, language, onFirstPlay }: { video: Video; language: Language; onFirstPlay: () => void }) {
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  return <div className="player">
    {!failed ? <video controls playsInline preload="none" poster={video.posterUrl}
      aria-label={video.title} onPlay={() => { if (!started) { setStarted(true); onFirstPlay(); } }} onError={() => setFailed(true)}>
      <source src={video.videoUrl} type="video/mp4" />
      {language === 'es' ? 'Tu navegador no puede reproducir este vídeo.' : 'Your browser cannot play this video.'}
    </video> : <div className="video-error" role="alert"><span>{language === 'es' ? 'Vídeo no disponible' : 'Video unavailable'}</span><p>{language === 'es' ? 'Comprueba tu conexión o abre el vídeo original.' : 'Check your connection or open the original video.'}</p><a href={video.videoUrl} target="_blank" rel="noreferrer">{language === 'es' ? 'Abrir vídeo original' : 'Open original video'} ↗</a><button onClick={() => setFailed(false)}>{language === 'es' ? 'Reintentar' : 'Retry'}</button></div>}
    {!started && !failed && <span className="player-caption">{language === 'es' ? 'Pulsa reproducir para explorar' : 'Press play to explore'}</span>}
  </div>;
}

const appCopy = {
  en: {
    edition: 'ONE PLANET. MANY PERSPECTIVES.',
    exploreCollection: 'Explore the collection',
    eyebrow: 'EARTH OBSERVATORY',
    headline: 'A new way to',
    headlineEmphasis: 'see our planet.',
    intro: 'See how ocean temperatures and colours vary, then take a journey from Earth to the outer planets.',
    stamp: <>VISUALISATIONS<br />TO EXPLORE</>,
    loadError: 'The collection could not be loaded. Check your connection and try again.',
    reload: 'Reload',
    loading: 'Loading visualisations…',
    selectedVisualisation: 'Selected visualisation',
    resolution: 'RESOLUTION',
    originalFile: 'ORIGINAL FILE',
    viewOriginalSource: 'View the original source',
    published: 'Published',
    sourceUpdated: 'Source page updated',
    updatedDaily: 'This video is updated daily',
    phaseNote: <>First stage · Visual exploration<br />Sonification is planned for the next stage.</>,
    collection: 'Visualisation collection',
    searchLabel: 'Search visualisations',
    searchPlaceholder: 'Search the collection…',
    category: 'Category',
    allCategories: 'All categories',
    sortBy: 'Sort by',
    sortLabels: {
      'Release date': 'Release date',
      'Update date': 'Update date',
      'Popularity (this browser)': 'Popularity (this browser)',
    },
    foundOne: 'visualisation',
    foundMany: 'visualisations',
    selected: 'SELECTED',
    updated: 'Updated',
    noMatches: 'No videos match your search.',
    showAll: 'Show all',
    footer: 'A multisensory exploration of Earth',
  },
  es: {
    edition: 'UN PLANETA. MUCHAS PERSPECTIVAS.',
    exploreCollection: 'Explorar la colección',
    eyebrow: 'OBSERVATORIO DE LA TIERRA',
    headline: 'Una nueva forma de',
    headlineEmphasis: 'ver nuestro planeta.',
    intro: 'Descubre cómo varían las temperaturas y los colores del océano, y emprende un viaje desde la Tierra hasta los planetas exteriores.',
    stamp: <>VISUALIZACIONES<br />POR EXPLORAR</>,
    loadError: 'No se pudo cargar la colección. Comprueba tu conexión e inténtalo de nuevo.',
    reload: 'Recargar',
    loading: 'Cargando visualizaciones…',
    selectedVisualisation: 'Visualización seleccionada',
    resolution: 'RESOLUCIÓN',
    originalFile: 'ARCHIVO ORIGINAL',
    viewOriginalSource: 'Ver la fuente original',
    published: 'Publicado',
    sourceUpdated: 'Página de origen actualizada',
    updatedDaily: 'Este vídeo se actualiza a diario',
    phaseNote: <>Primera etapa · Exploración visual<br />La sonificación está prevista para la siguiente etapa.</>,
    collection: 'Colección de visualizaciones',
    searchLabel: 'Buscar visualizaciones',
    searchPlaceholder: 'Buscar en la colección…',
    category: 'Categoría',
    allCategories: 'Todas las categorías',
    sortBy: 'Ordenar por',
    sortLabels: {
      'Release date': 'Fecha de publicación',
      'Update date': 'Fecha de actualización',
      'Popularity (this browser)': 'Popularidad (este navegador)',
    },
    foundOne: 'visualización',
    foundMany: 'visualizaciones',
    selected: 'SELECCIONADO',
    updated: 'Actualizado',
    noMatches: 'Ningún vídeo coincide con la búsqueda.',
    showAll: 'Mostrar todos',
    footer: 'Una exploración multisensorial de la Tierra',
  },
} as const;

export default function App({ language, onLanguageChange }: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const copy = appCopy[language];
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('Release date');
  const [playCounts, setPlayCounts] = useState(readPlayCounts);
  useEffect(() => {
    try {
      localStorage.setItem(playbackStorageKey, JSON.stringify(playCounts));
    } catch { /* The current session can still sort by playback count. */ }
  }, [playCounts]);
  useEffect(() => {
    const controller = new AbortController();
    setLoadError('');
    fetch('./catalog-recent.json', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Could not load the catalogue.'); return r.json(); })
      .then(data => { if (!isCatalog(data)) throw new Error('The catalogue format is invalid.'); data.videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id)); setCatalog(data); setSelectedId(data.videos[0].id); })
      .catch(e => {
        if (e.name !== 'AbortError') {
          setLoadError('error');
        }
      });
    return () => controller.abort();
  }, [attempt]);
  const videos = catalog?.videos ?? [];
  const categories = [...new Set(videos.flatMap(v => [v.category, ...(v.tags ?? [])]))].sort((a, b) => a.localeCompare(b, language === 'es' ? 'es' : 'en'));
  const selected = videos.find(v => v.id === selectedId);
  const visible = useMemo(() => videos.filter(v =>
    (category === 'All' || matchesCategory(v, category)) &&
    [v.title, v.description, v.category, ...(v.tags ?? [])].join(' ').toLocaleLowerCase('en').includes(query.trim().toLocaleLowerCase('en'))
  ).sort((a, b) => {
    if (sort === 'Popularity (this browser)') {
      const difference = (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0);
      if (difference) return difference;
    }
    if (sort === 'Update date') {
      const difference = b.updatedAt.localeCompare(a.updatedAt);
      if (difference) return difference;
    }
    return b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id);
  }), [videos, category, query, sort, playCounts]);
  return <div className="app">
    <header className="topbar"><a className="brand" href="./"><span className="brand-icon" aria-hidden="true">◎</span> EARTH JUKEBOX</a><span className="edition">{copy.edition}</span><div className="topbar-actions"><a className="source-nav" href="#library-heading">{copy.exploreCollection}</a><LanguageSwitch language={language} onChange={onLanguageChange} /></div></header>
    <main>
      <section className="intro"><div><p className="eyebrow"><span /> {copy.eyebrow}</p><h1>{copy.headline}<br /><em>{copy.headlineEmphasis}</em></h1><p className="intro-copy">{copy.intro}</p></div><div className="collection-stamp"><strong>{String(videos.length).padStart(2, '0')}</strong><span>{copy.stamp}</span></div></section>
      {loadError ? <div className="notice" role="alert"><p>{copy.loadError}</p><button onClick={() => setAttempt(attempt + 1)}>{copy.reload}</button></div> : !selected ? <p role="status" className="notice">{copy.loading}</p> : <>
      <section className="feature" aria-label={copy.selectedVisualisation}>
        <Player key={selected.id} video={selected} language={language} onFirstPlay={() =>
          setPlayCounts(counts => ({ ...counts, [selected.id]: (counts[selected.id] ?? 0) + 1 }))
        } />
        <aside className="feature-info"><p className="eyebrow">{selected.category}</p><h2>{selected.title}</h2><p className="description">{selected.description}</p><div className="facts"><span>{copy.resolution}<strong>{selected.resolution}</strong></span><span>{copy.originalFile}<strong>{selected.sizeLabel}</strong></span></div><a className="primary-link" href={selected.pageUrl} target="_blank" rel="noreferrer">{copy.viewOriginalSource} <span>↗</span></a><p className="publication">{copy.published} {formatDate(selected.publishedAt, language)}<br />{copy.sourceUpdated} {formatDate(selected.updatedAt, language)}{selected.updatesDaily && <><br />{copy.updatedDaily}</>}</p><p className="credit">{selected.credit}</p><p className="phase-note">{copy.phaseNote}</p></aside>
      </section>
      <section className="library" aria-labelledby="library-heading"><div className="library-top"><div><h2 id="library-heading">{copy.collection} <span>{String(videos.length).padStart(2, '0')}</span></h2></div><label className="search"><span aria-hidden="true">⌕</span><input aria-label={copy.searchLabel} placeholder={copy.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} /></label></div>
        <div className="catalogue-controls">
          <label>{copy.category}
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">{copy.allCategories} ({videos.length})</option>
              {categories.map(c => <option key={c} value={c}>{c} ({videos.filter(v => matchesCategory(v, c)).length})</option>)}
            </select>
          </label>
          <label>{copy.sortBy}
            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}>
              {sortOptions.map(option => <option key={option} value={option}>{copy.sortLabels[option]}</option>)}
            </select>
          </label>
        </div>
        <p className="sr-only" role="status">{visible.length} {visible.length === 1 ? copy.foundOne : copy.foundMany} {language === 'es' ? visible.length === 1 ? 'encontrada' : 'encontradas' : 'found'}</p>
        <div className="grid">{visible.map((video, index) => <button key={video.id} className={'card ' + (selectedId === video.id ? 'selected' : '')} aria-pressed={selectedId === video.id} onClick={() => setSelectedId(video.id)} aria-label={`${language === 'es' ? 'Seleccionar' : 'Select'} ${video.title}`}>
          <div className="thumbnail"><img src={video.posterUrl} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /><span className="card-index">{String(index + 1).padStart(2, '0')}</span><span className="card-play" aria-hidden="true">▷</span><span className="card-quality">{video.resolution}</span></div><div className="card-body"><p>{video.category}<span>{selectedId === video.id ? copy.selected : ''}</span></p><h3>{video.title}</h3><p className="publication">{sort === 'Update date' ? `${copy.updated} ${formatDate(video.updatedAt, language)}` : `${copy.published} ${formatDate(video.publishedAt, language)}`}</p></div></button>)}</div>
        {visible.length === 0 && <div className="notice"><p>{copy.noMatches}</p><button onClick={() => { setQuery(''); setCategory('All'); }}>{copy.showAll}</button></div>}
      </section></>}
      <footer><span>EARTH JUKEBOX <span className="footer-dot">/</span> {copy.footer}</span></footer>
    </main>
  </div>;
}
