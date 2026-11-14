export type Language = 'en' | 'es';

export default function LanguageSwitch({
  language,
  onChange,
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  return <div className="language-switch" role="group" aria-label={language === 'en' ? 'Select language' : 'Seleccionar idioma'}>
    <button type="button" aria-pressed={language === 'en'} onClick={() => onChange('en')}>English</button>
    <button type="button" aria-pressed={language === 'es'} onClick={() => onChange('es')}>Español</button>
  </div>;
}
