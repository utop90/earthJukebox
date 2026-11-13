import { useEffect, useMemo, useState } from 'react';

type Video = { id: string; title: string; category: string; description: string; pageUrl: string; credit: string; videoUrl: string; posterUrl: string; resolution: string; sizeLabel: string; publishedAt: string; updatedAt: string; updatesDaily: boolean };
type Catalog = { schemaVersion: number; checkedAt: string; importMode: string; videos: Video[] };
const formatDate = (date: string) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
const nasaUrl = (value: unknown) => {
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
      Number.isFinite(Date.parse(v.publishedAt)) && Number.isFinite(Date.parse(v.updatedAt)) && typeof v.updatesDaily === 'boolean' && nasaUrl(v.pageUrl) && nasaUrl(v.videoUrl) && nasaUrl(v.posterUrl));
}
function Player({ video }: { video: Video }) {
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  return <div className="player">
    {!failed ? <video controls playsInline preload="none" poster={video.posterUrl}
      aria-label={video.title} onPlay={() => setStarted(true)} onError={() => setFailed(true)}>
      <source src={video.videoUrl} type="video/mp4" />
      Tu navegador no puede reproducir este vídeo.
    </video> : <div className="video-error" role="alert"><span>Vídeo no disponible</span><p>No se ha podido cargar desde NASA. Comprueba la conexión o abre el archivo original.</p><a href={video.videoUrl} target="_blank" rel="noreferrer">Abrir vídeo en NASA ↗</a><button onClick={() => setFailed(false)}>Reintentar</button></div>}
    {!started && !failed && <span className="player-caption">Pulsa reproducir para explorar</span>}
  </div>;
}
export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  useEffect(() => {
    const controller = new AbortController();
    setLoadError('');
    fetch('./catalog-recent.json', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('No se pudo descargar el catálogo.'); return r.json(); })
      .then(data => { if (!isCatalog(data)) throw new Error('El catálogo no tiene un formato válido.'); data.videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id)); setCatalog(data); setSelectedId(data.videos[0].id); })
      .catch(e => { if (e.name !== 'AbortError') setLoadError(e.message); });
    return () => controller.abort();
  }, [attempt]);
  const videos = catalog?.videos ?? [];
  const categories = ['Todos', ...new Set(videos.map(v => v.category))];
  const selected = videos.find(v => v.id === selectedId);
  const visible = useMemo(() => videos.filter(v =>
    (category === 'Todos' || v.category === category) &&
    (v.title + ' ' + v.description).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))
  ), [videos, category, query]);
  return <div className="app">
    <header className="topbar"><a className="brand" href="./"><span className="brand-icon" aria-hidden="true">◎</span> EARTH JUKEBOX</a><span className="edition">UN PLANETA. MUCHAS PERSPECTIVAS.</span><a className="source-nav" href="https://svs.gsfc.nasa.gov/gallery/earth-information-center/" target="_blank" rel="noreferrer">Explorar NASA EIC ↗</a></header>
    <main>
      <section className="intro"><div><p className="eyebrow"><span /> OBSERVATORIO DE LA TIERRA</p><h1>Una nueva forma de<br /><em>mirar nuestro planeta.</em></h1><p className="intro-copy">Nuevas perspectivas del océano y de nuestro lugar en el sistema solar.<br className="desktop-break" /> Descubre la Tierra a través de las visualizaciones de NASA.</p></div><div className="collection-stamp"><strong>{String(videos.length).padStart(2, '0')}</strong><span>VISUALIZACIONES<br />PARA EXPLORAR</span></div></section>
      {loadError ? <div className="notice" role="alert"><p>{loadError}</p><button onClick={() => setAttempt(attempt + 1)}>Volver a cargar</button></div> : !selected ? <p role="status" className="notice">Cargando las visualizaciones…</p> : <>
      <section className="feature" aria-label="Visualización seleccionada">
        <Player key={selected.id} video={selected} />
        <aside className="feature-info"><p className="eyebrow">{selected.category} / NASA SVS {selected.id}</p><h2>{selected.title}</h2><p className="description">{selected.description}</p><div className="facts"><span>RESOLUCIÓN<strong>{selected.resolution}</strong></span><span>ARCHIVO ORIGINAL<strong>{selected.sizeLabel}</strong></span></div><a className="primary-link" href={selected.pageUrl} target="_blank" rel="noreferrer">Ver historia y fuente original <span>↗</span></a><p className="publication">Publicado el {formatDate(selected.publishedAt)}<br />Ficha actualizada: {formatDate(selected.updatedAt)}{selected.updatesDaily && <><br />NASA renueva este vídeo diariamente</>}</p><p className="credit">{selected.credit}</p><p className="phase-note">Primera etapa · Exploración visual<br />La sonificación se incorporará en la siguiente etapa.</p></aside>
      </section>
      <section className="library" aria-labelledby="library-heading"><div className="library-top"><div><p className="eyebrow">PUBLICACIONES RECIENTES DEL EIC</p><h2 id="library-heading">Colección EIC <span>{String(videos.length).padStart(2, '0')}</span></h2></div><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Buscar visualizaciones" placeholder="Buscar en la colección…" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
        <div className="filters" aria-label="Filtrar por tema">{categories.map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <p className="sr-only" role="status">{visible.length} visualizaciones encontradas</p>
        <div className="grid">{visible.map((video, index) => <button key={video.id} className={'card ' + (selectedId === video.id ? 'selected' : '')} aria-pressed={selectedId === video.id} onClick={() => setSelectedId(video.id)} aria-label={'Seleccionar ' + video.title}>
          <div className="thumbnail"><img src={video.posterUrl} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /><span className="card-index">{String(index + 1).padStart(2, '0')}</span><span className="card-play" aria-hidden="true">▷</span><span className="card-quality">{video.resolution}</span></div><div className="card-body"><p>{video.category}<span>{selectedId === video.id ? 'SELECCIONADO' : 'NASA EIC'}</span></p><h3>{video.title}</h3><p className="publication">Publicado: {formatDate(video.publishedAt)}</p></div></button>)}</div>
        {visible.length === 0 && <div className="notice"><p>No hay vídeos que coincidan con tu búsqueda.</p><button onClick={() => { setQuery(''); setCategory('Todos'); }}>Mostrar todos</button></div>}
      </section></>}
      <footer><span>EARTH JUKEBOX <span className="footer-dot">/</span> Una exploración multisensorial de la Tierra</span><span>Material de NASA's Scientific Visualization Studio</span></footer>
    </main>
  </div>;
}

