import { IntentDef } from "papillon-intents";

export const intents: IntentDef[] = [
  {
    id: "getTodayTimetable",
    action: "timetable.getToday",
    title: "Mes cours d'aujourd'hui",
    description: "Récupère les cours d'aujourd'hui depuis Papillon.",
    phrases: [
      "Mon emploi du temps aujourd'hui dans ${applicationName}",
      "Mes cours d'aujourd'hui dans ${applicationName}",
      "Qu'est-ce que j'ai comme cours aujourd'hui dans ${applicationName}",
    ],
    shortTitle: "Cours aujourd'hui",
    systemImage: "calendar",
    openAppWhenRun: false,
    requiresAuth: true,
    timeoutMs: 25000,
    parameters: [],
    returns: {
      type: "entityList",
      entity: "course",
      dialog: "${count} cours aujourd'hui.",
    },
  },
  {
    id: "getTimetableForDay",
    action: "timetable.getForDay",
    title: "Mes cours pour un jour précis",
    description: "Récupère les cours d'un jour précis depuis Papillon.",
    phrases: [
      "Mes cours pour un jour précis dans ${applicationName}",
      "Mon emploi du temps d'un jour dans ${applicationName}",
    ],
    shortTitle: "Cours du jour",
    systemImage: "calendar.badge.clock",
    openAppWhenRun: false,
    requiresAuth: true,
    timeoutMs: 25000,
    parameters: [{ name: "day", type: "string", title: "Jour (JJ/MM/AAAA)" }],
    returns: {
      type: "entityList",
      entity: "course",
      dialog: "${count} cours ce jour-là.",
    },
  },
];