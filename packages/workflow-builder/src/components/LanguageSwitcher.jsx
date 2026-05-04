"use client";

import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const LanguageSwitcher = () => {
  const toggleLang = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18n_lang', newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <button
      type="button"
      suppressHydrationWarning={true}
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600/70 bg-white text-black text-xs font-bold rounded-full hover:bg-black hover:text-white transition-colors uppercase tracking-widest"
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  );
};

export default LanguageSwitcher;
