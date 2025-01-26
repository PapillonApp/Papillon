import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./fr.json";
import en from "./en.json";
import es from "./es.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

AsyncStorage.getItem("lang").then((value) => {
  console.log(value);
  if (value) i18next.changeLanguage(value);
  else i18next.changeLanguage("fr");
});

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(initReactI18next).init({
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
  resources,
});

export default i18next;
