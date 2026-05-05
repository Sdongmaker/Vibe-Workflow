import "./globals.css";
import I18nProvider from "./components/I18nProvider";
import { cookies } from "next/headers";
import enCommon from "../i18n/locales/en/common.json";
import zhCommon from "../i18n/locales/zh/common.json";

const metadataByLang = {
  en: enCommon,
  zh: zhCommon,
};

const getLocaleResources = (lang) => {
  const normalizedLang = lang?.toLowerCase().startsWith("en") ? "en" : "zh";
  return {
    lang: normalizedLang,
    resources: metadataByLang[normalizedLang],
  };
};

export async function generateMetadata() {
  const cookieStore = await cookies();
  const { resources } = getLocaleResources(cookieStore.get("i18n_lang")?.value);

  return {
    title: resources.siteTitle,
    description: resources.siteDescription,
    keywords: resources.siteKeywords,
    openGraph: {
      title: resources.siteTitle,
      description: resources.siteOgDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resources.siteTitle,
      description: resources.siteTwitterDescription,
    },
  };
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const { lang } = getLocaleResources(cookieStore.get("i18n_lang")?.value);

  return (
    <html lang={lang === "zh" ? "zh-CN" : "en"}>
      <body className="antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
