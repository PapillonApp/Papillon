var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/**
* @param str "A string containing a date formatted as "mercredi 21 février 2024 de 08:10", will return the date for the specified day and hour"
*/
export function dateAsISO860(str) {
    var parts = str.split(" ");
    var timeIndex = parts.findIndex(function (part) { return part.includes(":"); });
    var hour = parts[timeIndex].split(":");
    var monthIndex = parts.findIndex(function (part) { return months.includes(part); });
    return (new Date(Number(parts[monthIndex + 1]), months.indexOf(parts[monthIndex]), Number(parts[monthIndex - 1]), Number(hour[0]), Number(hour[1]))).toISOString();
}
export function dateStringAsTimeInterval(str) {
    if (str.includes("du")) {
        /**
           * @example
           * str is equal to "du mercredi 21 février 2024 au jeudi 22 février 2024"
           * or "du mercredi 27 novembre 2024 à 08:10 au vendredi 06 décembre 2024 à 08:10"
           */
        var _a = str.split("au").map(function (part) { return part.trim(); }), startPart = _a[0], endPart = _a[1];
        var start = startPart.replace("du", "").trim();
        var end = endPart.trim();
        if (!start.includes(":")) {
            start += " de 00:00";
        }
        else {
            start = start.replace(" à ", " de ");
        }
        if (!end.includes(":")) {
            end += " de 23:59";
        }
        else {
            end = end.replace(" à ", " de ");
        }
        return {
            start: dateAsISO860(start),
            end: dateAsISO860(end)
        };
    }
    if (str.includes("le")) {
        /**
           * @example
           * str is equal to "le mercredi 21 février 2024 de 08:10 à 16:10"
           * or "le jeudi 22 février 2024"
           */
        var parts = str.split("à");
        var startDate = void 0;
        var endDate = void 0;
        // It's a full day ("le mercredi 21 février 2024")
        if (!str.includes(":")) {
            startDate = "".concat(parts[0].replace("le", "").trim(), " de 00:00");
            endDate = "".concat(parts[0].split("de")[0].replace("le", "").trim(), " de 23:59");
        }
        else {
            startDate = parts[0].replace("le", "").trim();
            endDate = "".concat(parts[0].split("de")[0].replace("le", "").trim(), " de ").concat(parts[1].trim());
        }
        var start = dateAsISO860(startDate);
        var end = dateAsISO860(endDate);
        return { start: start, end: end };
    }
    return undefined;
}
/**
 * Get the duration of interval in hours.
 * @param interval
 */
export var getDuration = function (interval) {
    return new Date(new Date(interval.end).getTime() - new Date(interval.start).getTime());
};
/**
* Get the duration of interval in hours.
* @param interval
*/
/**
 * Get the duration of interval in hours.
 * @param interval
 */
export var getDurationInHours = function (interval) {
    var diff = new Date(interval.end).getTime() - new Date(interval.start).getTime();
    var hours = Math.floor(diff / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return "".concat(hours, "h").concat(minutes.toString().padStart(2, "0"));
};
