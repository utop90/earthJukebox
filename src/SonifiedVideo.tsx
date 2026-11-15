import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { Language } from './LanguageSwitch';
import mediaSources from '../public/media-sources.json';

const localMedia = new Map(mediaSources.items.map(item => [item.source, item.path]));

type Props = ComponentProps<'video'> & { videoId: string; language: Language };

export default function SonifiedVideo({ videoId: _videoId, language, src, onPlay, onPause, onError, ...props }: Props) {
  const localPath = src ? localMedia.get(src) : undefined;
  const playbackSrc = localPath ? import.meta.env.BASE_URL + localPath + "?audio=v1" : src;
  const video = useRef<HTMLVideoElement>(null);
  const playRequest = useRef(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playError, setPlayError] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [loading, setLoading] = useState(false);
  const player = useRef<HTMLDivElement>(null);
  const es = language === 'es';
  const time = (value: number) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`;

  function togglePlayback() {
    const element = video.current;
    if (!element) return;
    if (!element.paused) { playRequest.current++; element.pause(); return; }
    setPlayError(false);
    if (element.error) { setMediaError(false); element.load(); }
    void startPlayback(element);
  }

  async function startPlayback(element: HTMLVideoElement) {
    const request = ++playRequest.current;

    setPlayError(false);
    try {
      element.muted = false;
      element.volume = 1;
      if (request !== playRequest.current || video.current !== element) return;
      await element.play();
    } catch (cause) {
      if (request !== playRequest.current) return;
      element.pause();
      // Browsers may require a direct click on Play for audible playback.
      setPlayError(!(cause instanceof DOMException && cause.name === 'NotAllowedError'));
    }
  }

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === player.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  useEffect(() => {
    setMediaError(false);
    setPlayError(false);
    // Opening a card is the user's playback gesture. A blocked autoplay
    // leaves the explicit play control available, never silent playback.
    const timer = window.setTimeout(() => {
      if (video.current) void startPlayback(video.current);
    }, 0);
    return () => { window.clearTimeout(timer); playRequest.current++; };
  }, [src]);

  return <div className="sonified-player" ref={player}>
    <button type="button" className="sonification-fullscreen"
      aria-label={fullscreen ? (es ? 'Salir de pantalla completa' : 'Exit full screen') : (es ? 'Pantalla completa' : 'Full screen')}
      title={es ? 'Pantalla completa' : 'Full screen'} onClick={() => {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        else void player.current?.requestFullscreen?.().catch(() => {});
      }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d={fullscreen ? 'M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5' : 'M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5'} />
      </svg>
    </button>
    <video {...props} autoPlay={false} controls={false} ref={video} crossOrigin="anonymous" src={playbackSrc} muted={false} playsInline
      onLoadStart={event => { setLoading(true); props.onLoadStart?.(event); }}
      onCanPlay={event => { setLoading(false); props.onCanPlay?.(event); }}
      onWaiting={event => { setLoading(true); props.onWaiting?.(event); }}
      onPlaying={event => { setLoading(false); props.onPlaying?.(event); }}
      onClick={togglePlayback}
      onTimeUpdate={event => { setPosition(event.currentTarget.currentTime); props.onTimeUpdate?.(event); }}
      onLoadedMetadata={event => {
        setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
        props.onLoadedMetadata?.(event);
      }}
      onEnded={event => { setPlaying(false); props.onEnded?.(event); }}
      onError={event => { setLoading(false); setPlaying(false); setMediaError(true); onError?.(event); }}
      onPlay={event => { setPlaying(true); onPlay?.(event); }}
      onPause={event => { setPlaying(false); onPause?.(event); }} />
    <div className="sonification-controls">
      <button type="button" className="sonification-play" onClick={togglePlayback}>
        {playing ? (es ? 'Pausar' : 'Pause') : (es ? 'Reproducir con sonido' : 'Play with sound')}
      </button>
      <input className="sonification-seek" type="range" min="0" max={duration || 0} step="0.1"
        aria-label={es ? 'Posición del vídeo' : 'Video position'} disabled={!duration}
        value={Math.min(position, duration)} onChange={event => {
          if (video.current) { video.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); }
        }} />
      <span className="sonification-time">{time(position)} / {time(duration)}</span>
      {loading && !mediaError && <p role="status">{es ? 'Cargando vídeo…' : 'Loading video…'}</p>}
      {(playError || mediaError) && <p role="alert">{es ? 'No se pudo cargar el vídeo. Comprueba la conexión y vuelve a intentarlo.' : 'Could not load the video. Check your connection and try again.'}</p>}
    </div>
  </div>;
}
