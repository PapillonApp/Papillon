import { latexVocabulary } from "@/consts/LatexVocabulary";

type SupportedTags = {
  [key: string]: string | ((text: string) => string);
};

const SUPPORTED_TAGS: SupportedTags = {
  br: "\n",
  strong: (text: string) => `**${text}**`,
  sub: (text: string) => `_{${text}}`,
  sup: (text: string) => `^{${text}}`,
};

const IGNORED_TAGS = new Set([
  "div",
  "span",
  "style",
  "script",
  "footer",
  "header",
]);

const TAG_REGEX = /<\/?([a-zA-Z]+)(?:\s[^>]*)?>|([^<]+)/g;
const NUMERIC_ENTITY_REGEX = /&#(\d+);/g;
const NAMED_ENTITY_REGEX = /&([a-zA-Z]+);/g;
const UNICODE_SYMBOLS_REGEX = /[\u2200-\u22FF\u03B1-\u03C9]/g;
const MULTI_NEWLINE_REGEX = /\n{2,}/g;

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&quot;": "\"",
  "&#039;": "'",
  ...latexVocabulary,
};

const DECODE_CACHE = new Map<string, string>();

function parse_homeworks (content: string): string {
  let result = "";
  const stack: Array<{ tag: string; children: string[] }> = [];
  let lastIndex = 0;

  content.replace(TAG_REGEX, (fullMatch, tagName, text, offset) => {
    // Add any text between matches
    if (offset > lastIndex) {
      const betweenText = content.slice(lastIndex, offset);
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(betweenText);
      } else {
        result += betweenText;
      }
    }
    lastIndex = offset + fullMatch.length;

    if (text) {
      let decodedText = DECODE_CACHE.get(text);
      if (!decodedText) {
        decodedText = decodeHtmlEntities(text);
        DECODE_CACHE.set(text, decodedText);
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(decodedText);
      } else {
        result += decodedText;
      }
    } else if (tagName) {
      const tag = tagName.toLowerCase();
      const isClosingTag = fullMatch.startsWith("</");

      if (isClosingTag) {
        // Process closing tag
        if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
          const { tag: currentTag, children } = stack.pop()!;
          const processedContent = children.join("");

          const handler = SUPPORTED_TAGS[currentTag];
          if (typeof handler === "string") {
            result += handler;
          } else if (handler) {
            result += handler(processedContent);
          }
        }
      } else if (!IGNORED_TAGS.has(tag)) {
        // Process opening tag
        const handler = SUPPORTED_TAGS[tag];
        if (handler) {
          if (typeof handler === "string") {
            result += handler;
          } else {
            stack.push({ tag, children: [] });
          }
        }
      }
    }

    return "";
  });

  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(remainingText);
    } else {
      result += remainingText;
    }
  }

  while (stack.length > 0) {
    const { tag, children } = stack.pop()!;
    const handler = SUPPORTED_TAGS[tag];
    if (typeof handler === "function") {
      result += handler(children.join(""));
    }
  }

  return result.replace(MULTI_NEWLINE_REGEX, "").trim();
}

function decodeHtmlEntities (text: string): string {
  return text
    .replace(NUMERIC_ENTITY_REGEX, (_, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    )
    .replace(
      NAMED_ENTITY_REGEX,
      (_, entity) => HTML_ENTITIES[`&${entity};`] || `&${entity};`
    )
    .replace(UNICODE_SYMBOLS_REGEX, (match) => HTML_ENTITIES[match] || match);
}

export default parse_homeworks;
