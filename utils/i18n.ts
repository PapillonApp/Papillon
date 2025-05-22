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
        const locale = Localization.locale;
        console.log("Current region:", locale);
        const detectedLang = locale.split("-")[0];
        if (Object.keys(resources).includes(detectedLang)) {
            cb(detectedLang);
        } else {
            cb("en");
        }
    },
    init: () => {},
    cacheUserLanguage: () => {},
};

i18n.use(languageDetector as any)
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
