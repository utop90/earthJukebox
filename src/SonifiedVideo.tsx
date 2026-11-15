import { useEffect, useRef, useState, type ComponentProps } from 'react';
import type { Language } from './LanguageSwitch';
import mediaSources from '../public/media-sources.json';

const localMedia = new Map(mediaSources.items.map(item => [item.source, item.path]));

const notes = [48, 50, 52, 55, 57, 60, 62, 64];
const linear = Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
});
const profiles: Record<string, [OscillatorType, number]> = {
  '4950': ['triangle', 0], '4993': ['triangle', -12],
  '5425': ['sine', 0], '5505': ['sine', 0],
  '5382': ['sine', 12], '5046': ['sine', 12], '5064': ['sine', 12],
  '5148': ['sine', -12], '5011': ['triangle', 12],
  '5207': ['triangle', 0], '5190': ['sine', 0], '5516': ['sine', -12],
  '5631': ['sine', -12], '31053': ['triangle', 0], '5024': ['sine', -12],
  '5313': ['sine', 12], '5475': ['sine', 12], '2893': ['triangle', -24],
  '31178': ['sine', 12], '15025': ['triangle', 0], '4897': ['sine', 12],
};

type Props = ComponentProps<'video'> & { videoId: string; language: Language };

export default function SonifiedVideo({ videoId, language, src, onPlay, onPause, onError, ...props }: Props) {
  const localPath = src ? localMedia.get(src) : undefined;
  const playbackSrc = localPath ? import.meta.env.BASE_URL + localPath : src;
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const stop = useRef(() => {});
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(.35);
  const [error, setError] = useState(false);
  const [silentFallback, setSilentFallback] = useState(false);
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
    if (!element.paused) { element.pause(); return; }
    setPlayError(false);
    if (element.error) { setMediaError(false); element.load(); }
    // Start both APIs in the click gesture, before awaiting either promise.
    if (enabled) void enableAudio();
    void element.play().catch(() => setPlayError(true));
  }

  async function enableAudio() {
    try {
      if (!audio.current || audio.current.state === 'closed') {
        audio.current = new AudioContext();
        gain.current = audio.current.createGain();
        gain.current.gain.value = enabled ? volume : 0;
        gain.current.connect(audio.current.destination);
      }
      const context = audio.current;
      await context.resume();
    } catch { setError(true); }
  }

  useEffect(() => {
    if (gain.current && audio.current) gain.current.gain.setTargetAtTime(enabled ? volume : 0, audio.current.currentTime, .02);
  }, [volume, enabled]);

  useEffect(() => {
    const element = video.current!;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 72;
    const pixels = canvas.getContext('2d', { willReadFrequently: true });
    const voices = new Set<OscillatorNode>();
    let frame = 0;
    let lastTime = -Infinity;
    let blocked = false;
    setError(false);
    setPlaying(!element.paused && !element.ended);
    setPosition(element.currentTime || 0);
    setDuration(Number.isFinite(element.duration) ? element.duration : 0);
    const silence = () => {
      for (const voice of voices) { voice.stop(); voice.disconnect(); }
      voices.clear();
      lastTime = -Infinity;
    };
    stop.current = silence;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const context = audio.current;
      if (!enabled || silentFallback || blocked || element.paused || element.ended || element.seeking || element.readyState < 3 ||
        document.hidden || !context || context.state !== 'running' || !pixels || !gain.current) return;
      if (Math.abs(element.currentTime - lastTime) < .25) return;
      lastTime = element.currentTime;
      try {
        const w = element.videoWidth;
        const h = element.videoHeight;
        if (!w || !h) return;
        canvas.height = Math.max(8, Math.round(128 * h / w));
        pixels.drawImage(element, w * .15, h * .15, w * .7, h * .7, 0, 0, 128, canvas.height);
        const data = pixels.getImageData(0, 0, 128, canvas.height).data;
        const column = Math.floor(element.currentTime * 4) % 8;
        let bright = 0;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = column * 16; x < (column + 1) * 16; x++) {
            const i = (y * 128 + x) * 4;
            if (.2126 * linear[data[i]] + .7152 * linear[data[i + 1]] + .0722 * linear[data[i + 2]] >= .2) bright++;
          }
        }
        const [wave, transpose] = profiles[videoId] ?? ['sine', 0];
        const midi = notes[Math.round(7 * bright / (16 * canvas.height))] + transpose;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = wave;
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        const now = context.currentTime;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(.18, now + .025);
        envelope.gain.exponentialRampToValueAtTime(.001, now + .2);
        oscillator.connect(envelope).connect(gain.current);
        voices.add(oscillator);
        oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start();
        oscillator.stop(now + .22);
      } catch { blocked = true; silence(); setError(true); }
    };
    const hide = () => { if (document.hidden) { element.pause(); silence(); } };
    const events = ['pause', 'seeking', 'waiting', 'ended', 'error', 'ratechange'];
    events.forEach(name => element.addEventListener(name, silence));
    document.addEventListener('visibilitychange', hide);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      silence();
      events.forEach(name => element.removeEventListener(name, silence));
      document.removeEventListener('visibilitychange', hide);
    };
  }, [src, videoId, enabled, silentFallback]);

  useEffect(() => {
    setMediaError(false);
    setPlayError(false);
  }, [src]);

  useEffect(() => () => {
    stop.current();
    const context = audio.current;
    audio.current = null;
    gain.current = null;
    if (context && context.state !== 'closed') void context.close();
  }, []);

  return <div className="sonified-player" ref={player}>
    <video {...props} controls={false} key={`${playbackSrc}-${silentFallback}`} ref={video} crossOrigin={silentFallback ? undefined : 'anonymous'} src={playbackSrc} muted playsInline
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
      onEnded={event => { setPlaying(false); stop.current(); props.onEnded?.(event); }}
      onPointerDown={() => { if (enabled) void enableAudio(); }}
      onKeyDown={() => { if (enabled) void enableAudio(); }}
      onError={event => { stop.current(); setLoading(false); setPlaying(false); setMediaError(true); onError?.(event); }}
      onPlay={event => { setPlaying(true); if (enabled) void enableAudio(); onPlay?.(event); }}
      onPause={event => { setPlaying(false); stop.current(); onPause?.(event); }} />
    <div className="sonification-controls">
      <button type="button" className="sonification-play" onClick={togglePlayback}>
        {playing ? (es ? 'Pausar' : 'Pause') : enabled ? (es ? 'Reproducir con sonido' : 'Play with sound') : (es ? 'Reproducir' : 'Play')}
      </button>
      <input className="sonification-seek" type="range" min="0" max={duration || 0} step="0.1"
        aria-label={es ? 'Posición del vídeo' : 'Video position'} disabled={!duration}
        value={Math.min(position, duration)} onChange={event => {
          if (video.current) { stop.current(); video.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); }
        }} />
      <span className="sonification-time">{time(position)} / {time(duration)}</span>
      <button type="button" aria-pressed={enabled} onClick={() => {
        stop.current(); setEnabled(!enabled); if (!enabled) { setSilentFallback(false); void enableAudio(); }
      }}>{es ? 'Sonificación' : 'Sonification'} {enabled ? '✓' : '–'}</button>
      <label>{es ? 'Volumen' : 'Volume'} <input type="range" min="0" max="1" step="0.01"
        value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
      <button type="button" onClick={() => {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        else void player.current?.requestFullscreen?.().catch(() => {});
      }}>{es ? 'Pantalla completa' : 'Full screen'}</button>
      {loading && !mediaError && <p role="status">{es ? 'Cargando vídeo…' : 'Loading video…'}</p>}
      {(playError || mediaError) && <p role="alert">{es ? 'No se pudo cargar el vídeo. Comprueba la conexión y vuelve a intentarlo.' : 'Could not load the video. Check your connection and try again.'}</p>}
      <p>{es ? 'Más píxeles luminosos producen notas más agudas. Timbre inspirado en el tema del vídeo.' : 'More bright pixels produce higher notes. The timbre is inspired by the video topic.'}</p>
      {error && <p role="alert">{es ? 'Sonido no disponible. Prueba a desactivar y activar la sonificación.' : 'Sound unavailable. Try switching sonification off and on.'}</p>}
      {error && <button type="button" onClick={() => {
        stop.current(); setEnabled(false); setSilentFallback(true);
      }}>{es ? 'Ver vídeo sin sonido' : 'Watch without sound'}</button>}
    </div>
  </div>;
}
