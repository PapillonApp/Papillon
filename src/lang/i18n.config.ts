import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./fr.json";
import en from "./en.json";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  fallbackLng: "fr",
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources,
});

export default i18next;
