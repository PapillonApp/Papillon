import { IntentDef } from "papillon-intents";

export const intents: IntentDef[] = [
  {
    id: "getLatestGrades",
    action: "grades.getLatest",
    title: "Mes dernières notes",
    description: "Récupère et lit les dernières notes depuis Papillon.",
    phrases: [
      "Mes notes dans ${applicationName}",
      "Quelles sont mes dernières notes dans ${applicationName}",
      "Montre mes notes dans ${applicationName}",
    ],
    shortTitle: "Notes",
    systemImage: "list.number",
    openAppWhenRun: false,
    requiresAuth: true,
    timeoutMs: 25000,
    parameters: [],
    returns: {
      type: "entityList",
      entity: "grade",
      dialog: "${count} notes récupérées.",
    },
  },
];