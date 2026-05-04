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

const savedLang = (typeof window !== 'undefined' && localStorage.getItem('i18n_lang')) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    defaultNS: 'nodes',
    interpolation: { escapeValue: false },
  });

// Sync language from localStorage changes (triggered by client's LanguageSwitcher)
if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', () => {
    const lang = localStorage.getItem('i18n_lang') || 'en';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  });
}

export default i18n;
