import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/* eslint-disable @typescript-eslint/no-require-imports */
// Locales are required lazily: only the active language + fallbacks get parsed at launch.
export const resources: Record<string, { load: () => object; emoji: string; label: string }> = {
  fr: { load: () => require("@/locales/fr.json"), emoji: "🇫🇷", label: "Français" },
  en: { load: () => require("@/locales/en.json"), emoji: "🇬🇧", label: "English" },
  de: { load: () => require("@/locales/de.json"), emoji: "🇩🇪", label: "Deutsch" },
  es: { load: () => require("@/locales/es.json"), emoji: "🇪🇸", label: "Español" },
  it: { load: () => require("@/locales/it.json"), emoji: "🇮🇹", label: "Italiano" },
  tr: { load: () => require("@/locales/tr.json"), emoji: "🇹🇷", label: "Türkçe" },
  br: { load: () => require("@/locales/br.json"), emoji: "🏁", label: "Brezhoneg" },
  pt: { load: () => require("@/locales/pt.json"), emoji: "🇵🇹", label: "Português" },
  ja: { load: () => require("@/locales/ja.json"), emoji: "🇯🇵", label: "日本語" },
  ru: { load: () => require("@/locales/ru.json"), emoji: "🇷🇺", label: "Русский" },
  ko: { load: () => require("@/locales/ko.json"), emoji: "🇰🇷", label: "한국어" },
  af: { load: () => require("@/locales/af.json"), emoji: "🇿🇦", label: "Afrikaans" },
  ar: { load: () => require("@/locales/ar.json"), emoji: "🇦🇪", label: "العربية" },
  el: { load: () => require("@/locales/el.json"), emoji: "🇬🇷", label: "Ελληνικά" },
  hi: { load: () => require("@/locales/hi.json"), emoji: "🇮🇳", label: "हिन्दी" },
  nl: { load: () => require("@/locales/nl.json"), emoji: "🇳🇱", label: "Nederlands" },
  pl: { load: () => require("@/locales/pl.json"), emoji: "🇵🇱", label: "Polski" },
  ro: { load: () => require("@/locales/ro.json"), emoji: "🇷🇴", label: "Română" },
  sq: { load: () => require("@/locales/sq.json"), emoji: "🇦🇱", label: "Shqip" },
  uk: { load: () => require("@/locales/uk.json"), emoji: "🇺🇦", label: "Українська" },
  vi: { load: () => require("@/locales/vi.json"), emoji: "🇻🇳", label: "Tiếng Việt" },
  bg: { load: () => require("@/locales/bg.json"), emoji: "🇧🇬", label: "Български" },
  bn: { load: () => require("@/locales/bn.json"), emoji: "🇧🇩", label: "বাংলা" },
  cs: { load: () => require("@/locales/cs.json"), emoji: "🇨🇿", label: "Čeština" },
  da: { load: () => require("@/locales/da.json"), emoji: "🇩🇰", label: "Dansk" },
  fi: { load: () => require("@/locales/fi.json"), emoji: "🇫🇮", label: "Suomi" },
  he: { load: () => require("@/locales/he.json"), emoji: "✡️", label: "עברית" },
  hu: { load: () => require("@/locales/hu.json"), emoji: "🇭🇺", label: "Magyar" },
  id: { load: () => require("@/locales/id.json"), emoji: "🇮🇩", label: "Bahasa Indonesia" },
  no: { load: () => require("@/locales/no.json"), emoji: "🇳🇴", label: "Norsk" },
  sk: { load: () => require("@/locales/sk.json"), emoji: "🇸🇰", label: "Slovenčina" },
  sv: { load: () => require("@/locales/sv.json"), emoji: "🇸🇪", label: "Svenska" },
  th: { load: () => require("@/locales/th.json"), emoji: "🇹🇭", label: "ไทย" },
  fa: { load: () => require("@/locales/fa.json"), emoji: "🇮🇷", label: "فارسی" },
  ur: { load: () => require("@/locales/ur.json"), emoji: "🇵🇰", label: "اردو" },
  ms: { load: () => require("@/locales/ms.json"), emoji: "🇲🇾", label: "Bahasa Malaysia" },
  sw: { load: () => require("@/locales/sw.json"), emoji: "🇹🇿", label: "Swahili" },
  hr: { load: () => require("@/locales/hr.json"), emoji: "🇭🇷", label: "Hrvatski" },
  et: { load: () => require("@/locales/et.json"), emoji: "🇪🇪", label: "Eesti" },
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (cb: (lang: string) => void) => {
    const detectedLang = Localization.getLocales()[0].languageTag.split("-")[0];
    cb(Object.keys(resources).includes(detectedLang) ? detectedLang : "en");
  },
};

const lazyBackend = {
  type: "backend",
  read: (lng: string, _ns: string, cb: (err: unknown, data?: object) => void) =>
    cb(null, resources[lng]?.load() ?? {}),
};

i18n
  .use(lazyBackend as any)
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    // The backend reads synchronously; init must too, or module-level t() calls
    // (e.g. Averages' algorithm labels) run before any translation is loaded.
    initAsync: false,
    fallbackLng: ["en", "fr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["languageDetector"],
    },
  });

export default i18n;
