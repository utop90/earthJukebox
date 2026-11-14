import JukeboxLogo from './JukeboxLogo';
import { useEffect, useRef, useState } from 'react';
import LanguageSwitch, { type Language } from './LanguageSwitch';
import heroIllustration from './earth-jukebox-hero.svg?raw';
import { landPath, loadLand } from './heroEarth';
import './landing.css';

function HeroIllustration({ paused }: { paused: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const longitude = useRef(-24);
  const [land, setLand] = useState<Awaited<ReturnType<typeof loadLand>>>();

  useEffect(() => {
    const controller = new AbortController();
    loadLand(controller.signal).then(setLand).catch(() => {
      // Keep the embedded illustration if the coastline asset is unavailable.
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const outline = scene.current?.querySelector('#ejh-rotating-land');
    if (!outline || !land?.length) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    const draw = () => outline.setAttribute('d', landPath(land, longitude.current));
    function animate(time: number) {
      if (time - last >= 40) {
        longitude.current = (longitude.current + Math.min(80, time - last) * .009) % 360;
        last = time;
        draw();
      }
      frame = requestAnimationFrame(animate);
    }
    function update() {
      cancelAnimationFrame(frame);
      if (!paused && !preference.matches) {
        last = performance.now();
        frame = requestAnimationFrame(animate);
      }
    }
    draw();
    update();
    preference.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', update);
    };
  }, [land, paused]);

  return <div ref={scene} className="landing-scene" data-paused={paused} aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: heroIllustration }} />;
}

const eicGalleryUrl = 'https://svs.gsfc.nasa.gov/gallery/earth-information-center/';
const forestHeightMediaUrl = 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004950/';

const landingCopy = {
  en: {
    skip: 'Skip to content',
    aboutLink: 'About',
    aboutClose: 'Close About',
    aboutDialogTitle: 'Earth Jukebox',
    aboutSections: [
      {
        id: 'about-introduction',
        title: 'Introduction',
        paragraphs: [
          <>We are Sara and Lavinia, two women from Málaga with six years of experience in web development. Earth Jukebox is our idea for making Earth observations easier to explore by <strong>bringing visualisations and sound together</strong>.</>,
        ],
        links: [],
      },
      {
        id: 'about-how-to-use',
        title: 'How to use',
        note: 'The interactive map offers short sonification previews. Timeline comparisons are in development.',
        paragraphs: [
          <><strong>Explore the world map.</strong> Select a region and open its associated video to see that part of the planet and listen to its sound.</>,
          <><strong>Compare changes over time.</strong> Explore how the planet changed from 1880 to 2026 by selecting a series such as global temperature. See how Sea Surface Temperature changed from 2002 to 2025, a span of 23 years, and listen to those changes.</>,
          <><strong>Search the video collection.</strong> Filter the full collection by date or by tags such as Climate and Ocean. Choose any video and open it to explore.</>,
        ],
        links: [],
      },
      {
        id: 'about-sources',
        title: 'Data sources',
        videoLabel: 'GEDI Forest Height',
        paragraphs: [
          'The Earth Information Center (EIC) is a public resource for exploring how Earth is changing. Its gallery brings together visualisations made from satellite images and measurements. Some also use observations from the ground or ocean and results from scientific models.',
          <>We extract <strong>every frame we use from videos in the EIC gallery</strong>.</>,
        ],
        links: [{ label: 'Explore the Earth Information Center (EIC) gallery', href: eicGalleryUrl }],
      },
      {
        id: 'about-method',
        title: 'Methodology',
        paragraphs: [
          'For each prepared frame, the planned method selects a region of interest, converts its pixels to relative luminance, and divides it into eight columns. Each column’s value is the proportion of valid pixels above a fixed brightness threshold.',
          <>A value from 0 to 1 maps to one of eight MIDI notes [48, 50, 52, 55, 57, 60, 62, 64] using round(7 × value): <strong>a higher proportion of bright pixels produces a higher note</strong>. This describes an image pattern; it is not a direct measurement of ocean speed, temperature or current strength.</>,
          'The map preview samples four frames from the selected video. The full player will highlight the region and active column in sync with the sound.',
        ],
        links: [],
      },
      {
        id: 'about-access',
        title: 'Accessibility',
        paragraphs: [
          <>The design uses a high-contrast palette with light text on dark backgrounds, a distinct accent colour and <strong>a visible focus outline for keyboard focus</strong>. Links, buttons, headings, header, main, sections and footer use semantic HTML; the About panel uses a native dialog with a labelled heading.</>,
          'Links, language buttons, dialog navigation and native video controls can be reached with a keyboard. The globe animation respects the reduced-motion preference, and the pause control is available when motion is enabled. Decorative graphics are hidden from assistive technology; controls have accessible names and state where needed.',
          'These measures are part of the current interface. Full testing with keyboard-only use and screen readers remains necessary; the planned sonification controls are not yet present.',
        ],
        links: [],
      },
      {
        id: 'about-technology',
        title: 'Technology',
        paragraphs: [
          <>The current website uses <strong>React, TypeScript and Vite</strong>. An application backend is planned for a later stage, but has not been implemented yet; for now, the catalogue is static JSON and language and playback preferences are stored in the browser.</>,
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
          <>The visualisation catalogue <strong>retains the credits supplied with its source material</strong>. Consult the original sources for publisher information and terms of use.</>,
          'The repository does not currently specify a code license, so no open-source license is claimed here. Created by Sara and Lavinia in Málaga.',
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
    soundDescription: 'Sonification connects features such as brightness to musical notes. Choose a point on the map to hear how the patterns in its video sound.',
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
    dialogOutro: 'The mapping determines what each sound represents. Choose a point on the world map to try a short sonification preview.',
  },
  es: {
    skip: 'Saltar al contenido',
    aboutLink: 'About',
    aboutClose: 'Cerrar información',
    aboutDialogTitle: 'Earth Jukebox',
    aboutSections: [
      {
        id: 'about-introduction',
        title: 'Introducción',
        paragraphs: [
          <>Somos Sara y Lavinia, dos chicas de Málaga con seis años de experiencia en desarrollo web. Earth Jukebox es nuestra idea para hacer más accesibles las observaciones de la Tierra, <strong>conectando visualizaciones y sonido</strong>.</>,
        ],
        links: [],
      },
      {
        id: 'about-how-to-use',
        title: 'Cómo usarlo',
        note: 'El mapa interactivo ofrece muestras breves de sonificación. Las comparaciones temporales están en desarrollo.',
        paragraphs: [
          <><strong>Explora el mapamundi.</strong> Selecciona una región y abre su vídeo asociado para ver esa parte del planeta y escuchar su sonido.</>,
          <><strong>Compara cambios a lo largo del tiempo.</strong> Elige una serie, como la de temperatura global, para ver cómo ha cambiado el planeta entre 1880 y 2026. Observa cómo cambió la temperatura de la superficie del mar (Sea Surface Temperature) de 2002 a 2025, un periodo de 23 años, y escucha esos cambios.</>,
          <><strong>Busca en la colección de vídeos.</strong> Filtra toda la colección por fecha o por etiquetas como Clima y Océano. Elige el vídeo que quieras explorar y ábrelo.</>,
        ],
        links: [],
      },
      {
        id: 'about-sources',
        title: 'Fuentes de datos',
        videoLabel: 'Altura de los bosques (GEDI)',
        paragraphs: [
          'El Earth Information Center (EIC) es un recurso público para explorar cómo cambia la Tierra. Su galería reúne visualizaciones creadas con imágenes y mediciones de satélite. Algunas también usan observaciones tomadas en tierra o en el océano y resultados de modelos científicos.',
          <>Extraemos <strong>todos los fotogramas que usamos de vídeos de la galería del EIC</strong>.</>,
        ],
        links: [{ label: 'Explora la galería del Earth Information Center (EIC)', href: eicGalleryUrl }],
      },
      {
        id: 'about-method',
        title: 'Metodología',
        paragraphs: [
          'Para cada fotograma preparado, el método previsto selecciona una región de interés, convierte sus píxeles a luminancia relativa y la divide en ocho columnas. El valor de cada columna es la proporción de píxeles válidos que supera un umbral de brillo fijo.',
          <>Un valor entre 0 y 1 se asigna a una de ocho notas MIDI [48, 50, 52, 55, 57, 60, 62, 64] mediante round(7 × valor): <strong>una proporción más alta de píxeles brillantes produce una nota más aguda</strong>. Esto describe un patrón de imagen; no mide directamente la velocidad, temperatura ni intensidad de una corriente.</>,
          'La muestra del mapa toma cuatro fotogramas del vídeo seleccionado. El reproductor completo resaltará la región y la columna activa en sincronía con el sonido.',
        ],
        links: [],
      },
      {
        id: 'about-access',
        title: 'Accesibilidad',
        paragraphs: [
          <>El diseño utiliza una paleta de alto contraste, con texto claro sobre fondos oscuros, un color de acento diferenciado y <strong>un contorno de foco visible al navegar con teclado</strong>. Los enlaces, botones, encabezados, cabecera, contenido principal, secciones y pie utilizan HTML semántico; la ventana About usa un diálogo nativo con título asociado.</>,
          'Los enlaces, botones de idioma, navegación del diálogo y controles nativos de vídeo se pueden recorrer con teclado. La animación del globo respeta la preferencia de movimiento reducido y, si el movimiento está activado, se puede pausar. Los gráficos decorativos se ocultan a tecnologías de asistencia y los controles tienen nombres y estados accesibles cuando corresponde.',
          'Estas medidas están presentes en la interfaz actual. Aún es necesario completar las pruebas con teclado y lectores de pantalla; los controles de sonificación previstos todavía no están disponibles.',
        ],
        links: [],
      },
      {
        id: 'about-technology',
        title: 'Tecnología',
        paragraphs: [
          <>La web actual está construida con <strong>React, TypeScript y Vite</strong>. Está previsto incorporar un backend de aplicación en una etapa posterior, pero aún no está implementado; por ahora, el catálogo es un JSON estático y el idioma y las reproducciones se guardan en el navegador.</>,
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
          <>El catálogo <strong>conserva los créditos incluidos con cada material de origen</strong>. Consulta las fuentes originales para conocer las entidades publicadoras y las condiciones de uso.</>,
          'El repositorio todavía no especifica una licencia para el código, por lo que no se atribuye aquí ninguna licencia de código abierto. Creado por Sara y Lavinia en Málaga.',
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
    soundDescription: 'La sonificación conecta características como el brillo con notas musicales. Elige un punto del mapa para escuchar cómo suenan los patrones de su vídeo.',
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
    dialogOutro: 'La correspondencia determina qué representa cada sonido. Elige un punto del mapamundi para probar una muestra breve de sonificación.',
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
        <JukeboxLogo />
        <span className="jukebox-wordmark">Earth Jukebox</span>
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
            <a className="landing-cta" href={exploreUrl}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>{copy.explore}</a>
            <a href="#sonification-explanation" className="landing-explanation-link" aria-haspopup="dialog"
              onClick={event => {
                event.preventDefault();
                explanationRef.current?.showModal();
              }}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>{copy.explanationLink}</a>
          </div>
        </div>
        <div className="landing-visual">
          <div className="landing-player">
            <HeroIllustration paused={paused} />
            <button className="landing-motion" type="button" aria-label={paused ? copy.resume : copy.pause}
              onClick={() => setPaused(value => !value)}>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paused ? 'M8 5l11 7-11 7z' : 'M7 5h4v14H7zm6 0h4v14h-4z'} /></svg>
            </button>
          </div>
        </div>
      </section>
      <section className="landing-process" aria-labelledby="process-title">
        <p className="landing-section-label">{copy.processLabel}</p>
        <h2 id="process-title">{copy.processTitle}</h2>
        <div className="landing-process-grid">
          <article className="landing-process-card">
            <svg className="landing-process-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3 12h18" />
            </svg>
            <h3>{copy.observationTitle}</h3>
            <p>{copy.observationDescription}</p>
          </article>
          <article className="landing-process-card">
            <svg className="landing-process-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 17V6l12-3v11M8 10l12-3" />
              <circle cx="5.5" cy="17.5" r="2.5" />
              <circle cx="17.5" cy="14.5" r="2.5" />
            </svg>
            <h3>{copy.soundTitle}</h3>
            <p>{copy.soundDescription}</p>
          </article>
          <article className="landing-process-card">
            <svg className="landing-process-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            <h3>{copy.curiosityTitle}</h3>
            <p>{copy.curiosityDescription}</p>
          </article>
        </div>
      </section>
      <section className="landing-final-cta" aria-labelledby="ready-title">
        <h2 id="ready-title">{copy.readyTitle}</h2>
        <p>{copy.readyDescription}</p>
        <a className="landing-cta" href={exploreUrl}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>{copy.explore}</a>
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
            {'note' in section && <p>{section.note}</p>}
            {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {'videoLabel' in section && <figure className="about-source-video">
              <video controls playsInline preload="none" aria-label={section.videoLabel}
                poster={forestHeightMediaUrl + 'GEDI_global_w_colorbar_0900_print.jpg'}
                src={forestHeightMediaUrl + 'GEDI_global_w_colorbar_1080p60.mp4'} />
              <figcaption>{section.videoLabel}</figcaption>
            </figure>}
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
