import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: (cb: (lang: string) => void) => {
    const detectedLang = Localization.locale.split("-")[0];
    cb(Object.keys(resources).includes(detectedLang) ? detectedLang : "en");
  },
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: Localization.locale.split("-")[0],
    interpolation: { escapeValue: false },
    detection: {
      order: ["languageDetector"],
    },
  });

export default i18n;
