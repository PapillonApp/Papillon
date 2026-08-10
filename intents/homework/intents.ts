import { IntentDef } from "papillon-intents";

export const intents: IntentDef[] = [
  {
    id: "getTodayHomework",
    action: "homework.getToday",
    title: "Mes devoirs pour aujourd'hui",
    description:
      "Récupère les devoirs à faire pour aujourd'hui depuis Papillon.",
    phrases: [
      "Mes devoirs pour aujourd'hui dans ${applicationName}",
      "Qu'est-ce que j'ai à faire aujourd'hui dans ${applicationName}",
    ],
    shortTitle: "Devoirs aujourd'hui",
    systemImage: "book.closed",
    openAppWhenRun: false,
    requiresAuth: true,
    timeoutMs: 25000,
    parameters: [],
    returns: {
      type: "entityList",
      entity: "homework",
      dialog: "${count} devoir(s) pour aujourd'hui.",
    },
  },
  {
    id: "getHomeworkForDate",
    action: "homework.getForDate",
    title: "Mes devoirs pour une date",
    description:
      "Récupère les devoirs à faire pour une date précise depuis Papillon.",
    phrases: [
      "Mes devoirs pour une date précise dans ${applicationName}",
      "Qu'est-ce que j'ai à faire ce jour dans ${applicationName}",
    ],
    shortTitle: "Devoirs pour le",
    systemImage: "book.closed.fill",
    openAppWhenRun: false,
    requiresAuth: true,
    timeoutMs: 25000,
    parameters: [{ name: "date", type: "string", title: "Date (JJ/MM/AAAA)" }],
    returns: {
      type: "entityList",
      entity: "homework",
      dialog: "${count} devoir(s) pour cette date.",
    },
  },
];