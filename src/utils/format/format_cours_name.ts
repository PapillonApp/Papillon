const lessonFormatsLookup: Record<string, any> = {};
const lesson_formats = require("../data/lesson_formats.json");

// Build a lookup table once at module load time
for (const item of lesson_formats) {
  for (const format of item.formats.default) {
    const key = format.toLowerCase();
    if (!lessonFormatsLookup[key]) {
      lessonFormatsLookup[key] = item;
    }
  }
}

const processedStringCache: Record<string, any> = {};

const regexPatterns = {
  specialChars: /[^a-zA-Z0-9 ]/g,
  spaces: /\s+/g,
  parentheses: /\(.*\)/g,
  lvPattern: /lv\d/gi,
  splitMarker: />/,
  accentNormalization: /[\u0300-\u036f]/g,
  punctuation: /[,._]/g,
};

const upperCaseTerms = new Set([
  "CM",
  "TD",
  "TP",
  "LV1",
  "LV2",
  "LV3",
  "LVA",
  "LVB",
  "LVC",
  "SAE",
  "PPP",
]);

const uppercaseFirst = (txt: string): string =>
  txt.charAt(0).toUpperCase() + txt.slice(1);

const removeSpaces = (text: string): string =>
  text.replace(regexPatterns.spaces, "");

function processInputString (pronoteString: string): string {
  // Check cache first
  const cacheKey = `proc_${pronoteString}`;
  if (processedStringCache[cacheKey]) {
    return processedStringCache[cacheKey];
  }

  // Processing pipeline
  let result = pronoteString
    .replace(regexPatterns.punctuation, " ")
    .trim()
    .toLowerCase()
    .split(regexPatterns.splitMarker)[0]
    .trim()
    .replace(regexPatterns.lvPattern, "")
    .trim()
    .replace(regexPatterns.parentheses, "")
    .trim()
    .normalize("NFD")
    .replace(regexPatterns.accentNormalization, "")
    .replace(regexPatterns.specialChars, " ")
    .trim()
    .replace(regexPatterns.spaces, " ");

  // Cache the result
  processedStringCache[cacheKey] = result;
  return result;
}

function findObjectByPronoteString (pronoteString = "") {
  const processedString = processInputString(pronoteString);

  // Direct lookup from pre-built index
  const foundItem = lessonFormatsLookup[processedString];
  if (foundItem) {
    return foundItem;
  }

  return {
    label: removeSpaces(processedString),
    pretty: formatPretty(processedString),
    formats: {},
  };
}

function formatPretty (text: string): string {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (upperCaseTerms.has(word.toUpperCase())) {
      words[i] = word.toUpperCase();
    } else {
      words[i] = uppercaseFirst(word);
    }
  }
  return words.join(" ");
}

function getCourseSpeciality (pronoteString = ""): string | null {
  if (!pronoteString.includes(">")) return null;

  const parts = pronoteString.split(regexPatterns.splitMarker);
  if (parts.length < 2) return null;

  let newPrnString = parts[parts.length - 1].trim().toLowerCase();
  if (!newPrnString) return null;

  if (newPrnString.includes("expression")) {
    newPrnString = newPrnString.replace("expression", "expr.");
  }
  if (newPrnString.includes("compréhension")) {
    newPrnString = newPrnString.replace("compréhension", "comp.");
  }
  if (newPrnString.includes("ecrit")) {
    newPrnString = newPrnString.replace("ecrit", "écrit");
  }
  if (newPrnString.includes("sae")) {
    newPrnString = newPrnString.replace("sae", "saé");
  }

  return formatPretty(newPrnString);
}

export default findObjectByPronoteString;
export { getCourseSpeciality };
