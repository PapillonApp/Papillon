/*
 -----------------------------------------------------------------------------------------------

                    Papillon's custom system for week number since 01/01/1970

 This part is for handleing the date conversion from JS date, Pronote's week number and our
 "epochWeekNumber" (which try to represent the total number of weeks since the UNIX epoch, aka
 1st January 1970). It can be a little be messy but it's the best way I found to handle the date
 conversion between the different systems. I tried to make it as simple as possible and modular,
 and I added a ton of comments to help u. If you still have a question, feel free to ask me. - NonozgYtb ;)

 -----------------------------------------------------------------------------------------------
*/
import { pronoteFirstDate } from "@/services/pronote/timetable";
import { translateToWeekNumber } from "pawnote";
var EPOCH_WN_CONFIG = {
    setHour: 6, // We are in Europe, so we set the hour to 6 UTC to avoid any problem with the timezone (= 2h in the morning in Summer Paris timezone)
    setStartDay: 1, // We set the first day of the week to Monday to ensure that the week number is the same for the whole world
    setMiddleDay: 3, // We set the middle day of the week to Wednesday to ensure <... same than above ...>
    setEndDay: 7, // We set the last day of the week to Sunday to ensure <...>
    numberOfMsInAWeek: 1000 /* ms */ * 60 /* s */ * 60 /* min */ * 24 /* h */ * 7, /* days */
    adjustEpochInitialDate: 259200000, // =(((new Date(0)).getDay()-1) * EPOCH_WN_CONFIG.numberOfMsInAWeek/7) // We need to substract this for having a good range cause 01/01/1970 was not a Monday and the "-1" is to have Monday as the first day of the week
};
/**
 * For comparing days and week, we need to have a common day to start the week, aka here Wednesday, 6:0:0:0
 *!It's internal and should not be used outside of this file.
 */
var dayToWeekCommonDay = function (date) {
    var _date = new Date(date);
    var day = _date.getDay();
    _date.setHours(EPOCH_WN_CONFIG.setHour, 0, 0, 0);
    _date.setDate(_date.getDate() -
        ((7 + day - EPOCH_WN_CONFIG.setStartDay) % 7) +
        EPOCH_WN_CONFIG.setMiddleDay);
    return _date;
};
export var epochWNToDate = function (epochWeekNumber) {
    return dayToWeekCommonDay(weekNumberToMiddleDate(epochWeekNumber));
};
export var epochWNToPronoteWN = function (epochWeekNumber, account) {
    var _a;
    return translateToWeekNumber(epochWNToDate(epochWeekNumber), ((_a = account.instance) === null || _a === void 0 ? void 0 : _a.instance.firstMonday) || pronoteFirstDate) || 1;
};
export var dateToEpochWeekNumber = function (date) {
    var commonDay = dayToWeekCommonDay(date);
    return Math.floor((commonDay.getTime() + EPOCH_WN_CONFIG.adjustEpochInitialDate) /
        EPOCH_WN_CONFIG.numberOfMsInAWeek);
};
export var isInTheWeek = function (referenceDate, testDate, numberOfWeeksBefore, numberOfWeeksAfter) {
    if (numberOfWeeksBefore === void 0) { numberOfWeeksBefore = 0; }
    if (numberOfWeeksAfter === void 0) { numberOfWeeksAfter = 0; }
    var referenceWeek = dateToEpochWeekNumber(referenceDate);
    var testWeek = dateToEpochWeekNumber(testDate);
    return (testWeek >= referenceWeek - numberOfWeeksBefore &&
        testWeek <= referenceWeek + numberOfWeeksAfter);
};
export var weekNumberToDateRange = function (epochWeekNumber, numberOfWeeksBefore, numberOfWeeksAfter) {
    if (numberOfWeeksBefore === void 0) { numberOfWeeksBefore = 0; }
    if (numberOfWeeksAfter === void 0) { numberOfWeeksAfter = 0; }
    var baseTime = epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek -
        EPOCH_WN_CONFIG.adjustEpochInitialDate;
    return {
        start: new Date(baseTime - numberOfWeeksBefore * EPOCH_WN_CONFIG.numberOfMsInAWeek),
        end: new Date(baseTime +
            518400000 +
            numberOfWeeksAfter * EPOCH_WN_CONFIG.numberOfMsInAWeek),
    };
};
export var weekNumberToDaysList = function (epochWeekNumber) {
    var baseTime = epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek -
        EPOCH_WN_CONFIG.adjustEpochInitialDate;
    var weekdays = [];
    for (var i = 0; i < 7; i++) {
        weekdays.push(new Date(baseTime + i * 86400000));
    }
    return weekdays;
};
export var weekNumberToMiddleDate = function (epochWeekNumber) {
    return new Date(epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek +
        172800000 -
        EPOCH_WN_CONFIG.adjustEpochInitialDate);
};
export var epochWMToCalendarWeekNumber = function (epochWeekNumber) {
    var date = weekNumberToMiddleDate(epochWeekNumber);
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
export var calculateWeekNumber = function (date) {
    var epochWeekNumber = dateToEpochWeekNumber(date);
    var firstSeptemberEpochWeekNumber = dateToEpochWeekNumber(new Date(Date.UTC(date.getUTCFullYear(), 8, 1)));
    var relativeWeekNumber = ((epochWeekNumber - firstSeptemberEpochWeekNumber + 52) % 52) + 1;
    return relativeWeekNumber;
};
