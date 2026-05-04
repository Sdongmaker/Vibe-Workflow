"use client";

import { useEffect, useSyncExternalStore } from 'react';
import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

export default function I18nProvider({ children }) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const savedLang = localStorage.getItem('i18n_lang') || 'zh';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    document.documentElement.lang = savedLang;

    const handleLangChange = () => {
      const lang = localStorage.getItem('i18n_lang') || 'zh';
      document.documentElement.lang = lang;
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  if (!hydrated) return null;

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
