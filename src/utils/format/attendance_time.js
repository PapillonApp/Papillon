import { differenceInHours, differenceInMinutes } from "date-fns";
var leadingZero = function (num) {
    return num < 10 ? "0".concat(num) : num;
};
var getAbsenceTime = function (fromTimestamp, toTimestamp) {
    var from = new Date(fromTimestamp);
    var to = new Date(toTimestamp);
    var hours = differenceInHours(to, from);
    var minutes = differenceInMinutes(to, from) % 60;
    return {
        diff: to.getTime() - from.getTime(),
        hours: hours,
        withMinutes: leadingZero(minutes),
        minutes: differenceInMinutes(to, from),
    };
};
export { getAbsenceTime, leadingZero };
