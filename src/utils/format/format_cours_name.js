var lessonFormatsLookup = {};
var lesson_formats = require("../data/lesson_formats.json");
// Build a lookup table once at module load time
for (var _i = 0, lesson_formats_1 = lesson_formats; _i < lesson_formats_1.length; _i++) {
    var item = lesson_formats_1[_i];
    for (var _a = 0, _b = item.formats.default; _a < _b.length; _a++) {
        var format = _b[_a];
        var key = format.toLowerCase();
        if (!lessonFormatsLookup[key]) {
            lessonFormatsLookup[key] = item;
        }
    }
}
var processedStringCache = {};
var regexPatterns = {
    specialChars: /[^a-zA-Z0-9 ]/g,
    spaces: /\s+/g,
    parentheses: /\(.*\)/g,
    lvPattern: /lv\d/gi,
    splitMarker: />/,
    accentNormalization: /[\u0300-\u036f]/g,
    punctuation: /[,._]/g,
};
var upperCaseTerms = new Set([
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
var uppercaseFirst = function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
};
var removeSpaces = function (text) {
    return text.replace(regexPatterns.spaces, "");
};
function processInputString(pronoteString) {
    // Check cache first
    var cacheKey = "proc_".concat(pronoteString);
    if (processedStringCache[cacheKey]) {
        return processedStringCache[cacheKey];
    }
    // Processing pipeline
    var result = pronoteString
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
function findObjectByPronoteString(pronoteString) {
    if (pronoteString === void 0) { pronoteString = ""; }
    var processedString = processInputString(pronoteString);
    // Direct lookup from pre-built index
    var foundItem = lessonFormatsLookup[processedString];
    if (foundItem) {
        return foundItem;
    }
    return {
        label: removeSpaces(processedString),
        pretty: formatPretty(processedString),
        formats: {},
    };
}
function formatPretty(text) {
    var words = text.split(" ");
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (upperCaseTerms.has(word.toUpperCase())) {
            words[i] = word.toUpperCase();
        }
        else {
            words[i] = uppercaseFirst(word);
        }
    }
    return words.join(" ");
}
function getCourseSpeciality(pronoteString) {
    if (pronoteString === void 0) { pronoteString = ""; }
    if (!pronoteString.includes(">"))
        return null;
    var parts = pronoteString.split(regexPatterns.splitMarker);
    if (parts.length < 2)
        return null;
    var newPrnString = parts[parts.length - 1].trim().toLowerCase();
    if (!newPrnString)
        return null;
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
