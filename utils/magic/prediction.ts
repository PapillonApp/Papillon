import { useMagicStore } from "@/stores/magic";
import ModelManager, { ModelPrediction } from "./ModelManager";
import { generateId } from "../generateId";
import regexPatterns from "./regex/homeworks.json";

const compiledPatterns: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(regexPatterns).map(([category, patterns]) => [
    category,
    (patterns as string[]).map(p => new RegExp(p, "i"))
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

export async function predictHomework(label: string): Promise<string> {
  const store = useMagicStore.getState();
  const homeworkId = generateId(label);

  const existingHomework = store.getHomework(homeworkId);
  if (existingHomework) return existingHomework.label;

  const cleanedHomework = ModelManager.cleanText(label);

  for (const [category, regexList] of Object.entries(compiledPatterns)) {
    if (regexList.some(rgx => rgx.test(cleanedHomework))) {
      store.addHomework({ id: homeworkId, label: category });
      return category;
    }
  }

  await ModelManager.init();
  const prediction = await ModelManager.predict(cleanedHomework);

  const finalLabel =
    isModelPrediction(prediction) && prediction.predicted !== "null"
      ? prediction.predicted
      : "";

  store.addHomework({ id: homeworkId, label: finalLabel });
  return finalLabel;
}
