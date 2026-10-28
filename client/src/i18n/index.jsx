import { createContext, useContext, useEffect, useState } from 'react';
import en from './en';
import ur from './ur';

const translations = { en, ur };
const LANG_KEY = 'staybook_lang';

const LanguageContext = createContext(null);

function lookup(table, key) {
  return key.split('.').reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), table);
}

// Language lives in localStorage so a returning guest sees the
// site in the language they picked last time. Unknown keys fall
// back to English rather than rendering a blank label.
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  function t(key, vars) {
    let text = lookup(translations[lang], key) ?? lookup(en, key) ?? key;
    if (vars && typeof text === 'string') {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.replace(`{{${name}}}`, value);
      });
    }
    return text;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
