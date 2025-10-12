import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import es from "@/locales/es.json";

export const resources = {
  fr: { translation: fr, emoji: "🇫🇷", label: "Français" },
  en: { translation: en, emoji: "🇬🇧", label: "English" },
  de: { translation: de, emoji: "🇩🇪", label: "Deutsch" },
  es: { translation: es, emoji: "🇪🇸", label: "Español" }
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
    fallbackLng: "en",
    lng: Localization.getLocales()[0].languageTag.split("-")[0],
    interpolation: { escapeValue: false },
    detection: {
      order: ["languageDetector"],
    },
  });

export default i18n;
