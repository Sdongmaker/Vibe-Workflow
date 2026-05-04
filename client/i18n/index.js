import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enWorkflow from './locales/en/workflow.json';
import zhCommon from './locales/zh/common.json';
import zhLanding from './locales/zh/landing.json';
import zhWorkflow from './locales/zh/workflow.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, landing: enLanding, workflow: enWorkflow },
      zh: { common: zhCommon, landing: zhLanding, workflow: zhWorkflow },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'querystring'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18n_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
