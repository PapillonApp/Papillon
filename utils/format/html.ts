export interface HomeworkTextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlightColor?: string;
  href?: string;
}

export interface HomeworkTextSpan {
  text: string;
  style: HomeworkTextStyle;
}

const DEFAULT_HIGHLIGHT_COLOR = "rgba(255, 235, 59, 0.35)";

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ensp;": " ",
  "&emsp;": " ",
  "&thinsp;": " ",
  "&eacute;": "é",
  "&egrave;": "è",
  "&ecirc;": "ê",
  "&euml;": "ë",
  "&Eacute;": "É",
  "&Egrave;": "È",
  "&Ecirc;": "Ê",
  "&Euml;": "Ë",
  "&agrave;": "à",
  "&acirc;": "â",
  "&auml;": "ä",
  "&aacute;": "á",
  "&Agrave;": "À",
  "&Acirc;": "Â",
  "&Auml;": "Ä",
  "&Aacute;": "Á",
  "&ugrave;": "ù",
  "&ucirc;": "û",
  "&uuml;": "ü",
  "&uacute;": "ú",
  "&Ugrave;": "Ù",
  "&Ucirc;": "Û",
  "&Uuml;": "Ü",
  "&Uacute;": "Ú",
  "&icirc;": "î",
  "&iuml;": "ï",
  "&iacute;": "í",
  "&igrave;": "ì",
  "&Icirc;": "Î",
  "&Iuml;": "Ï",
  "&Iacute;": "Í",
  "&ocirc;": "ô",
  "&ouml;": "ö",
  "&oacute;": "ó",
  "&ograve;": "ò",
  "&Ocirc;": "Ô",
  "&Ouml;": "Ö",
  "&Oacute;": "Ó",
  "&ccedil;": "ç",
  "&Ccedil;": "Ç",
  "&oelig;": "œ",
  "&OElig;": "Œ",
  "&aelig;": "æ",
  "&AElig;": "Æ",
  "&ntilde;": "ñ",
  "&Ntilde;": "Ñ",
  "&yuml;": "ÿ",
  "&szlig;": "ß",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&sbquo;": "‚",
  "&bdquo;": "„",
  "&laquo;": "«",
  "&raquo;": "»",
  "&lsaquo;": "‹",
  "&rsaquo;": "›",
  "&ndash;": "–",
  "&mdash;": "—",
  "&minus;": "−",
  "&hellip;": "…",
  "&euro;": "€",
  "&deg;": "°",
  "&times;": "×",
  "&divide;": "÷",
  "&plusmn;": "±",
  "&frac12;": "½",
  "&frac14;": "¼",
  "&frac34;": "¾",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&bull;": "•",
  "&middot;": "·",
  "&sect;": "§",
  "&sup2;": "²",
  "&sup3;": "³",
  "&larr;": "←",
  "&rarr;": "→",
  "&uarr;": "↑",
  "&darr;": "↓",
};

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "tr",
]);

const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link", "wbr"]);

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

const TAG_OR_COMMENT_REGEX =
  /<!--[\s\S]*?-->|<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^<>]*)?\/?>/g;

export function decodeHTMLEntities(input: string): string {
  if (!input) {
    return "";
  }

  return input.replace(
    /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]+));/g,
    (entity, decStr?: string, hexStr?: string) => {
      if (decStr) {
        const code = Number.parseInt(decStr, 10);
        if (code >= 0 && code <= 0x10ffff) {
          return String.fromCodePoint(code);
        }
        return entity;
      }

      if (hexStr) {
        const code = Number.parseInt(hexStr, 16);
        if (code >= 0 && code <= 0x10ffff) {
          return String.fromCodePoint(code);
        }
        return entity;
      }

      if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, entity)) {
        return NAMED_ENTITIES[entity];
      }

      return entity;
    }
  );
}

function extractAttribute(attrs: string, name: string): string | undefined {
  const regex = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + "`" + `]+))`,
    "i"
  );
  const match = attrs.match(regex);
  if (!match) {
    return undefined;
  }
  return match[1] ?? match[2] ?? match[3];
}

function sanitizeHref(rawHref: string | undefined): string | undefined {
  if (!rawHref) {
    return undefined;
  }
  const decoded = decodeHTMLEntities(rawHref).trim();
  const lower = decoded.toLowerCase();
  if (SAFE_LINK_PROTOCOLS.some(protocol => lower.startsWith(protocol))) {
    return decoded;
  }
  return undefined;
}

function sanitizeColor(rawColor: string | undefined): string | undefined {
  if (!rawColor) {
    return undefined;
  }
  const value = rawColor.trim();
  const lower = value.toLowerCase();
  if (
    lower === "transparent" ||
    lower === "inherit" ||
    lower === "initial" ||
    lower === "unset" ||
    lower === "none"
  ) {
    return undefined;
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return value;
  }
  if (/^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s]+\)$/.test(lower)) {
    return value;
  }
  if (/^[a-zA-Z]{3,24}$/.test(value)) {
    return lower;
  }
  return undefined;
}

function parseInlineStyle(styleAttr: string | undefined): Partial<HomeworkTextStyle> {
  if (!styleAttr) {
    return {};
  }

  const parsed: Partial<HomeworkTextStyle> = {};
  const declarations = styleAttr.split(";");

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const property = declaration.slice(0, colonIndex).trim().toLowerCase();
    const rawValue = declaration
      .slice(colonIndex + 1)
      .replace(/!important/gi, "")
      .trim();
    const lowerValue = rawValue.toLowerCase();

    if (property === "font-weight") {
      const numeric = Number.parseInt(lowerValue, 10);
      if (lowerValue === "bold" || lowerValue === "bolder" || numeric >= 600) {
        parsed.bold = true;
      } else if (lowerValue === "normal" || lowerValue === "lighter" || (!Number.isNaN(numeric) && numeric < 500)) {
        parsed.bold = false;
      }
    } else if (property === "font-style") {
      if (lowerValue === "italic" || lowerValue === "oblique") {
        parsed.italic = true;
      } else if (lowerValue === "normal") {
        parsed.italic = false;
      }
    } else if (property === "text-decoration" || property === "text-decoration-line") {
      if (lowerValue.includes("none")) {
        parsed.underline = false;
        parsed.strikethrough = false;
      }
      if (lowerValue.includes("underline")) {
        parsed.underline = true;
      }
      if (lowerValue.includes("line-through")) {
        parsed.strikethrough = true;
      }
    } else if (property === "background-color" || property === "background") {
      const color = sanitizeColor(rawValue);
      if (color) {
        parsed.highlightColor = color;
      }
    }
  }

  return parsed;
}

function isSameTextStyle(a: HomeworkTextStyle, b: HomeworkTextStyle): boolean {
  return (
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic) &&
    Boolean(a.underline) === Boolean(b.underline) &&
    Boolean(a.strikethrough) === Boolean(b.strikethrough) &&
    a.highlightColor === b.highlightColor &&
    a.href === b.href
  );
}

function resolveStyleStack(
  stack: Array<{ tag: string; style: Partial<HomeworkTextStyle> }>
): HomeworkTextStyle {
  const resolved: HomeworkTextStyle = {};
  for (const entry of stack) {
    Object.assign(resolved, entry.style);
  }
  return resolved;
}

function buildTagStyle(tag: string, attrs: string): Partial<HomeworkTextStyle> {
  const style: Partial<HomeworkTextStyle> = {};

  if (tag === "b" || tag === "strong" || HEADING_TAGS.has(tag)) {
    style.bold = true;
  } else if (tag === "i" || tag === "em") {
    style.italic = true;
  } else if (tag === "u" || tag === "ins") {
    style.underline = true;
  } else if (tag === "s" || tag === "del" || tag === "strike") {
    style.strikethrough = true;
  } else if (tag === "mark") {
    style.highlightColor = DEFAULT_HIGHLIGHT_COLOR;
  } else if (tag === "a") {
    const href = sanitizeHref(extractAttribute(attrs, "href"));
    if (href) {
      style.href = href;
      style.underline = true;
    }
  }

  const inlineStyle = parseInlineStyle(extractAttribute(attrs, "style"));
  return { ...style, ...inlineStyle };
}

function trimSpans(spans: HomeworkTextSpan[]): HomeworkTextSpan[] {
  const result = spans.map(span => ({ ...span }));

  while (result.length > 0) {
    result[0].text = result[0].text.replace(/^[\n \t]+/, "");
    if (result[0].text.length === 0) {
      result.shift();
    } else {
      break;
    }
  }

  while (result.length > 0) {
    const last = result[result.length - 1];
    last.text = last.text.replace(/[\n \t]+$/, "");
    if (last.text.length === 0) {
      result.pop();
    } else {
      break;
    }
  }

  return result;
}

interface RawToken {
  type: "text" | "tag";
  raw: string;
  tagName?: string;
  isClosing?: boolean;
  isSelfClosing?: boolean;
  attrs?: string;
}

function tokenizeHTML(html: string): RawToken[] {
  const cleaned = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const tokens: RawToken[] = [];
  let lastIndex = 0;

  TAG_OR_COMMENT_REGEX.lastIndex = 0;
  let match = TAG_OR_COMMENT_REGEX.exec(cleaned);
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        raw: cleaned.slice(lastIndex, match.index),
      });
    }

    const rawTag = match[0];
    if (!rawTag.startsWith("<!--")) {
      const inner = rawTag.slice(1, rawTag.endsWith("/>") ? -2 : -1).trim();
      const isClosing = inner.startsWith("/");
      const body = isClosing ? inner.slice(1).trim() : inner;
      const spaceIndex = body.search(/\s/);
      const tagName = (
        spaceIndex === -1 ? body : body.slice(0, spaceIndex)
      ).toLowerCase();
      const attrs = spaceIndex === -1 ? "" : body.slice(spaceIndex + 1);
      tokens.push({
        type: "tag",
        raw: rawTag,
        tagName,
        isClosing,
        isSelfClosing: rawTag.endsWith("/>") || VOID_TAGS.has(tagName),
        attrs,
      });
    }

    lastIndex = match.index + rawTag.length;
    match = TAG_OR_COMMENT_REGEX.exec(cleaned);
  }

  if (lastIndex < cleaned.length) {
    tokens.push({
      type: "text",
      raw: cleaned.slice(lastIndex),
    });
  }

  return tokens;
}

export function parseHomeworkHTML(html: string): HomeworkTextSpan[] {
  if (!html) {
    return [];
  }

  const tokens = tokenizeHTML(html);
  const hasAnyTag = tokens.some(token => token.type === "tag");

  if (!hasAnyTag) {
    const plain = decodeHTMLEntities(html)
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return plain ? [{ text: plain, style: {} }] : [];
  }

  const spans: HomeworkTextSpan[] = [];
  const styleStack: Array<{ tag: string; style: Partial<HomeworkTextStyle> }> = [];
  const listStack: Array<{ kind: "ul" | "ol"; index: number }> = [];
  let justOpenedListItem = false;

  const getTrailingNewlines = (): number => {
    let count = 0;
    for (let i = spans.length - 1; i >= 0; i--) {
      const text = spans[i].text;
      for (let j = text.length - 1; j >= 0; j--) {
        if (text[j] === "\n") {
          count += 1;
        } else {
          return count;
        }
      }
    }
    return count;
  };

  const hasContent = (): boolean => spans.some(span => span.text.length > 0);

  const appendSpan = (text: string, style: HomeworkTextStyle) => {
    if (!text) {
      return;
    }
    const last = spans[spans.length - 1];
    if (last && isSameTextStyle(last.style, style)) {
      last.text += text;
      return;
    }
    spans.push({ text, style });
  };

  const ensureLineBreak = () => {
    if (!hasContent() || getTrailingNewlines() > 0) {
      return;
    }
    appendSpan("\n", {});
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "text") {
      const prevToken = tokens[i - 1];
      const nextToken = tokens[i + 1];
      const touchesBlock =
        (prevToken?.type === "tag" && BLOCK_TAGS.has(prevToken.tagName ?? "")) ||
        (nextToken?.type === "tag" && BLOCK_TAGS.has(nextToken.tagName ?? ""));

      if (touchesBlock && /^[\s\u00a0]*\n[\s\u00a0]*$/.test(token.raw)) {
        continue;
      }

      let normalized = decodeHTMLEntities(token.raw)
        .replace(/\r\n?/g, "\n")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/[ \t]*\n[ \t]*/g, "\n");

      const trailingNewlines = getTrailingNewlines();
      if (!hasContent() || trailingNewlines > 0) {
        normalized = normalized.replace(/^[ \t]+/, "");
      }
      if (trailingNewlines >= 2) {
        normalized = normalized.replace(/^\n+/, "");
      } else if (trailingNewlines === 1) {
        normalized = normalized.replace(/^\n{2,}/, "\n");
      }

      if (normalized) {
        justOpenedListItem = false;
        appendSpan(normalized, resolveStyleStack(styleStack));
      }
      continue;
    }

    const tagName = token.tagName ?? "";

    if (token.isClosing) {
      for (let idx = styleStack.length - 1; idx >= 0; idx--) {
        if (styleStack[idx].tag === tagName) {
          styleStack.splice(idx, 1);
          break;
        }
      }

      if (tagName === "ul" || tagName === "ol") {
        for (let idx = listStack.length - 1; idx >= 0; idx--) {
          if (listStack[idx].kind === tagName) {
            listStack.splice(idx, 1);
            break;
          }
        }
        ensureLineBreak();
      } else if (BLOCK_TAGS.has(tagName)) {
        ensureLineBreak();
      }
      justOpenedListItem = false;
      continue;
    }

    if (tagName === "br") {
      if (getTrailingNewlines() < 2) {
        appendSpan("\n", {});
      }
      justOpenedListItem = false;
      continue;
    }

    if (tagName === "ul" || tagName === "ol") {
      if (!justOpenedListItem) {
        ensureLineBreak();
      }
      listStack.push({ kind: tagName, index: 0 });
      justOpenedListItem = false;
      continue;
    }

    if (tagName === "li") {
      ensureLineBreak();
      const currentList = listStack[listStack.length - 1];
      const indent = "  ".repeat(Math.max(0, listStack.length - 1));
      let prefix = "• ";
      if (currentList?.kind === "ol") {
        currentList.index += 1;
        prefix = `${currentList.index}. `;
      }
      appendSpan(`${indent}${prefix}`, {});
      justOpenedListItem = true;
      continue;
    }

    if (BLOCK_TAGS.has(tagName)) {
      if (justOpenedListItem) {
        justOpenedListItem = false;
      } else {
        ensureLineBreak();
      }
    }

    if (!token.isSelfClosing) {
      const style = buildTagStyle(tagName, token.attrs ?? "");
      styleStack.push({ tag: tagName, style });
    }
  }

  return trimSpans(spans);
}

export const formatHTML = (html: string, nobreak = false): string => {
  if (!html) {
    return "";
  }

  const text = parseHomeworkHTML(html)
    .map(span => span.text)
    .join("");

  return nobreak ? text.replace(/[\r\n]+/g, " ") : text;
};
