import detectionJson from "@/utils/magic/regex/evaldetection.json";

type DetectionJson = Record<string, string[]>;

const detectionData: DetectionJson = detectionJson;

function detectCategory (input: string): string | null {
  for (const [category, patterns] of Object.entries(detectionData)) {
    if (patterns.some(pattern => new RegExp(pattern, "i").test(input))) {
      return category;
    }
  }

  return null;
}

export default detectCategory;
