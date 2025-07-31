import detectionJson from "@/utils/magic/regex/evaldetection.json";
var detectionData = detectionJson;
function normalizeString(input) {
    return input.toLowerCase().replace(/[\s-]+/g, "");
}
function detectCategory(input) {
    var normalizedInput = normalizeString(input);
    for (var _i = 0, _a = Object.entries(detectionData); _i < _a.length; _i++) {
        var _b = _a[_i], category = _b[0], patterns = _b[1];
        if (patterns.some(function (pattern) { return new RegExp(pattern, "i").test(input); })) {
            return category;
        }
    }
    return null;
}
export default detectCategory;
