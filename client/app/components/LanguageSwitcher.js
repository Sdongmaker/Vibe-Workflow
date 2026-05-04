"use client";

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const toggleLang = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18n_lang', newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <button
      onClick={toggleLang}
      className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest"
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  );
}
