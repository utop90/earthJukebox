import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import App from './App';
import Landing from './Landing';
import LanguageSwitch, { type Language } from './LanguageSwitch';
import './styles.css';

const isExploring = new URLSearchParams(window.location.search).get('view') === 'explore';
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

  return isExploring
    ? <App language={language} onLanguageChange={setLanguage} />
    : <Landing exploreUrl={exploreUrl} language={language} onLanguageChange={setLanguage} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /></React.StrictMode>
);
