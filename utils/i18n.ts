import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "@/utils/locales/fr.json";
import en from "@/utils/locales/en.json";

const resources = {
    fr: { translation: fr },
    en: { translation: en },
};

const languageDetector = {
    type: "languageDetector",
    async: true,
    detect: (cb: (lang: string) => void) => {
        cb(Localization.locale.split("-")[0] || "en");
    },
    init: () => {},
    cacheUserLanguage: () => {},
};

i18n.use(languageDetector as any)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    });

export default i18n;
