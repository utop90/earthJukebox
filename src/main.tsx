import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Landing from './Landing';
import './styles.css';

const isExploring = new URLSearchParams(window.location.search).get('view') === 'explore';
const exploreUrl = import.meta.env.BASE_URL + '?view=explore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isExploring ? <App /> : <Landing exploreUrl={exploreUrl} />}</React.StrictMode>
);

