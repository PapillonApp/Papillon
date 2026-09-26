import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import af from "@/locales/af.json";
import ar from "@/locales/ar.json";
import bg from "@/locales/bg.json";
import bn from "@/locales/bn.json";
import br from "@/locales/br.json";
import cs from "@/locales/cs.json";
import da from "@/locales/da.json";
import de from "@/locales/de.json";
import el from "@/locales/el.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import et from "@/locales/et.json";
import fa from "@/locales/fa.json";
import fi from "@/locales/fi.json";
import fr from "@/locales/fr.json";
import he from "@/locales/he.json";
import hi from "@/locales/hi.json";
import hr from "@/locales/hr.json";
import hu from "@/locales/hu.json";
import id from "@/locales/id.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import ms from "@/locales/ms.json";
import nl from "@/locales/nl.json";
import no from "@/locales/no.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import ro from "@/locales/ro.json";
import ru from "@/locales/ru.json";
import sk from "@/locales/sk.json";
import sq from "@/locales/sq.json";
import sv from "@/locales/sv.json";
import sw from "@/locales/sw.json";
import th from "@/locales/th.json";
import tr from "@/locales/tr.json";
import uk from "@/locales/uk.json";
import ur from "@/locales/ur.json";
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
  af: { translation: af, emoji: "🇿🇦", label: "Afrikaans" },
  ar: { translation: ar, emoji: "🇦🇪", label: "العربية" },
  el: { translation: el, emoji: "🇬🇷", label: "Ελληνικά" },
  hi: { translation: hi, emoji: "🇮🇳", label: "हिन्दी" },
  nl: { translation: nl, emoji: "🇳🇱", label: "Nederlands" },
  pl: { translation: pl, emoji: "🇵🇱", label: "Polski" },
  ro: { translation: ro, emoji: "🇷🇴", label: "Română" },
  sq: { translation: sq, emoji: "🇦🇱", label: "Shqip" },
  uk: { translation: uk, emoji: "🇺🇦", label: "Українська" },
  vi: { translation: vi, emoji: "🇻🇳", label: "Tiếng Việt" },
  bg: { translation: bg, emoji: "🇧🇬", label: "Български" },
  bn: { translation: bn, emoji: "🇧🇩", label: "বাংলা" },
  cs: { translation: cs, emoji: "🇨🇿", label: "Čeština" },
  da: { translation: da, emoji: "🇩🇰", label: "Dansk" },
  fi: { translation: fi, emoji: "🇫🇮", label: "Suomi" },
  he: { translation: he, emoji: "✡️", label: "עברית" },
  hu: { translation: hu, emoji: "🇭🇺", label: "Magyar" },
  id: { translation: id, emoji: "🇮🇩", label: "Bahasa Indonesia" },
  no: { translation: no, emoji: "🇳🇴", label: "Norsk" },
  sk: { translation: sk, emoji: "🇸🇰", label: "Slovenčina" },
  sv: { translation: sv, emoji: "🇸🇪", label: "Svenska" },
  th: { translation: th, emoji: "🇹🇭", label: "ไทย" },
  fa: { translation: fa, emoji: "🇮🇷", label: "فارسی" },
  ur: { translation: ur, emoji: "🇵🇰", label: "اردو" },
  ms: { translation: ms, emoji: "🇲🇾", label: "Bahasa Malaysia" },
  sw: { translation: sw, emoji: "🇹🇿", label: "Swahili" },
  hr: { translation: hr, emoji: "🇭🇷", label: "Hrvatski" },
  et: { translation: et, emoji: "🇪🇪", label: "Eesti" },
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
    fallbackLng: ["en", "fr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["languageDetector"],
    },
  });

export default i18n;
