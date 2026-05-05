"use client";

import { useTranslation } from 'react-i18next';

const normalizeLanguage = (lang) => (
  String(lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh'
);

const setAppLanguage = (lang) => {
  const normalizedLang = normalizeLanguage(lang);
  localStorage.setItem('i18n_lang', normalizedLang);
  document.cookie = `i18n_lang=${normalizedLang}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: normalizedLang } }));
};

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");

  const toggleLang = () => {
    const currentLang = (i18n.resolvedLanguage || i18n.language || "zh").toLowerCase();
    const newLang = currentLang.startsWith("zh") ? "en" : "zh";
    i18n.changeLanguage(newLang);
    setAppLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLang}
      aria-label={t("switchLangAria")}
      title={t("switchLangAria")}
      className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest"
    >
      {t("switchLang")}
    </button>
  );
}
