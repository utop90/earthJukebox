import { useRef, useState, type CSSProperties } from 'react';
import type { Language } from './LanguageSwitch';
import { mapPlaces, type MapVideo } from './mapVideos';
import Globe from './Globe';
import './world-map.css';

export default function WorldMap({ language, collectionLabel }: { language: Language; collectionLabel: string }) {
  const es = language === 'es';
  const [active, setActive] = useState<number | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const destination = selectedRegion === null ? null : mapPlaces[selectedRegion];
  const [listening, setListening] = useState<MapVideo | null>(null);
  const stopSound = useRef<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLElement>(null);
  const markers = useRef<Array<HTMLButtonElement | null>>([]);
  const place = active === null ? null : mapPlaces[active];
  const video = place?.videos[videoIndex];
  const name = (region: typeof mapPlaces[number]) => es ? region.nameEs : region.name;

  function select(index: number | null) {
    if (index === active) return;
    setActive(index);
    setVideoIndex(0);
  }

  function stopPlayback() {
    stopSound.current?.();
    stopSound.current = null;
    setLoading(false);
    setPlaying(false);
  }

  function playSound(choice: MapVideo) {
    stopPlayback();
    setFailed(false);
    setLoading(true);
    if (!window.AudioContext) {
      setLoading(false);
      setPlaying(false);
      setFailed(true);
      return;
    }
    const context = new AudioContext();
    const ready = context.resume();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(false);
      setFailed(true);
      controller.abort();
      if (context.state !== 'closed') void context.close();
    }, 20000);
    stopSound.current = () => {
      clearTimeout(timeout);
      controller.abort();
      if (context.state !== 'closed') void context.close();
    };
    void Promise.all([ready, import('./frameSound')])
      .then(([, { playFrameSound }]) => playFrameSound(choice.video, context, controller.signal, () => {
        setLoading(false);
        setPlaying(true);
      }))
      .then(() => {
        if (!controller.signal.aborted) setPlaying(false);
        if (context.state !== 'closed') void context.close();
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setPlaying(false);
          setFailed(true);
          controller.abort();
          if (context.state !== 'closed') void context.close();
        }
      }).finally(() => clearTimeout(timeout));
  }

  function closePreview() {
    if (active === null) return;
    select(null);
    markers.current[active]?.focus();
  }

  return <section className="world-explorer" aria-labelledby="world-title">
    <div className="world-heading">
      <div>
        <h1 id="world-title">{es ? 'Escucha el planeta' : 'Hear the planet'}</h1>
        <p>{es ? 'Elige un punto de nuestro planeta y escucha cómo suena.' : 'Choose a point on our planet and hear what it sounds like.'}</p>
      </div>
      <div className="world-heading-actions">
      <a className="source-nav" href="#library-heading">{collectionLabel}</a>
      <select aria-label={es ? 'Elegir un lugar' : 'Choose a place'} value={selectedRegion ?? ''} onChange={event => {
        const index = event.target.value === '' ? null : Number(event.target.value);
        select(null);
        setSelectedRegion(index);
      }}>
        <option value="">{es ? 'Elige un lugar' : 'Choose a place'}</option>
        {mapPlaces.map((region, index) => <option key={region.name} value={index}>{name(region)}</option>)}
      </select>
      </div>
    </div>
    <div className="world-stage" onKeyDown={event => {
      if (event.key !== 'Escape' || dialog.current?.open) return;
      closePreview();
    }}>
      <Globe spanish={es} destination={destination}>{project => {
        const [x, y, depth] = place ? project(place.lon, place.lat) : [0, 0, -1];
        const anchorX = 50 + 47 * x;
        const anchorY = 50 + 47 * y;
        const showPreview = depth > 0 && Math.max(Math.abs(x), Math.abs(y)) <= 50 / 47;
        return <>{mapPlaces.map((region, index) => {
        const [x, y, depth] = project(region.lon, region.lat);
        if (depth <= 0 || Math.max(Math.abs(x), Math.abs(y)) > 50 / 47) return null;
        return <button type="button" className="world-marker" key={region.name}
          ref={element => { markers.current[index] = element; }}
          style={{ left: 50 + 47 * x + '%', top: 50 + 47 * y + '%', zIndex: Math.round(depth * 100) }}
          aria-label={name(region)} aria-expanded={index === active} aria-controls={index === active ? 'map-preview' : undefined}
          onClick={event => {
            select(index);
            if (event.detail === 0) requestAnimationFrame(() => preview.current?.focus());
          }}>
          <span />
        </button>;
      })}
      {place && video && showPreview && <article className="world-preview" id="map-preview" ref={preview} tabIndex={-1}
        style={{ '--point-x': `${anchorX}%`, '--point-y': `${anchorY}%` } as CSSProperties}
        data-side={anchorX > 50 ? 'left' : 'right'}>
        <button type="button" className="world-close" aria-label={es ? 'Cerrar ficha' : 'Close preview'} onClick={closePreview}>×</button>
        <img key={video.id} src={video.image} alt="" decoding="async" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
        <div className="world-preview-body">
          <p className="world-place">{name(place)}</p>
          <h2>{video.title}</h2>
          <p>{es ? video.descriptionEs : video.description}</p>
          {place.videos.length > 1 && <select aria-label={es ? 'Elegir vídeo' : 'Choose a video'} value={videoIndex} onChange={event => setVideoIndex(Number(event.target.value))}>
            {place.videos.map((item, index) => <option value={index} key={item.id}>{item.title}</option>)}
          </select>}
          <button type="button" className="world-listen" onClick={() => {
            setListening(video);
            dialog.current?.showModal();
            playSound(video);
          }}>{es ? 'Escuchar' : 'Listen'}</button>
        </div>
      </article>}
      </>;
      }}</Globe>
    </div>
    <dialog className="world-audio" ref={dialog} aria-labelledby="world-audio-title" onClose={() => {
      stopPlayback();
      setListening(null);
    }}>
      {listening && <>
        <button type="button" className="world-close" aria-label={es ? 'Cerrar y detener' : 'Close and stop'} onClick={() => dialog.current?.close()}>×</button>
        <h2 id="world-audio-title">{listening.title}</h2>
        <video className="world-video" src={listening.video} poster={listening.image}
          aria-label={listening.title} controls playsInline muted autoPlay />
        <section className="world-sound-player" aria-labelledby="world-sound-title">
          <h3 id="world-sound-title">{es ? 'Sonificación' : 'Sonification'}</h3>
          <button type="button" className="world-listen" onClick={() => {
            if (playing || loading) stopPlayback();
            else playSound(listening);
          }}>{playing || loading ? (es ? 'Detener sonido' : 'Stop sound') : (es ? 'Reproducir sonido' : 'Play sound')}</button>
          {loading && <p role="status">{es ? 'Preparando el sonido…' : 'Preparing the sound…'}</p>}
          {!failed && <p>{es ? 'Los píxeles más brillantes producen notas más agudas.' : 'Brighter pixels produce higher notes.'}</p>}
          {failed && <p role="alert">{es ? 'No se pudo leer el vídeo para generar el sonido.' : 'The video could not be read to generate sound.'}</p>}
        </section>
      </>}
    </dialog>
  </section>;
}
