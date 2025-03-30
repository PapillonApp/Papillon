import { useCurrentAccount } from "@/stores/account";
import findObjectByPronoteString from "@/utils/format/format_cours_name";

export const COLORS_LIST = ["#D1005A", "#BE4541", "#D54829", "#F46E00", "#B2641F", "#D18800", "#BEA541", "#E5B21A", "#B2BE41", "#94BE41", "#5CB21F", "#32CB10", "#1FB28B", "#6DA2E3", "#0099D1", "#1F6DB2", "#4E339E", "#7941BE", "#CC33BF", "#BE417F", "#E36DB8", "#7F7F7F"];

export const getRandColor = () => {
  return COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
};

const getClosestGradeEmoji = (subjectName: string): string => {
  const gradeEmojiList: Record<string, string> = {
    numerique: "💻",
    SI: "💻",
    SNT: "💻",
    travaux: "⚒",
    travail: "💼",
    moral: "⚖️",
    env: "🌿",
    sport: "🏀",
    EPS: "🏀",
    econo: "📈",
    francais: "📚",
    anglais: "🇬🇧",
    allemand: "🇩🇪",
    espagnol: "🇪🇸",
    latin: "🏛️",
    italien: "🇮🇹",
    histoire: "📜",
    EMC: "🤝",
    hist: "📜",
    llc: "🌍",
    scientifique: "🔬",
    arts: "🎨",
    philosophie: "🤔",
    math: "📐",
    phys: "🧪",
    accomp: "👨‍🏫",
    tech: "🔧",
    ingenieur: "🔧",
    musique: "🎼",
    musical: "🎼",
    classe: "🏫",
    vie: "🧬",
    SES: "💰",
    stage: "👔",
    œuvre: "🖼️",
    default: "📝",
    developpement: "👨‍💻",
    culture: "🧠",
    gestion: "💼",
    traitement: "📊",
    sae: "📚",
    expression: "🎭",
    ppp: "🧑‍🏫",
  };

  const subjectNameFormatted: string = subjectName
    .toLowerCase()
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // sort keys by length in descending order
  const sortedKeys: string[] = Object.keys(gradeEmojiList).sort((a, b) => b.length - a.length);

  // get emoji with key in subject name
  const closest: string = sortedKeys.find((key) => subjectNameFormatted.includes(key)) || "default";

  return gradeEmojiList[closest];
};

export const getSubjectData = (subject: string) => {
  const state = useCurrentAccount.getState();
  const account = state.account!;
  const mutateProperty = state.mutateProperty;

  if (!subject.trim()) {
    return {
      color: "#888888",
      pretty: "Matière inconnue",
      emoji: "❓",
    };
  }

  if (account.personalization.subjects && subject in account.personalization.subjects) {
    return account.personalization.subjects[subject];
  }

  const formattedCoursName = findObjectByPronoteString(subject);
  const color = getRandColor();
  const emoji = getClosestGradeEmoji(subject);

  mutateProperty("personalization", {
    subjects: {
      ...account.personalization.subjects,
      [subject]: {
        color,
        pretty: formattedCoursName.pretty,
        emoji: emoji,
      },
    },
  });

  return {
    color,
    pretty: formattedCoursName.pretty,
    emoji,
  };
};
