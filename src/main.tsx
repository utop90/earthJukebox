import React from 'react';
import ReactDOM from 'react-dom/client';
import { lazy, Suspense, useEffect, useState } from 'react';
import LanguageSwitch, { type Language } from './LanguageSwitch';
import './styles.css';
import './retro-theme.css';

const isExploring = new URLSearchParams(window.location.search).get('view') === 'explore';
const App = lazy(() => import('./App'));
const Landing = lazy(() => import('./Landing'));
const exploreUrl = import.meta.env.BASE_URL + '?view=explore';
const languageStorageKey = 'earth-jukebox-language';

function readLanguage(): Language {
  try {
    return localStorage.getItem(languageStorageKey) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

function Root() {
  const [language, setLanguage] = useState<Language>(readLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(languageStorageKey, language);
    } catch {
      // The selected language still applies for this page when storage is unavailable.
    }
  }, [language]);

  return <Suspense>{isExploring
    ? <App language={language} onLanguageChange={setLanguage} />
    : <Landing exploreUrl={exploreUrl} language={language} onLanguageChange={setLanguage} />}</Suspense>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /></React.StrictMode>
);
