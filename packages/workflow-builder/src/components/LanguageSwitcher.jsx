"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("nodes");

  const toggleLang = () => {
    const currentLang = (i18n.resolvedLanguage || i18n.language || "zh").toLowerCase();
    const newLang = currentLang.startsWith("zh") ? "en" : "zh";
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18n_lang', newLang);
    document.cookie = `i18n_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <button
      type="button"
      suppressHydrationWarning={true}
      onClick={toggleLang}
      title={t("switchLanguage")}
      aria-label={t("switchLanguage")}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600/70 bg-white text-black text-xs font-bold rounded-full hover:bg-black hover:text-white transition-colors uppercase tracking-widest"
    >
      {(i18n.resolvedLanguage || i18n.language || "zh").toLowerCase().startsWith("zh") ? "EN" : "中"}
    </button>
  );
};

export default LanguageSwitcher;
