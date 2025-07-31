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
import { useCurrentAccount } from "@/stores/account";
import findObjectByPronoteString from "@/utils/format/format_cours_name";
export var COLORS_LIST = [
    "#D1005A",
    "#BE4541",
    "#D54829",
    "#F46E00",
    "#B2641F",
    "#D18800",
    "#BEA541",
    "#E5B21A",
    "#B2BE41",
    "#94BE41",
    "#5CB21F",
    "#32CB10",
    "#1FB28B",
    "#6DA2E3",
    "#0099D1",
    "#1F6DB2",
    "#4E339E",
    "#7941BE",
    "#CC33BF",
    "#BE417F",
    "#E36DB8",
    "#7F7F7F",
];
export var getRandColor = function (usedColors) {
    var availableColors = COLORS_LIST.filter(function (color) {
        if (usedColors && usedColors.length > 0) {
            return !usedColors.includes(color);
        }
        return true;
    });
    return (availableColors[Math.floor(Math.random() * availableColors.length)] ||
        getRandColor([]));
};
var getClosestGradeEmoji = function (subjectName) {
    var gradeEmojiList = {
        numerique: "💻",
        SI: "💻",
        SNT: "💻",
        travaux: "⚒",
        travail: "💼",
        moral: "⚖️",
        env: "🌿",
        sport: "🏀",
        EPS: "🏀",
        econo: "📈",
        francais: "📚",
        anglais: "🇬🇧",
        allemand: "🇩🇪",
        espagnol: "🇪🇸",
        latin: "🏛️",
        italien: "🇮🇹",
        histoire: "📜",
        EMC: "🤝",
        hist: "📜",
        llc: "🌍",
        scientifique: "🔬",
        arts: "🎨",
        philosophie: "🤔",
        math: "📐",
        phys: "🧪",
        accomp: "👨‍🏫",
        tech: "🔧",
        ingenieur: "🔧",
        musique: "🎼",
        musical: "🎼",
        classe: "🏫",
        vie: "🧬",
        SES: "💰",
        stage: "👔",
        œuvre: "🖼️",
        default: "📝",
        developpement: "👨‍💻",
        culture: "🧠",
        gestion: "💼",
        traitement: "📊",
        sae: "📚",
        expression: "🎭",
        ppp: "🧑‍🏫",
    };
    var subjectNameFormatted = subjectName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    // Sort keys by length in descending order
    var sortedKeys = Object.keys(gradeEmojiList).sort(function (a, b) { return b.length - a.length; });
    // Find emoji with key in subject name
    var closest = sortedKeys.find(function (key) { return subjectNameFormatted.includes(key); }) || "default";
    return gradeEmojiList[closest];
};
export var getSubjectData = function (entry) {
    var _a;
    var _b;
    try {
        var state = useCurrentAccount.getState();
        var account = state.account, mutateProperty = state.mutateProperty;
        var subject = entry
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        if (!subject) {
            return { color: "#888888", pretty: "Matière inconnue", emoji: "❓" };
        }
        var allSubjects = ((_b = account === null || account === void 0 ? void 0 : account.personalization) === null || _b === void 0 ? void 0 : _b.subjects) || {};
        // Check if the subject already exists
        var existingSubject = allSubjects[subject];
        if (existingSubject) {
            return existingSubject;
        }
        var formattedCoursName_1 = findObjectByPronoteString(subject);
        var usedColors = new Set(Object.values(allSubjects).map(function (subj) { return subj.color; }));
        var color = getRandColor(Array.from(usedColors));
        var emoji = getClosestGradeEmoji(subject);
        var newSubject = { color: color, pretty: formattedCoursName_1.pretty, emoji: emoji };
        // Check for existing subject with the same pretty name
        var existing = Object.values(allSubjects).find(function (subj) { return subj.pretty === formattedCoursName_1.pretty; });
        if (existing) {
            return existing;
        }
        mutateProperty("personalization", {
            subjects: __assign(__assign({}, allSubjects), (_a = {}, _a[subject] = newSubject, _a)),
        });
        return newSubject;
    }
    catch (error) {
        console.error("Error in getSubjectData:", error);
        return { color: getRandColor(), pretty: entry.toString(), emoji: getClosestGradeEmoji(entry) };
    }
};
