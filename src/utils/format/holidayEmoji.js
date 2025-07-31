export var getHolidayEmoji = function (date) {
    var _a, _b;
    if (date === void 0) { date = new Date(); }
    var year = date.getFullYear();
    var periods = [
        { start: new Date("".concat(year, "-12-31")), end: new Date("".concat(year, "-01-01")), emoji: "🎇" }, // Nouvel An
        { start: new Date("".concat(year, "-04-10")), end: new Date("".concat(year, "-04-10")), emoji: "🥚" }, // Lundi de Pâques
        { start: new Date("".concat(year, "-05-01")), end: new Date("".concat(year, "-05-01")), emoji: "💼" }, // Fête du Travail
        { start: new Date("".concat(year, "-05-08")), end: new Date("".concat(year, "-05-08")), emoji: "💐" }, // Armistice 1945
        { start: new Date("".concat(year, "-05-18")), end: new Date("".concat(year, "-05-18")), emoji: "🌿" }, // Ascension
        { start: new Date("".concat(year, "-05-29")), end: new Date("".concat(year, "-05-29")), emoji: "🕊️" }, // Lundi de Pentecôte
        { start: new Date("".concat(year, "-07-14")), end: new Date("".concat(year, "-07-14")), emoji: "🇫🇷" }, // Fête Nationale
        { start: new Date("".concat(year, "-08-15")), end: new Date("".concat(year, "-08-15")), emoji: "🌻" }, // Assomption
        { start: new Date("".concat(year, "-11-01")), end: new Date("".concat(year, "-11-01")), emoji: "🕯️" }, // Toussaint
        { start: new Date("".concat(year, "-11-11")), end: new Date("".concat(year, "-11-11")), emoji: "💐" }, // Armistice 1918
        { start: new Date("".concat(year, "-12-25")), end: new Date("".concat(year, "-12-25")), emoji: "🎄" }, // Noël
        { start: new Date("".concat(year, "-10-19")), end: new Date("".concat(year, "-11-04")), emoji: "🍂" }, // Vacances de la Toussaint
        { start: new Date("".concat(year, "-12-21")), end: new Date("".concat(year, "-01-06")), emoji: "❄️" }, // Vacances de Noël
        { start: new Date("".concat(year, "-02-08")), end: new Date("".concat(year, "-03-10")), emoji: "⛷️" }, // Vacances d'hiver
        { start: new Date("".concat(year, "-04-05")), end: new Date("".concat(year, "-04-28")), emoji: "🐝" }, // Vacances de printemps
        { start: new Date("".concat(year, "-07-05")), end: new Date("".concat(year, "-09-01")), emoji: "🏖️" }, // Grandes vacances
    ];
    return (_b = (_a = periods.find(function (period) { return date >= period.start && date <= period.end; })) === null || _a === void 0 ? void 0 : _a.emoji) !== null && _b !== void 0 ? _b : "🏝️";
};
