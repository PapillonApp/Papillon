export function formatSchoolName(input: string): string {
  if (!input) return "";

  let name = input.trim();

  // Normalize spaces
  name = name.replace(/\s+/g, " ");

  // Remove unwanted segments
  name = name
    .replace(/\b(general et technologique|general|technologique|professionnel)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize casing
  name = name.toLowerCase();

  // Replace keywords
  name = name
    .replace(/\blycee\b/g, "Lycée")
    .replace(/\bcollege\b/g, "Collège");

  // Capitalize words (except small words)
  const SMALL_WORDS = ["de", "du", "des", "la", "le", "les", "d'", "l'"];

  name = name
    .split(" ")
    .map((word, i) => {
      if (!word) return "";

      // Handle apostrophes (d', l')
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part, idx) => {
            if (idx === 0 && SMALL_WORDS.includes(part + "'")) {
              return part.toLowerCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join("'");
      }

      if (SMALL_WORDS.includes(word) && i !== 0) {
        return word.toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  // Final cleanup
  name = name
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();

  return name;
}