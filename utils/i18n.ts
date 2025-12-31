import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import br from "@/locales/br.json";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import pt from "@/locales/pt.json";
import tr from "@/locales/tr.json";

export const resources = {
  fr: { translation: fr, emoji: "🇫🇷", label: "Français" },
  en: { translation: en, emoji: "🇬🇧", label: "English" },
  de: { translation: de, emoji: "🇩🇪", label: "Deutsch" },
  es: { translation: es, emoji: "🇪🇸", label: "Español" },
  tr: { translation: tr, emoji: "🇹🇷", label: "Türkçe" },
  br: { translation: br, emoji: "🏁", label: "Brezhoneg" },
  pt: { translation: pt, emoji: "🇵🇹", label: "Português" },
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (cb: (lang: string) => void) => {
    const detectedLang = Localization.getLocales()[0].languageTag.split("-")[0];
    cb(Object.keys(resources).includes(detectedLang) ? detectedLang : "en");
  },
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    lng: Localization.getLocales()[0].languageTag.split("-")[0],
    interpolation: { escapeValue: false },
    detection: {
      order: ["languageDetector"],
    },
  });

export default i18n;
