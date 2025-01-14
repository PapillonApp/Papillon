import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en, fr } from "./index";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  debug: true,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources,
});

export default i18next;