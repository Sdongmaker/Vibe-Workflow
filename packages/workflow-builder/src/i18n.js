import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';
import enChat from './locales/en_chat.json';
import zhChat from './locales/zh_chat.json';

const resources = {
  en: { nodes: en, chat: enChat },
  zh: { nodes: zh, chat: zhChat },
};

const normalizeLang = (lang) => {
  const value = (lang || 'zh').toLowerCase();
  return value.startsWith('en') ? 'en' : 'zh';
};

const savedLang = normalizeLang(typeof window !== 'undefined' && localStorage.getItem('i18n_lang'));

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLang,
      fallbackLng: 'zh',
      defaultNS: 'nodes',
      interpolation: { escapeValue: false },
    });
} else if (i18n.language !== savedLang) {
  i18n.changeLanguage(savedLang);
}

if (i18n.isInitialized && typeof i18n.getResourceBundle === 'function' && typeof i18n.addResourceBundle === 'function') {
  Object.entries(resources).forEach(([lng, namespaces]) => {
    Object.entries(namespaces).forEach(([ns, resource]) => {
      if (!i18n.getResourceBundle(lng, ns)) {
        i18n.addResourceBundle(lng, ns, resource, true, true);
      }
    });
  });
}

// Sync language from localStorage changes (triggered by client's LanguageSwitcher)
if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', () => {
    const lang = normalizeLang(localStorage.getItem('i18n_lang'));
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
