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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function extractNames(text) {
    var pattern = /\b([A-ZÀ-Ÿ]+)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)\b/g;
    var matches = __spreadArray([], text.matchAll(pattern), true);
    return matches.map(function (match) { return "".concat(match[1], " ").concat(match[2]); });
}
export var reduceIcalToCourse = function (course, identityProvider, url) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var returnCourse = {
        subject: ((_a = course.summary) === null || _a === void 0 ? void 0 : _a.value) || "",
        id: ((_b = course.uid) === null || _b === void 0 ? void 0 : _b.value) || "",
        type: "lesson",
        title: ((_c = course.summary) === null || _c === void 0 ? void 0 : _c.value) || null,
        startTimestamp: course.dtstart && new Date((_d = course.dtstart) === null || _d === void 0 ? void 0 : _d.value).getTime() || null,
        endTimestamp: course.dtend && new Date((_e = course.dtend) === null || _e === void 0 ? void 0 : _e.value).getTime() || null,
        room: ((_f = course.location) === null || _f === void 0 ? void 0 : _f.value) || null,
        teacher: ((_g = course.organizer) === null || _g === void 0 ? void 0 : _g.value) || null,
        backgroundColor: undefined,
        itemType: undefined,
        status: undefined,
        source: "ical://" + url,
    };
    if (identityProvider.identifier === "univ-rennes1" ||
        identityProvider.identifier === "iut-lannion") {
        var teacher = extractNames((_h = course.description) === null || _h === void 0 ? void 0 : _h.value.trim()).join(", ") || undefined;
        // get ressource
        var ressourceRegex = /(R\d{3})\s?-/;
        var ressource = (_j = course.summary) === null || _j === void 0 ? void 0 : _j.value.match(ressourceRegex);
        // Get if CM, TD, TP
        var courseType = (_k = course.summary) === null || _k === void 0 ? void 0 : _k.value.match(/(CM|TD|TP|DS)/);
        var courseTypes = {
            CM: "CM (Cours magistral)",
            TD: "TD (Travaux dirigés)",
            TP: "TP (Travaux pratiques)",
            DS: "DS (Devoir surveillé)",
        };
        var itemType = (ressource ? ressource[0].replace("-", "") + " - " : "") +
            (courseType ? courseTypes[courseType[0]] : "");
        // class
        var classRegex = /\b[A-Za-z]{2}\s\d[A-Za-z](?:\d)?\s[A-Za-z]+\b/g;
        var classes = (_l = course.summary) === null || _l === void 0 ? void 0 : _l.value.match(classRegex);
        var cmRegex = /\bCM\s+\w+\b/g;
        var cm = (_m = course.summary) === null || _m === void 0 ? void 0 : _m.value.match(cmRegex);
        var cmSRegex = /\d{1,2}[a-z]\s[A-Z]{2,}/i;
        var cmS = (_o = course.summary) === null || _o === void 0 ? void 0 : _o.value.match(cmSRegex);
        // remove ressource from title
        var title = (_p = course.summary) === null || _p === void 0 ? void 0 : _p.value;
        if (ressource) {
            title = title.replace(ressource[0], "");
        }
        // remove class
        title = title.replace(classRegex, "");
        if (cm && cm.length > 0) {
            // remove CM
            title = title.replace(cmRegex, "");
        }
        else {
            // remove cmS
            title = title.replace(cmSRegex, "");
        }
        // if ends with "Autonomie', move to beginning
        if (title.trim().endsWith("Autonomie")) {
            title = "Autonomie " + title.replace("Autonomie", "");
        }
        if (title.trim().endsWith("Suivi")) {
            title = "Suivi " + title.replace("Suivi", "");
        }
        returnCourse = __assign(__assign({}, returnCourse), { title: title, subject: title, itemType: itemType, teacher: teacher });
    }
    return returnCourse;
};
