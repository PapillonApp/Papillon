var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import important_json from "@/utils/magic/regex/important.json";
export var categorizeMessages = function (messages) {
    var importantMessages = [];
    var normalMessages = [];
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        var title = message.title, content = message.content, read = message.read;
        var matchCount = 0;
        var matchingWords = [];
        for (var _a = 0, _b = Object.values(important_json); _a < _b.length; _a++) {
            var regexArray = _b[_a];
            for (var _c = 0, regexArray_1 = regexArray; _c < regexArray_1.length; _c++) {
                var regex = regexArray_1[_c];
                var pattern = new RegExp(regex, "i");
                var titleMatches = title === null || title === void 0 ? void 0 : title.match(pattern);
                var contentMatches = content.match(pattern);
                // Filter out empty strings and add only non-empty matches to matchingWords
                if (titleMatches) {
                    var nonEmptyTitleMatches = titleMatches.filter(function (match) { return match && match.trim() !== ""; });
                    if (nonEmptyTitleMatches.length > 0) {
                        matchCount++;
                        matchingWords.push.apply(matchingWords, nonEmptyTitleMatches);
                    }
                }
                if (contentMatches) {
                    var nonEmptyContentMatches = contentMatches.filter(function (match) { return match && match.trim() !== ""; });
                    if (nonEmptyContentMatches.length > 0) {
                        matchCount++;
                        matchingWords.push.apply(matchingWords, nonEmptyContentMatches);
                    }
                }
            }
        }
        ;
        if (!message.title) {
            message.title = "";
        }
        if (matchCount > 0 && !read && importantMessages.length < 3) {
            importantMessages.push(__assign(__assign({}, message), { matchCount: matchCount, matchingWords: matchingWords, important: true }));
            // Log the matching words or phrases for this message
        }
        else {
            normalMessages.push(message);
        }
    }
    return { importantMessages: importantMessages, normalMessages: normalMessages };
};
