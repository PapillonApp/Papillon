import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import af from "@/locales/af.json";
import ar from "@/locales/ar.json";
import br from "@/locales/br.json";
import de from "@/locales/de.json";
import el from "@/locales/el.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import hi from "@/locales/hi.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import nl from "@/locales/nl.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import ro from "@/locales/ro.json";
import ru from "@/locales/ru.json";
import sq from "@/locales/sq.json";
import tr from "@/locales/tr.json";
import uk from "@/locales/uk.json";
import vi from "@/locales/vi.json";

export const resources = {
  fr: { translation: fr, emoji: "🇫🇷", label: "Français" },
  en: { translation: en, emoji: "🇬🇧", label: "English" },
  de: { translation: de, emoji: "🇩🇪", label: "Deutsch" },
  es: { translation: es, emoji: "🇪🇸", label: "Español" },
  it: { translation: it, emoji: "🇮🇹", label: "Italiano" },
  tr: { translation: tr, emoji: "🇹🇷", label: "Türkçe" },
  br: { translation: br, emoji: "🏁", label: "Brezhoneg" },
  pt: { translation: pt, emoji: "🇵🇹", label: "Português" },
  ja: { translation: ja, emoji: "🇯🇵", label: "日本語" },
  ru: { translation: ru, emoji: "🇷🇺", label: "Русский" },
  ko: { translation: ko, emoji: "🇰🇷", label: "한국어" },
  af: { translation: af, emoji: "🇦🇫", label: "Afgan" },
  ar: { translation: ar, emoji: "🇦🇪", label: "العربية" },
  el: { translation: el, emoji: "🇬🇷", label: "Ελληνικά" },
  hi: { translation: hi, emoji: "🇮🇳", label: "हिन्दी" },
  nl: { translation: nl, emoji: "🇳🇱", label: "Nederlands" },
  pl: { translation: pl, emoji: "🇵🇱", label: "Polski" },
  ro: { translation: ro, emoji: "🇷🇴", label: "Română" },
  sq: { translation: sq, emoji: "🇦🇱", label: "Shqip" },
  uk: { translation: uk, emoji: "🇺🇦", label: "Українська" },
  vi: { translation: vi, emoji: "🇻🇳", label: "Tiếng Việt" },
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
