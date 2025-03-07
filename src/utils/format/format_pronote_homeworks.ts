import { latexVocabulary } from "@/consts/LatexVocabulary";

type SupportedTags = {
  [key: string]: string | ((text: string) => string);
};

function parse_homeworks (content: string): string {
  const supportedTags: SupportedTags = {
    br: "\n",
    strong: (text: string) => `**${text}**`,
    sub: (text: string) => `_{${text}}`,
    sup: (text: string) => `^{${text}}`,
  };

  const ignoredTags: Set<string> = new Set(["div", "span", "style", "script", "footer", "header"]);

  const tagRegex = /<\/?([a-zA-Z]+)(?:\s[^>]*)?>|([^<]+)/gm;

  const htmlEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&quot;": "\"",
    "&#039;": "'",
    ...latexVocabulary
  };

  // Décodage des entités HTML
  function decodeHtmlEntities (text: string): string {
    return text
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&([a-zA-Z]+);/g, (_, entity) => htmlEntities[entity] || `&${entity};`)
      .replace(/[\u2200-\u22FF\u03B1-\u03C9]/g, match => latexVocabulary[match] || match);
  }

  let result = "";
  const stack: Array<{ tag: string; children: string[] }> = [];

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(content)) !== null) {
    const [fullMatch, tagName, text] = match;

    if (text) {
      // Texte brut entre balises
      const decodedText = decodeHtmlEntities(text);
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(decodedText);
      } else {
        result += decodedText;
      }
    } else if (tagName) {
      const tag = tagName.toLowerCase();
      const isClosingTag = fullMatch.startsWith("</");

      if (isClosingTag) {
        // Balise fermante
        if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
          const { tag: currentTag, children } = stack.pop()!;
          const processedContent = children.join("");

          if (supportedTags[currentTag]) {
            if (typeof supportedTags[currentTag] === "string") {
              result += supportedTags[currentTag];
            } else {
              result += (supportedTags[currentTag] as (text: string) => string)(processedContent);
            }
          }
        }
      } else {
        // Balise ouvrante ou auto-fermante
        if (ignoredTags.has(tag)) {
          continue; // Ignore les balises non supportées
        }

        if (supportedTags[tag]) {
          if (typeof supportedTags[tag] === "string") {
            result += supportedTags[tag];
          } else {
            stack.push({ tag, children: [] });
          }
        }
      }
    }
  }

  // Traite les balises non fermées restantes
  while (stack.length > 0) {
    const { tag, children } = stack.pop()!;
    if (supportedTags[tag] && typeof supportedTags[tag] === "function") {
      result += (supportedTags[tag] as (text: string) => string)(children.join(""));
    }
  }

  // Nettoyage des sauts de ligne en excès
  return result.replace(/\n{2,}/g, "").trim();
}

export default parse_homeworks;
