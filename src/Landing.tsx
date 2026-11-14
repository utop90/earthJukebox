import { useEffect, useRef, useState } from 'react';
import LanguageSwitch, { type Language } from './LanguageSwitch';
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

const landingCopy = {
  en: {
    skip: 'Skip to content',
    aboutLink: 'About',
    aboutClose: 'Close About',
    aboutEyebrow: 'SPACE APPS CHALLENGE 2026',
    aboutDialogTitle: 'Earth Jukebox',
    aboutSections: [
      {
        id: 'about-introduction',
        title: 'Introduction',
        paragraphs: [
          'We are Sara and Lavinia, two women from Málaga with six years of experience in web development. Earth Jukebox is our idea for making Earth observations easier to explore by bringing visualisations and sound together.',
          'The project explores environmental data from 1700 to 2026. The current website presents a visual collection; interactive image-to-sound exploration is the next development stage.',
        ],
        links: [],
      },
      {
        id: 'about-how-to-use',
        title: 'How to use',
        paragraphs: [
          'Choose a video from the collection and use its player controls. Search the collection or filter it by category; open a source page for context about a visualisation.',
          'Colours belong to each individual visualisation, so their meaning depends on its data and legend; they are not a single Earth Jukebox colour scale. Interactive sonification is not available yet. The planned prototype maps brighter image patterns to higher notes and darker patterns to lower notes.',
        ],
        links: [],
      },
      {
        id: 'about-sources',
        title: 'Data sources',
        paragraphs: [
          'The current catalogue is a manually curated set of visualisations from the Earth Information Center. The project’s data period is 1700–2026. Each dataset must be documented with its publisher, units and period of coverage.',
          'The first sonification prototype is planned around an ocean-current visualisation. A timestamp within a video is a position in that visualisation, not a historical observation date.',
        ],
        links: [
          { label: 'Earth Information Center', href: 'https://science.nasa.gov/earth/earth-information-center/' },
        ],
      },
      {
        id: 'about-method',
        title: 'Methodology',
        paragraphs: [
          'For each prepared frame, the planned method selects a region of interest, converts its pixels to relative luminance, and divides it into eight columns. Each column’s value is the proportion of valid pixels above a fixed brightness threshold.',
          'A value from 0 to 1 maps to one of eight MIDI notes [48, 50, 52, 55, 57, 60, 62, 64] using round(7 × value): a higher proportion of bright pixels produces a higher note. This describes an image pattern; it is not a direct measurement of ocean speed, temperature or current strength.',
          'The planned visual feedback highlights the analysed region and active column in sync with sound. This image-to-sound feature is not implemented in the current website.',
        ],
        links: [],
      },
      {
        id: 'about-access',
        title: 'Accessibility',
        paragraphs: [
          'The design uses a high-contrast palette with light text on dark backgrounds, a distinct accent colour and a visible focus outline for keyboard focus. Links, buttons, headings, header, main, sections and footer use semantic HTML; the About panel uses a native dialog with a labelled heading.',
          'Links, language buttons, dialog navigation and native video controls can be reached with a keyboard. The globe animation respects the reduced-motion preference, and the pause control is available when motion is enabled. Decorative graphics are hidden from assistive technology; controls have accessible names and state where needed.',
          'These measures are part of the current interface. Full testing with keyboard-only use and screen readers remains necessary; the planned sonification controls are not yet present.',
        ],
        links: [],
      },
      {
        id: 'about-technology',
        title: 'Technology',
        paragraphs: [
          'The current website uses React, TypeScript and Vite. An application backend is planned for a later stage, but has not been implemented yet; for now, the catalogue is static JSON and language and playback preferences are stored in the browser.',
          'The implementation plan proposes Web Audio API for sound, Python with NumPy and Pillow plus FFmpeg for image preparation, and Vitest, Playwright, axe and NVDA for testing. The current MVP is static and has no backend service.',
        ],
        links: [
          { label: 'Earth Jukebox source code on GitHub', href: 'https://github.com/utop90/earthJukebox/tree/main' },
        ],
      },
      {
        id: 'about-licenses',
        title: 'Licenses & credits',
        paragraphs: [
          'The visualisation catalogue retains the credits supplied with its source material. Consult the Earth Information Center for publisher information and the applicable terms for each dataset or visualisation.',
          'The repository does not currently specify a code license, so no open-source license is claimed here. Created by Sara and Lavinia in Málaga for the Space Apps Challenge 2026.',
        ],
        links: [],
      },
    ],
    heroTitle: 'Tune in to',
    heroEmphasis: 'planet Earth.',
    heroDescription: 'Listen to every corner of the planet. Explore real Earth observations through sound and compare how the world has changed from 1700 to today.',
    explore: 'Hear the planet',
    explanationLink: 'How sonification works',
    resume: 'Resume animation',
    pause: 'Pause animation',
    processLabel: 'How it works',
    processTitle: 'See. Hear. Understand.',
    observationTitle: 'Explore real observations',
    observationDescription: 'Discover visualisations built from satellite observations and scientific models. Explore oceans, forests and the atmosphere, with original sources available for every video.',
    soundTitle: 'Discover the sound of patterns',
    soundDescription: 'Sonification connects features such as brightness to musical notes. It is the next stage of Earth Jukebox, designed to turn changes in an image into changes you can hear.',
    curiosityTitle: 'Follow your curiosity',
    curiosityDescription: 'Choose a topic, play a visualisation and take a closer look. Read the description and visit its source to understand what the colours, shapes and movement represent.',
    readyTitle: 'Ready to explore?',
    readyDescription: 'Dive into a curated collection of scientific visualisations and discover the pulse of our planet.',
    footerDescription: 'A multisensory exploration of Earth',
    backToTop: 'Back to top',
    dialogTitle: 'How sonification works',
    dialogClose: 'Close explanation',
    dialogIntro: 'Sonification turns visual patterns or data into sound, giving you another way to explore an image.',
    stepOne: 'Start with an image.',
    stepOneDescription: ' A satellite view contains patterns of colour, brightness and movement.',
    stepTwo: 'Connect a pattern to sound.',
    stepTwoDescription: ' For example, brighter pixels can produce higher notes, while darker pixels produce lower notes.',
    stepThree: 'Follow the changes.',
    stepThreeDescription: ' Reading across the image creates a sequence of notes. Changing patterns become changes you can hear.',
    dialogOutro: 'The mapping determines what each sound represents. This example explains the concept. The current collection offers visual exploration, with sonification planned for a future stage.',
  },
  es: {
    skip: 'Saltar al contenido',
    aboutLink: 'About',
    aboutClose: 'Cerrar información',
    aboutEyebrow: 'SPACE APPS CHALLENGE 2026',
    aboutDialogTitle: 'Earth Jukebox',
    aboutSections: [
      {
        id: 'about-introduction',
        title: 'Introducción',
        paragraphs: [
          'Somos Sara y Lavinia, dos chicas de Málaga con seis años de experiencia en desarrollo web. Earth Jukebox es nuestra idea para hacer más accesibles las observaciones de la Tierra, conectando visualizaciones y sonido.',
          'El proyecto explora datos ambientales desde 1700 hasta 2026. La web actual presenta una colección visual; la exploración interactiva de imagen a sonido es la siguiente etapa de desarrollo.',
        ],
        links: [],
      },
      {
        id: 'about-how-to-use',
        title: 'Cómo usarlo',
        paragraphs: [
          'Elige un vídeo de la colección y utiliza sus controles de reproducción. Busca en la colección o filtra por categoría; abre la fuente para consultar el contexto de cada visualización.',
          'Los colores pertenecen a cada visualización, por lo que su significado depende de los datos y la leyenda de esa pieza; no existe una escala de color única de Earth Jukebox. La sonificación interactiva aún no está disponible. El prototipo previsto asociará los patrones más brillantes con notas más agudas y los más oscuros con notas más graves.',
        ],
        links: [],
      },
      {
        id: 'about-sources',
        title: 'Fuentes de datos',
        paragraphs: [
          'El catálogo actual es una selección revisada manualmente de visualizaciones del Earth Information Center. El periodo de datos del proyecto es 1700–2026. Para cada conjunto de datos se documentarán la entidad publicadora, las unidades y el periodo que cubre.',
          'El primer prototipo de sonificación está previsto sobre una visualización de una corriente oceánica. El tiempo indicado dentro de un vídeo es una posición en esa visualización, no una fecha de observación histórica.',
        ],
        links: [
          { label: 'Earth Information Center', href: 'https://science.nasa.gov/earth/earth-information-center/' },
        ],
      },
      {
        id: 'about-method',
        title: 'Metodología',
        paragraphs: [
          'Para cada fotograma preparado, el método previsto selecciona una región de interés, convierte sus píxeles a luminancia relativa y la divide en ocho columnas. El valor de cada columna es la proporción de píxeles válidos que supera un umbral de brillo fijo.',
          'Un valor entre 0 y 1 se asigna a una de ocho notas MIDI [48, 50, 52, 55, 57, 60, 62, 64] mediante round(7 × valor): una proporción más alta de píxeles brillantes produce una nota más aguda. Esto describe un patrón de imagen; no mide directamente la velocidad, temperatura ni intensidad de una corriente.',
          'La respuesta visual prevista resalta la región analizada y la columna activa sincronizada con el sonido. Esta función de imagen a sonido aún no está implementada en la web actual.',
        ],
        links: [],
      },
      {
        id: 'about-access',
        title: 'Accesibilidad',
        paragraphs: [
          'El diseño utiliza una paleta de alto contraste, con texto claro sobre fondos oscuros, un color de acento diferenciado y un contorno de foco visible al navegar con teclado. Los enlaces, botones, encabezados, cabecera, contenido principal, secciones y pie utilizan HTML semántico; la ventana About usa un diálogo nativo con título asociado.',
          'Los enlaces, botones de idioma, navegación del diálogo y controles nativos de vídeo se pueden recorrer con teclado. La animación del globo respeta la preferencia de movimiento reducido y, si el movimiento está activado, se puede pausar. Los gráficos decorativos se ocultan a tecnologías de asistencia y los controles tienen nombres y estados accesibles cuando corresponde.',
          'Estas medidas están presentes en la interfaz actual. Aún es necesario completar las pruebas con teclado y lectores de pantalla; los controles de sonificación previstos todavía no están disponibles.',
        ],
        links: [],
      },
      {
        id: 'about-technology',
        title: 'Tecnología',
        paragraphs: [
          'La web actual está construida con React, TypeScript y Vite. Está previsto incorporar un backend de aplicación en una etapa posterior, pero aún no está implementado; por ahora, el catálogo es un JSON estático y el idioma y las reproducciones se guardan en el navegador.',
          'El plan propone Web Audio API para el sonido; Python con NumPy y Pillow, además de FFmpeg, para preparar imágenes; y Vitest, Playwright, axe y NVDA para las pruebas. El MVP actual es estático y no tiene servicio backend.',
        ],
        links: [
          { label: 'Código fuente de Earth Jukebox en GitHub', href: 'https://github.com/utop90/earthJukebox/tree/main' },
        ],
      },
      {
        id: 'about-licenses',
        title: 'Licencias y créditos',
        paragraphs: [
          'El catálogo conserva los créditos incluidos con cada material de origen. Consulta el Earth Information Center para conocer las entidades publicadoras y las condiciones aplicables a cada conjunto de datos o visualización.',
          'El repositorio todavía no especifica una licencia para el código, por lo que no se atribuye aquí ninguna licencia de código abierto. Creado por Sara y Lavinia en Málaga para Space Apps Challenge 2026.',
        ],
        links: [],
      },
    ],
    heroTitle: 'Sintoniza con',
    heroEmphasis: 'el planeta Tierra.',
    heroDescription: 'Escucha cada rincón del planeta. Explora observaciones reales de la Tierra a través del sonido y compara cómo ha cambiado el mundo desde 1700 hasta hoy.',
    explore: 'Escucha el planeta',
    explanationLink: 'Cómo funciona la sonificación',
    resume: 'Reanudar animación',
    pause: 'Pausar animación',
    processLabel: 'Cómo funciona',
    processTitle: 'Ver. Escuchar. Comprender.',
    observationTitle: 'Explora observaciones reales',
    observationDescription: 'Descubre visualizaciones creadas a partir de observaciones satelitales y modelos científicos. Explora océanos, bosques y la atmósfera; cada vídeo incluye sus fuentes originales.',
    soundTitle: 'Descubre el sonido de los patrones',
    soundDescription: 'La sonificación conecta características como el brillo con notas musicales. Es la siguiente etapa de Earth Jukebox: convertir los cambios de una imagen en cambios que puedes escuchar.',
    curiosityTitle: 'Sigue tu curiosidad',
    curiosityDescription: 'Elige un tema, reproduce una visualización y obsérvala de cerca. Lee la descripción y visita su fuente para entender qué representan sus colores, formas y movimientos.',
    readyTitle: '¿Listo para explorar?',
    readyDescription: 'Adéntrate en una colección seleccionada de visualizaciones científicas y descubre el pulso de nuestro planeta.',
    footerDescription: 'Una exploración multisensorial de la Tierra',
    backToTop: 'Volver arriba',
    dialogTitle: 'Cómo funciona la sonificación',
    dialogClose: 'Cerrar explicación',
    dialogIntro: 'La sonificación convierte patrones visuales o datos en sonido y ofrece otra forma de explorar una imagen.',
    stepOne: 'Empieza con una imagen.',
    stepOneDescription: ' Una vista satelital contiene patrones de color, brillo y movimiento.',
    stepTwo: 'Conecta un patrón con el sonido.',
    stepTwoDescription: ' Por ejemplo, los píxeles más brillantes pueden producir notas más agudas y los más oscuros, notas más graves.',
    stepThree: 'Sigue los cambios.',
    stepThreeDescription: ' Recorrer la imagen crea una secuencia de notas. Los patrones cambiantes se convierten en cambios que puedes escuchar.',
    dialogOutro: 'La correspondencia determina qué representa cada sonido. Este ejemplo explica el concepto. La colección actual ofrece exploración visual; la sonificación está prevista para una etapa futura.',
  },
} as const;

export default function Landing({ exploreUrl, language, onLanguageChange }: {
  exploreUrl: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const [paused, setPaused] = useState(false);
  const explanationRef = useRef<HTMLDialogElement>(null);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const copy = landingCopy[language];

  return <div className="earth-landing" id="top">
    <a className="landing-skip" href="#landing-main">{copy.skip}</a>
    <header className="landing-header">
      <a className="landing-brand" href="#top">
        <span className="landing-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        Earth Jukebox
      </a>
      <div className="landing-header-actions">
        <a href="#about-information" className="landing-about-link" aria-haspopup="dialog"
          onClick={event => {
            event.preventDefault();
            aboutRef.current?.showModal();
          }}>{copy.aboutLink}</a>
        <LanguageSwitch language={language} onChange={onLanguageChange} />
      </div>
    </header>
    <main id="landing-main">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-copy">
          <h1 id="hero-title">{copy.heroTitle} <em>{copy.heroEmphasis}</em></h1>
          <p>{copy.heroDescription}</p>
          <div className="landing-actions">
            <a className="landing-cta" href={exploreUrl}>{copy.explore} <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a>
            <a href="#sonification-explanation" className="landing-explanation-link" aria-haspopup="dialog"
              onClick={event => {
                event.preventDefault();
                explanationRef.current?.showModal();
              }}>{copy.explanationLink}</a>
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
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span> {paused ? copy.resume : copy.pause}
          </button>
        </div>
      </section>
      <section className="landing-process" aria-labelledby="process-title">
        <p className="landing-section-label">{copy.processLabel}</p>
        <h2 id="process-title">{copy.processTitle}</h2>
        <div className="landing-process-grid">
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#127757;</span>
            <h3>{copy.observationTitle}</h3>
            <p>{copy.observationDescription}</p>
          </article>
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#9835;</span>
            <h3>{copy.soundTitle}</h3>
            <p>{copy.soundDescription}</p>
          </article>
          <article className="landing-process-card">
            <span className="landing-process-icon" aria-hidden="true">&#9678;</span>
            <h3>{copy.curiosityTitle}</h3>
            <p>{copy.curiosityDescription}</p>
          </article>
        </div>
      </section>
      <section className="landing-final-cta" aria-labelledby="ready-title">
        <h2 id="ready-title">{copy.readyTitle}</h2>
        <p>{copy.readyDescription}</p>
        <a className="landing-cta" href={exploreUrl}>{copy.explore} <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a>
      </section>
    </main>
    <footer className="landing-closing-footer">
      <span>EARTH JUKEBOX</span>
      <span>{copy.footerDescription}</span>
      <a className="landing-back-top" href="#top">{copy.backToTop} <span aria-hidden="true">&uarr;</span></a>
    </footer>
    <dialog id="about-information" className="about-dialog" ref={aboutRef} aria-labelledby="about-dialog-title"
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
          event.currentTarget.close();
        }
      }}>
      <div className="about-dialog-header">
        <div>
          <p>{copy.aboutEyebrow}</p>
          <h2 id="about-dialog-title">{copy.aboutDialogTitle}</h2>
        </div>
        <button type="button" className="sonification-close" aria-label={copy.aboutClose}
          onClick={() => aboutRef.current?.close()} autoFocus>&times;</button>
      </div>
      <div className="about-dialog-body">
        <nav className="about-dialog-nav" aria-label={copy.aboutDialogTitle}>
          {copy.aboutSections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
        </nav>
        <div className="about-dialog-content">
          {copy.aboutSections.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
            <h3 id={`${section.id}-title`}>{section.title}</h3>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.links.length > 0 && <ul>
              {section.links.map(link => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a></li>)}
            </ul>}
          </section>)}
        </div>
      </div>
    </dialog>
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
        <h2 id="sonification-title">{copy.dialogTitle}</h2>
        <button type="button" className="sonification-close" aria-label={copy.dialogClose}
          onClick={() => explanationRef.current?.close()} autoFocus>&times;</button>
      </div>
      <p>{copy.dialogIntro}</p>
      <ol>
        <li><strong>{copy.stepOne}</strong>{copy.stepOneDescription}</li>
        <li><strong>{copy.stepTwo}</strong>{copy.stepTwoDescription}</li>
        <li><strong>{copy.stepThree}</strong>{copy.stepThreeDescription}</li>
      </ol>
      <p>{copy.dialogOutro}</p>
    </dialog>
  </div>;
}
