import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, UI_COPY } from '../data/i18n';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (typeof UI_COPY)['vi'];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function updateMetaContent(selector: string, content: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'vi';
    const saved = window.localStorage.getItem('mlt-lang');
    return saved === 'en' ? 'en' : 'vi';
  });

  useEffect(() => {
    const copy = UI_COPY[lang];
    document.documentElement.lang = lang;
    document.title = copy.pageTitle;
    updateMetaContent('meta[name="description"]', copy.metaDescription);
    updateMetaContent('meta[property="og:title"]', copy.pageTitle);
    updateMetaContent('meta[property="og:description"]', copy.metaDescription);
    updateMetaContent('meta[property="og:locale"]', lang === 'en' ? 'en_US' : 'vi_VN');
    updateMetaContent('meta[name="twitter:title"]', copy.pageTitle);
    updateMetaContent('meta[name="twitter:description"]', copy.metaDescription);
    window.localStorage.setItem('mlt-lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: UI_COPY[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
