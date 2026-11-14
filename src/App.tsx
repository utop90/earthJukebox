import { useRef, useState } from 'react';
import JukeboxLogo from './JukeboxLogo';
import LanguageSwitch, { type Language } from './LanguageSwitch';
import { earthTopics, localize, nasaSource, type VideoCard } from './exploreVideos';
import PlanetQuestions from './PlanetQuestions';
import './world-map.css';
import './explore.css';

export default function App({ language, onLanguageChange }: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const es = language === 'es';
  const [view, setView] = useState<'earth' | 'change'>('earth');
  const [topic, setTopic] = useState(0);
  const [selected, setSelected] = useState<VideoCard | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const activeTopic = earthTopics[topic];

  const earthTitle = es ? 'Cómo suena la Tierra' : 'What Earth sounds like';
  const changeTitle = es ? 'Cómo ha cambiado la Tierra' : 'How Earth has changed';

  function openVideo(video: VideoCard) {
    setSelected(video);
    setVideoFailed(false);
    setUseFallback(false);
    dialog.current?.showModal();
  }

  return <div className="app explore">
    <header className="topbar">
      <a className="brand" href={import.meta.env.BASE_URL}><JukeboxLogo /><span className="jukebox-wordmark">Earth Jukebox</span></a>
      <div className="topbar-actions"><LanguageSwitch language={language} onChange={onLanguageChange} /></div>
    </header>
    <main>
      <h1 className="explore-title">{es ? 'Explora la Tierra' : 'Explore Earth'}</h1>
      <div className="explore-modes" role="group" aria-label={es ? 'Modo de exploración' : 'Exploration mode'}>
        <button type="button" className="explore-mode" aria-controls="explore-panel" aria-pressed={view === 'earth'} onClick={() => setView('earth')}>
          <span aria-hidden="true" className="explore-mode-icon">◎</span>
          <span><strong>{earthTitle}</strong><small>{es ? 'Explora por elementos' : 'Explore by element'}</small></span>
        </button>
        <button type="button" className="explore-mode explore-mode-change" aria-controls="explore-panel" aria-pressed={view === 'change'} onClick={() => setView('change')}>
          <span aria-hidden="true" className="explore-mode-icon">↗</span>
          <span><strong>{changeTitle}</strong><small>{es ? 'Elige una de nueve preguntas' : 'Choose from nine questions'}</small></span>
        </button>
      </div>
      <section id="explore-panel" className={`explore-panel explore-panel-${view}`} aria-labelledby="explore-heading">
        <h2 id="explore-heading">{view === 'earth' ? earthTitle : changeTitle}</h2>
        {view === 'earth' ? <>
          <div className="explore-chips" role="group" aria-label={es ? 'Elementos de la Tierra' : 'Earth elements'}>
            {earthTopics.map(({ label }, index) => <button type="button" key={label.en}
              aria-pressed={topic === index} aria-controls="explore-results" onClick={() => setTopic(index)}>{label[language]}</button>)}
          </div>
          <h3 className="explore-results-heading" aria-live="polite">
            {es ? `${activeTopic.label.es} · ${activeTopic.videos.length} vídeos` : `${activeTopic.label.en} · ${activeTopic.videos.length} videos`}
          </h3>
          <div className="explore-videos" id="explore-results">
            {activeTopic.videos.map((video, index) => <button type="button" className="explore-video-card" key={video.id}
              aria-haspopup="dialog" onClick={() => openVideo(video)}>
              <span className="explore-video-thumb">
                <img src={(es && video.spanishPoster) || video.poster} alt="" decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} />
                <span aria-hidden="true">▶</span>
              </span>
              <strong>{video.title[language]}</strong>
            </button>)}
          </div>
        </> : <PlanetQuestions language={language} onSelect={openVideo} />}
      </section>
      <dialog ref={dialog} className="world-audio explore-dialog" aria-labelledby="explore-video-title" onClose={() => setSelected(null)}>
        {selected && <>
          <button type="button" className="world-close" aria-label={es ? 'Cerrar vídeo' : 'Close video'} onClick={() => dialog.current?.close()}>×</button>
          <h2 id="explore-video-title">{selected.title[language]}</h2>
          {selected.detail && <p className="explore-video-period">{selected.detail[language]}</p>}
          {videoFailed ? <p role="alert">{es ? 'Este vídeo no se pudo reproducir. Puedes verlo en la página de la NASA.' : 'This video could not be played. You can watch it on the NASA page.'}</p> :
            <video key={`${selected.id}-${language}`} className="world-video" controls playsInline preload="none"
              poster={(es && selected.spanishPoster) || selected.poster} aria-label={selected.title[language]}
              src={(useFallback && selected.fallbackSrc) || (es && selected.spanishSrc) || selected.src}
              onError={() => selected.fallbackSrc && !useFallback ? setUseFallback(true) : setVideoFailed(true)} />}
          <a className="explore-source" href={nasaSource(selected.id)}>{localize('Ver fuente en NASA SVS ↗', 'View source on NASA SVS ↗')[language]}</a>
        </>}
      </dialog>
    </main>
  </div>;
}
