import { latexVocabulary } from "@/consts/LatexVocabulary";
var SUPPORTED_TAGS = {
    br: "\n",
    strong: function (text) { return "**".concat(text, "**"); },
    sub: function (text) { return "_{".concat(text, "}"); },
    sup: function (text) { return "^{".concat(text, "}"); },
};
var IGNORED_TAGS = new Set([
    "div",
    "span",
    "style",
    "script",
    "footer",
    "header",
]);
var TAG_REGEX = /<\/?([a-zA-Z]+)(?:\s[^>]*)?>|([^<]+)/g;
var NUMERIC_ENTITY_REGEX = /&#(\d+);/g;
var NAMED_ENTITY_REGEX = /&([a-zA-Z]+);/g;
var LATEX_REGEX = /\\[a-zA-Z]+(?:\{\})?/g;
var MULTI_NEWLINE_REGEX = /\n{2,}/g;
var HTML_ENTITIES = {
    "&nbsp;": " ",
    "&quot;": "\"",
    "&#039;": "'"
};
var DECODE_CACHE = new Map();
function parse_homeworks(content) {
    var result = "";
    var stack = [];
    var lastIndex = 0;
    content.replace(TAG_REGEX, function (fullMatch, tagName, text, offset) {
        // Add any text between matches
        if (offset > lastIndex) {
            var betweenText = content.slice(lastIndex, offset);
            if (stack.length > 0) {
                stack[stack.length - 1].children.push(betweenText);
            }
            else {
                result += betweenText;
            }
        }
        lastIndex = offset + fullMatch.length;
        if (text) {
            var decodedText = DECODE_CACHE.get(text);
            if (!decodedText) {
                decodedText = decodeHtmlEntities(text);
                DECODE_CACHE.set(text, decodedText);
            }
            if (stack.length > 0) {
                stack[stack.length - 1].children.push(decodedText);
            }
            else {
                result += decodedText;
            }
        }
        else if (tagName) {
            var tag = tagName.toLowerCase();
            var isClosingTag = fullMatch.startsWith("</");
            if (isClosingTag) {
                // Process closing tag
                if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
                    var _a = stack.pop(), currentTag = _a.tag, children = _a.children;
                    var processedContent = children.join("");
                    var handler = SUPPORTED_TAGS[currentTag];
                    if (typeof handler === "string") {
                        result += handler;
                    }
                    else if (handler) {
                        result += handler(processedContent);
                    }
                }
            }
            else if (!IGNORED_TAGS.has(tag)) {
                // Process opening tag
                var handler = SUPPORTED_TAGS[tag];
                if (handler) {
                    if (typeof handler === "string") {
                        result += handler;
                    }
                    else {
                        stack.push({ tag: tag, children: [] });
                    }
                }
            }
        }
        return "";
    });
    if (lastIndex < content.length) {
        var remainingText = content.slice(lastIndex);
        if (stack.length > 0) {
            stack[stack.length - 1].children.push(remainingText);
        }
        else {
            result += remainingText;
        }
    }
    while (stack.length > 0) {
        var _a = stack.pop(), tag = _a.tag, children = _a.children;
        var handler = SUPPORTED_TAGS[tag];
        if (typeof handler === "function") {
            result += handler(children.join(""));
        }
    }
    return result.replace(MULTI_NEWLINE_REGEX, "").trim();
}
function decodeHtmlEntities(text) {
    return text
        .replace(NUMERIC_ENTITY_REGEX, function (_, dec) {
        return String.fromCharCode(parseInt(dec, 10));
    })
        .replace(NAMED_ENTITY_REGEX, function (_, entity) { return HTML_ENTITIES["&".concat(entity, ";")] || "&".concat(entity, ";"); })
        .replace(LATEX_REGEX, function (match) {
        match = match.replace("{}", "");
        return latexVocabulary[match] || match;
    });
}
export default parse_homeworks;
