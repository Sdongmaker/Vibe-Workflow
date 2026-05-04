"use client";

import { useEffect, useState } from 'react';
import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

export default function I18nProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('i18n_lang') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    document.documentElement.lang = savedLang;
    setReady(true);

    const handleLangChange = () => {
      const lang = localStorage.getItem('i18n_lang') || 'en';
      document.documentElement.lang = lang;
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  if (!ready) return null;

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
