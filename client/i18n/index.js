import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enWorkflow from './locales/en/workflow.json';
import enNodes from '../../packages/workflow-builder/dist/locales/en.json';
import enChat from '../../packages/workflow-builder/dist/locales/en_chat.json';
import zhCommon from './locales/zh/common.json';
import zhLanding from './locales/zh/landing.json';
import zhWorkflow from './locales/zh/workflow.json';
import zhNodes from '../../packages/workflow-builder/dist/locales/zh.json';
import zhChat from '../../packages/workflow-builder/dist/locales/zh_chat.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, landing: enLanding, workflow: enWorkflow, nodes: enNodes, chat: enChat },
      zh: { common: zhCommon, landing: zhLanding, workflow: zhWorkflow, nodes: zhNodes, chat: zhChat },
    },
    fallbackLng: 'zh',
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
