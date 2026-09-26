export function formatSchoolName(input: string): string {
  if (!input) return "";

  const SMALL_WORDS = new Set([
    "de", "du", "des", "la", "le", "les", "et", "en",
    "au", "aux", "sur", "sous", "par", "pour",
  ]);

  let name = input.trim().replace(/\s+/g, " ");

  // Normalize separator hyphens (only when at least one adjacent space exists)
  // "PROFESSIONNELLE- ESRP" → "PROFESSIONNELLE - ESRP"
  // "HOLLANDER-LAFON" is left untouched
  name = name.replace(/\s+-\s*|\s*-\s+/g, " - ");

  name = name
    .split(" ")
    .map((token, i) => {
      if (!token || token === "-") return token;

      // Separate leading/trailing non-letter punctuation (e.g. quotes, periods at boundary)
      const lead = token.match(/^[^A-ZÀ-Ÿa-zà-ÿ]*/i)![0];
      const trail = token.match(/[^A-ZÀ-Ÿa-zà-ÿ]*$/i)![0];
      const core = token.slice(lead.length, token.length - trail.length);

      if (!core) return token;

      const isFirst = i === 0 || lead.length > 0;
      const lower = core.toLowerCase();
      const letters = lower.replace(/[^a-zà-ÿ]/g, "");

      // Dotted abbreviations: L.P., U.G.A., TECH.
      if (/^([a-zA-ZÀ-ÿ]\.){2,}$/.test(lower) || /^[a-z]{2,5}\.$/.test(lower)) {
        return lead + core.toUpperCase() + trail;
      }

      // Apostrophe: l'École, d'Artagnan
      if (core.includes("'")) {
        const parts = lower.split("'");
        const formatted = parts
          .map((part, idx) => {
            if (idx === 0) return isFirst ? part.charAt(0).toUpperCase() + part.slice(1) : part;
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join("'");
        return lead + formatted + trail;
      }

      // Short word (≤3 letters): keep uppercase unless it's a known small word
      if (letters.length <= 3) {
        if (!isFirst && SMALL_WORDS.has(letters)) return lead + lower + trail;
        if (!SMALL_WORDS.has(letters)) return lead + core.toUpperCase() + trail;
      }

      // Small word not at start
      if (!isFirst && SMALL_WORDS.has(letters)) return lead + lower + trail;

      // Default: title-case, capitalizing each hyphen-separated part
      const titled = lower
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
      return lead + titled + trail;
    })
    .join(" ");

  return name.replace(/\s{2,}/g, " ").trim();
}
