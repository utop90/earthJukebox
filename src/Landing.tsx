import { useEffect, useRef, useState } from 'react';
import './landing.css';

const resolution = 384;
const textureUrl = import.meta.env.BASE_URL + 'earth-surface.webp';

function Earth({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const texture = new Image();
    let request = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    texture.onload = () => {
      const source = document.createElement('canvas');
      source.width = texture.naturalWidth;
      source.height = texture.naturalHeight;
      const pixels = source.getContext('2d');
      if (!pixels) return;
      pixels.drawImage(texture, 0, 0);
      const map = pixels.getImageData(0, 0, source.width, source.height).data;
      const frame = context.createImageData(resolution, resolution);
      const surface: { index: number; u: number; row: number; light: number; rim: number }[] = [];

      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x + 0.5) * 2 / resolution - 1;
          const ny = 1 - (y + 0.5) * 2 / resolution;
          const radius = nx * nx + ny * ny;
          if (radius >= 1) continue;
          const nz = Math.sqrt(1 - radius);
          const latitude = Math.asin(ny * 0.96 + nz * 0.28);
          const longitude = Math.atan2(nx, nz * 0.96 - ny * 0.28);
          surface.push({
            index: (y * resolution + x) * 4,
            u: (0.31 + longitude / (2 * Math.PI)) * source.width,
            row: Math.floor((0.5 - latitude / Math.PI) * source.height) * source.width,
            light: 0.27 + 0.80 * Math.max(0, -nx * 0.43 + ny * 0.34 + nz * 0.83),
            rim: (1 - nz) ** 3,
          });
        }
      }

      let rotation = 0;
      let previous = 0;
      let drawn = false;
      const draw = (time: number) => {
        request = requestAnimationFrame(draw);
        const stationary = pausedRef.current || reducedMotion.matches;
        const elapsed = time - previous;
        if (drawn && elapsed < 40) return;
        previous = time;
        if (drawn && stationary) return;
        if (drawn) rotation = (rotation + Math.min(elapsed, 80) * source.width / 85000) % source.width;
        for (const { index, u, row, light, rim } of surface) {
          const sample = (row + Math.floor(u + rotation + source.width) % source.width) * 4;
          frame.data[index] = map[sample] * light + rim * 24;
          frame.data[index + 1] = map[sample + 1] * light + rim * 66;
          frame.data[index + 2] = map[sample + 2] * light + rim * 78;
          frame.data[index + 3] = 255;
        }
        context.putImageData(frame, 0, 0);
        drawn = true;
      };
      request = requestAnimationFrame(draw);
    };
    texture.src = textureUrl;
    return () => {
      texture.onload = null;
      cancelAnimationFrame(request);
    };
  }, []);

  return <canvas ref={canvasRef} width={resolution} height={resolution} className="landing-globe" />;
}

const waveform = 'M0 60 H108 l8 -4 8 8 8 -13 8 19 8 -28 8 37 8 -57 8 76 8 -96 8 110 8 -88 8 60 8 -36 8 16 8 -10 8 4 H278 l8 -7 8 17 8 -36 8 51 8 -41 8 22 8 -12 8 6 H370 l8 -3 8 6 8 -8 8 12 8 -18 8 22 8 -17 8 10 8 -4 H469 l8 -4 8 8 8 -18 8 33 8 -51 8 72 8 -84 8 68 8 -42 8 22 8 -11 8 5 H660';

export default function Landing({ exploreUrl }: { exploreUrl: string }) {
  const [paused, setPaused] = useState(false);
  const explanationRef = useRef<HTMLDialogElement>(null);

  return <div className="earth-landing" id="top">
    <a className="landing-skip" href="#landing-main">Skip to content</a>
    <header className="landing-header">
      <a className="landing-brand" href="#top">
        <span className="landing-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        Earth Jukebox
      </a>
    </header>
    <main id="landing-main">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-copy">
          <h1 id="hero-title">Tune in to <em>planet Earth.</em></h1>
          <p>Listen to every corner of the planet. Explore real Earth observations through sound and compare how the world has changed from 1700 to today.</p>
          <div className="landing-actions">
            <a className="landing-cta" href={exploreUrl}>Explore Earth <span aria-hidden="true">→</span></a>
            <a href="#sonification-explanation" className="landing-explanation-link" aria-haspopup="dialog"
              onClick={event => {
                event.preventDefault();
                explanationRef.current?.showModal();
              }}>How sonification works</a>
          </div>
        </div>
        <div className="landing-visual">
          <div className="landing-scene" aria-hidden="true">
            <div className="landing-orbit landing-orbit-one" />
            <div className="landing-orbit landing-orbit-two" />
            <Earth paused={paused} />
            <div className="landing-headphones">
              <div className="headphone-band" />
              <div className="headphone-arm headphone-arm-left" />
              <div className="headphone-arm headphone-arm-right" />
              <div className="headphone-cup headphone-cup-left"><span /></div>
              <div className="headphone-cup headphone-cup-right"><span /></div>
            </div>
            <svg className="landing-wave" data-paused={paused} viewBox="0 0 660 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="landing-signal">
                  <stop stopColor="currentColor" stopOpacity="0" />
                  <stop offset=".22" stopColor="currentColor" />
                  <stop offset=".84" stopColor="currentColor" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={waveform} fill="none" stroke="url(#landing-signal)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <button className="landing-motion" type="button" onClick={() => setPaused(value => !value)}>
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span> {paused ? 'Resume animation' : 'Pause animation'}
          </button>
        </div>
      </section>
      <section className="landing-about" aria-labelledby="about-title">
        <p className="landing-section-label">About the project</p>
        <h2 id="about-title">One Planet. Many Perspectives.</h2>
        <p className="landing-section-copy">Earth Jukebox brings scientific visualisations together to help you explore our planet from a different perspective. Follow ocean currents, discover patterns in the atmosphere, and see Earth within the wider solar system. Our aim is to bring these images to life through sound, making planetary science easier to explore through more than one sense.</p>
      </section>
      <section className="landing-process" aria-labelledby="process-title">
        <p className="landing-section-label">How it works</p>
        <h2 id="process-title">See. Hear. Understand.</h2>
        <div className="landing-process-grid">
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#127757;</span>
            <h3>Explore real observations</h3>
            <p>Discover visualisations built from satellite observations and scientific models. Explore oceans, forests and the atmosphere, with original sources available for every video.</p>
          </article>
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#9835;</span>
            <h3>Discover the sound of patterns</h3>
            <p>Sonification connects features such as brightness to musical notes. It is the next stage of Earth Jukebox, designed to turn changes in an image into changes you can hear.</p>
          </article>
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#9678;</span>
            <h3>Follow your curiosity</h3>
            <p>Choose a topic, play a visualisation and take a closer look. Read the description and visit its source to understand what the colours, shapes and movement represent.</p>
          </article>
        </div>
      </section>
      <section className="landing-final-cta" aria-labelledby="ready-title">
        <h2 id="ready-title">Ready to explore?</h2>
        <p>Dive into a curated collection of scientific visualisations and discover the pulse of our planet.</p>
        <a className="landing-cta" href={exploreUrl}>Explore Earth <span aria-hidden="true">&rarr;</span></a>
      </section>
    </main>
    <footer className="landing-closing-footer">
      <span>EARTH JUKEBOX</span>
      <span>A multisensory exploration of Earth</span>
      <a className="landing-back-top" href="#top">Back to top <span aria-hidden="true">&uarr;</span></a>
    </footer>
    <dialog id="sonification-explanation" className="sonification-dialog" ref={explanationRef} aria-labelledby="sonification-title"
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
          event.currentTarget.close();
        }
      }}>
      <div className="sonification-dialog-heading">
        <h2 id="sonification-title">How sonification works</h2>
        <button type="button" className="sonification-close" aria-label="Close explanation"
          onClick={() => explanationRef.current?.close()} autoFocus>&times;</button>
      </div>
      <p>Sonification turns visual patterns or data into sound, giving you another way to explore an image.</p>
      <ol>
        <li><strong>Start with an image.</strong> A satellite view contains patterns of colour, brightness and movement.</li>
        <li><strong>Connect a pattern to sound.</strong> For example, brighter pixels can produce higher notes, while darker pixels produce lower notes.</li>
        <li><strong>Follow the changes.</strong> Reading across the image creates a sequence of notes. Changing patterns become changes you can hear.</li>
      </ol>
      <p>The mapping determines what each sound represents. This example explains the concept. The current collection offers visual exploration, with sonification planned for a future stage.</p>
    </dialog>
  </div>;
}
