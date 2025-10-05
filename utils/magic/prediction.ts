import * as Battery from "expo-battery";

import { useMagicStore } from "@/stores/magic";

import { generateId } from "../generateId";
import ModelManager, { ModelPrediction } from "./ModelManager";
import regexPatterns from "./regex/homeworks.json";

const compiledPatterns: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(regexPatterns).map(([category, patterns]) => [
    category,
    (patterns as string[]).map(p => new RegExp(p, "i")),
  ])
);

export function isModelPrediction(object: unknown): object is ModelPrediction {
  return (
    typeof object === "object" &&
    object !== null &&
    Array.isArray((object as any).scores) &&
    typeof (object as any).predicted === "string" &&
    typeof (object as any).labelScores === "object" &&
    (object as any).labelScores !== null
  );
}

export async function predictHomework(label: string, magicEnabled: boolean = true): Promise<string> {
  const store = useMagicStore.getState();
  const homeworkId = generateId(label);
  const existingHomework = store.getHomework(homeworkId);
  
  if (existingHomework) {
    return existingHomework.label;
  }

  if (!magicEnabled) {
    return "";
  }

  let batteryLevel: number;
  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
  } catch {
    batteryLevel = 1;
  }

  // Si batterie < 10%, on utilise le regex
  if (batteryLevel < 0.1) {
    for (const [category, regexList] of Object.entries(compiledPatterns)) {
      if (regexList.some(rgx => rgx.test(label))) {
        store.addHomework({ id: homeworkId, label: category });
        return category;
      }
    }
    store.addHomework({ id: homeworkId, label: "" });
    return "";
  }

  const prediction = await ModelManager.predict(label);

  const beautifyLabel = (rawLabel: string): string => {
    const labelMap: Record<string, string> = {
      'evaluation': 'Évaluation',
      'finaltask': 'Tâche finale',
      'homework': 'Devoir Maison',
      'null': 'null',
      'oral': 'Présentation orale',
      'sheets': 'Fiche',
    };
    
    return labelMap[rawLabel.toLowerCase()] || rawLabel
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const finalLabel =
    isModelPrediction(prediction) && prediction.predicted !== "null"
      ? beautifyLabel(prediction.predicted)
      : "";

  store.addHomework({ id: homeworkId, label: finalLabel });
  return finalLabel;
}