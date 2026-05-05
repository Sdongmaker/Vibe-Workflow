"use client";

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

const LANGUAGE_COOKIE = 'i18n_lang';

const normalizeLanguage = (lang) => (
  String(lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh'
);

const languageToHtmlLang = (lang) => (normalizeLanguage(lang) === 'zh' ? 'zh-CN' : 'en');

const getCookieLanguage = () => {
  if (typeof document === 'undefined') return null;

  const cookieMatch = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${LANGUAGE_COOKIE}=`));

  if (!cookieMatch) return null;

  return decodeURIComponent(cookieMatch.split('=').slice(1).join('='));
};

const getPreferredLanguage = () => {
  const cookieLang = getCookieLanguage();
  if (cookieLang) return normalizeLanguage(cookieLang);

  const storedLang = localStorage.getItem('i18n_lang');
  return normalizeLanguage(storedLang);
};

const setAppLanguage = (lang) => {
  const normalizedLang = normalizeLanguage(lang);
  localStorage.setItem(LANGUAGE_COOKIE, normalizedLang);
  document.documentElement.lang = languageToHtmlLang(normalizedLang);
  document.cookie = `${LANGUAGE_COOKIE}=${normalizedLang}; path=/; max-age=31536000; SameSite=Lax`;
  return normalizedLang;
};

export default function I18nProvider({ children }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const savedLang = getPreferredLanguage();
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    setAppLanguage(savedLang);

    const handleLangChange = (event) => {
      const lang = normalizeLanguage(event.detail?.lang || getPreferredLanguage());
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
      setAppLanguage(lang);
      router.refresh();
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, [router]);

  if (!hydrated) return null;

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
