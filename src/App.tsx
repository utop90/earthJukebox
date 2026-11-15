import { useRef, useState } from 'react';
import JukeboxLogo from './JukeboxLogo';
import LanguageSwitch, { type Language } from './LanguageSwitch';
import { earthTopics, explorerCopy, nasaSource, type VideoCard } from './exploreVideos';
import PlanetQuestions, { TrackCard } from './PlanetQuestions';
import './explore.css';

const modes = ['earth', 'change'] as const;
const allVideos = [...new Map(earthTopics.flatMap(group => group.videos).map(video => [video.id, video])).values()];
const topicIcons = {
  all: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  land: 'm2 19 7-12 4 7 3-5 6 10H2Z',
  water: 'M12 3c-2 3-6 7.2-6 11a6 6 0 0 0 12 0c0-3.8-4-8-6-11Z',
  air: 'M3 8h12a2 2 0 1 0-2-2 M3 12h16a2 2 0 1 1-2 2 M3 16h8a2 2 0 1 1-2 2',
  temperature: 'M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z M12 10v7',
  climate: 'M6 19a4 4 0 0 1-.7-7.9 5.5 5.5 0 0 1 10.5 1.4H18a3.25 3.25 0 0 1 0 6.5H6Z M13 5a4 4 0 0 1 6 5',
};

export default function App({ language, onLanguageChange }: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const t = explorerCopy[language];
  const [view, setView] = useState<typeof modes[number]>('earth');
  const [topic, setTopic] = useState(0);
  const [selected, setSelected] = useState<VideoCard | null>(null);
  const [failed, setFailed] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [durations, setDurations] = useState<Record<string, string>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const queue = topic === 0 ? allVideos : earthTopics[topic - 1].videos;
  function openVideo(video: VideoCard) {
    setSelected(video);
    setFailed(false);
    setFallback(false);
    dialog.current?.showModal();
  }

  function switchView(index: number, focus = false) {
    setView(modes[index]);
    if (focus) tabs.current[index]?.focus();
  }


  return <div className={`app explore explore-${view}`}>
    <header className="topbar">
      <a className="brand" href={import.meta.env.BASE_URL}><JukeboxLogo /><span className="jukebox-wordmark">Earth Jukebox</span></a>
      <div className="topbar-actions"><LanguageSwitch language={language} onChange={onLanguageChange} /></div>
    </header>
    <main>
      <h1 className="explore-title">{t.title}</h1>
      <p className="explore-intro">{t.intro}</p>
      <div className="explore-modes" role="tablist" aria-label={t.modes}>
        {modes.map((mode, index) => <button key={mode} type="button" className="explore-mode"
          ref={element => { tabs.current[index] = element; }} role="tab" id={`explore-tab-${mode}`}
          aria-controls={`explore-panel-${mode}`} aria-selected={view === mode} tabIndex={view === mode ? 0 : -1}
          onClick={() => switchView(index)}
          onKeyDown={event => {
            const next = { ArrowLeft: 1 - index, ArrowRight: 1 - index, Home: 0, End: 1 }[event.key];
            if (next === undefined) return;
            event.preventDefault();
            switchView(next, true);
          }}>
          <span className="explore-mode-icon" aria-hidden="true">{index === 0 ? '◎' : '↗'}</span>
          <span><strong>{t.tabs[index][0]}</strong><small>{t.tabs[index][1]}</small></span>
        </button>)}
      </div>
      <div className="explore-layout" data-view={view}>
        <section className="explore-panel explore-earth-panel" id="explore-panel-earth" role="tabpanel" aria-labelledby="explore-tab-earth" hidden={view !== 'earth'}>
          <div className="explore-chips" role="group" aria-label={t.categories}>
            {[{ icon: 'all' as const, label: t.all }, ...earthTopics.map(group => ({
              icon: group.icon, label: group.label[language],
            }))].map(({ icon, label }, index) => <button key={icon}
              type="button" aria-pressed={topic === index} onClick={() => setTopic(index)}>
              <svg className="explore-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d={topicIcons[icon]} />
              </svg>
              {label}
            </button>)}
          </div>
          <div className="planet-tracks explore-queue">
            {queue.map((track, index) => <TrackCard key={track.id} {...{ track, index, language }}
              active={selected?.id === track.id} playing={false} duration={durations[track.id]} onSelect={openVideo} />)}
          </div>
        </section>
        <section className="explore-panel explore-change-panel" id="explore-panel-change" role="tabpanel" aria-labelledby="explore-tab-change" hidden={view !== 'change'}>
          <PlanetQuestions language={language} selectedId={selected?.id ?? ''} playing={false} durations={durations} onSelect={openVideo} />
          <button type="button" className="explore-related" onClick={() => switchView(0, true)}>{t.back}</button>
        </section>
      </div>
      <dialog ref={dialog} className="explore-sheet" aria-labelledby="explore-detail-title" onClose={() => setSelected(null)}>
        <div className="explore-sheet-head">
          <h2 id="explore-detail-title">{selected?.title[language]}</h2>
          <button type="button" className="explore-sheet-close" aria-label={t.close} autoFocus
            onClick={() => dialog.current?.close()}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {selected && <>
        {failed ? <p role="alert">{t.error}</p> :
          <video className="explore-modal-video" controls playsInline preload="none"
            src={(fallback && selected.fallbackSrc) || (language === 'es' && selected.spanishSrc) || selected.src}
            poster={(language === 'es' && selected.spanishPoster) || selected.poster}
            aria-label={selected.title[language]}
            onError={() => {
              if (!fallback && selected.fallbackSrc) setFallback(true);
              else setFailed(true);
            }}
            onLoadedMetadata={event => {
              const seconds = Math.round(event.currentTarget.duration);
              if (Number.isFinite(seconds)) setDurations(previous => ({
                ...previous, [selected.id]: Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0'),
              }));
            }}>
            {selected.captions?.map(track => <track key={track.language} kind="captions"
              src={track.src} srcLang={track.language} label={track.language === 'es' ? 'Español' : 'English'} />)}
          </video>}
        <div className="explore-sheet-meta">
          {selected.period && <span>{selected.period[language]}</span>}
          <a href={nasaSource(selected.id)}>{t.source} · NASA SVS</a>
        </div>
        {selected.transcript && <details><summary>{t.transcript}</summary><p>{selected.transcript[language]}</p></details>}
        </>}
      </dialog>
    </main>
  </div>;
}
