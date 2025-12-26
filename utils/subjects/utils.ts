import lessonFormats from "./lesson_formats.json";

// Cache for normalized subject names
const normalizationCache = new Map<string, string>();

// Cache for cleaned subject names
const cleanNameCache = new Map<string, string>();

// Pre-computed lookup map for lesson formats
// Maps normalized subject name -> { pretty: string, emoji: string }
const formatLookup = new Map<string, { pretty: string; emoji: string }>();

// Initialize the lookup map once
(function initializeFormatLookup() {
  for (const format of lessonFormats) {
    const normalizedLabel = normalizeSubjectNameInternal(format.label);
    const data = { pretty: format.pretty, emoji: format.emoji };
    
    // Map the label itself
    if (!formatLookup.has(normalizedLabel)) {
      formatLookup.set(normalizedLabel, data);
    }

    // Map all variations
    for (const variant of format.formats) {
      const normalizedVariant = normalizeSubjectNameInternal(variant);
      if (!formatLookup.has(normalizedVariant)) {
        formatLookup.set(normalizedVariant, data);
      }
    }
  }
})();

// Internal normalization function (not cached itself, used by cache wrapper)
function normalizeSubjectNameInternal(subject: string): string {
  if (!subject) return "";
  return subject
    .split(/\s*[>|]\s*/)[0]
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "")
    .replace(/s$/, "");
}

export function normalizeSubjectName(subject: string): string {
  if (!subject) return "";
  if (normalizationCache.has(subject)) {
    return normalizationCache.get(subject)!;
  }
  const result = normalizeSubjectNameInternal(subject);
  normalizationCache.set(subject, result);
  return result;
}

export function cleanSubjectName(subject: string): string {
  if (!subject) return subject;
  if (cleanNameCache.has(subject)) {
    return cleanNameCache.get(subject)!;
  }
  
  const result = subject
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "");
    
  cleanNameCache.set(subject, result);
  return result;
}

export function getSubjectFormat(subject: string) {
  const normalized = normalizeSubjectName(subject);
  return formatLookup.get(normalized);
}
