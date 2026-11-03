import type { ICalEvent } from "../../ical";
import type { ParsedEventData } from "../../event-converter";

const TYPES_LABELS: Record<string, string> = {
  CM: "Cours magistral",
  TD: "Travail dirigé",
  TP: "Travail pratique",
  DS: "Devoir surveillé",
  Autonomie: "Autonomie",
  "Eval-CM": "Évaluation",
  "Eval-TD": "Évaluation",
  "Eval-TP": "Évaluation",
};
const TYPE_TOKENS = Object.keys(TYPES_LABELS);

// Un groupe ressemble à "BUT2-G1" ou "BUT2-G1.BUT2-G2.JS" (séparés par des points)
const GROUPS_TOKEN = /^BUT\d-G\d[\w.-]*$/;

// Parser des plannings iCal du BUT MMI de l'IUT du Limousin.
// Exemples de SUMMARY (après désérialisation de "\,") :
//   "R3.DWeb-DI.13 TD MORA Frédéric, BUT2-G3"
//   "SAÉ 4.Crea.01 Autonomie NON AFFECTE, BUT2-G2"
//   "PORTFOLIO S1 TD LAVEFVE Valérie, BUT1-G3.BUT1-G4"
//   "[ANNULE] R1.10 TD BEVERINI Johan, BUT1-G1.BUT1-G2"
//   "R5.04 TD BUT3-G3"            <- pas de prof, pas de virgule
//   "Trombinoscope, BUT1-G1.BUT1-G2"
export function parseMMILimousinIcal(event: ICalEvent): ParsedEventData | null {
  let text = (event.summary || "").trim();
  if (!text) { return null; }

  // 1. Statut "[ANNULE]" en préfixe
  const canceled = /^\[ANNUL[ÉE]E?\]\s*/i.test(text);
  text = text.replace(/^\[ANNUL[ÉE]E?\]\s*/i, "");

  // 2. Groupes : après la dernière virgule, sinon dernier mot s'il ressemble à un groupe
  let left = text;
  let groupsRaw = "";
  const lastComma = text.lastIndexOf(",");
  if (lastComma !== -1) {
    left = text.slice(0, lastComma).trim();
    groupsRaw = text.slice(lastComma + 1).trim();
  } else {
    const words = text.split(/\s+/);
    if (GROUPS_TOKEN.test(words[words.length - 1])) {
      groupsRaw = words.pop() as string;
      left = words.join(" ");
    }
  }
  const groups = groupsRaw.split(".").filter(Boolean);

  // 3. Le type (CM/TD/TP/...) sépare "le nom du cours" du "prof"
  const tokens = left.split(/\s+/).filter(Boolean);
  const typeIndex = tokens.findIndex((t, i) => i > 0 && TYPE_TOKENS.includes(t));

  let name: string;
  let type: string | undefined;
  let teacher: string | undefined;

  if (typeIndex !== -1) {
    name = tokens.slice(0, typeIndex).join(" ");
    type = tokens[typeIndex];
    teacher = tokens.slice(typeIndex + 1).join(" ");
  } else {
    name = left; // ex. "Trombinoscope", "BUT1 RENTREE MORA Frédéric"
  }

  if (!teacher || teacher === "NON AFFECTE") { teacher = undefined; }
  const label = type ? TYPES_LABELS[type] : undefined;

  return {
    summary: name,
    type: label ?? "Activité",
    // Un cours annulé est signalé par son statut personnalisé
    courseType: canceled ? "Annulé" : label,
    teacher: teacher ?? "Inconnu",
    group: groups.join(", "),
  };
}
