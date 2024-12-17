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
import type { PronoteAccount } from "@/stores/account/types";
import { translateToWeekNumber } from "pawnote";

const EPOCH_WN_CONFIG = {
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
const dayToWeekCommonDay = (date: Date): Date => {
  const _date = new Date(date);
  _date.setHours(EPOCH_WN_CONFIG.setHour, 0, 0, 0);
  _date.setDate(_date.getDate() - ( (7 + _date.getDay() - 1) %7 ) + EPOCH_WN_CONFIG.setMiddleDay - 1);
  // the (7+ ... -1 ) %7 is to have Monday as the first day (0) of the week and Sunday as last day (7) cause JS start the week on Sunday ¯\_(ツ)_/¯
  // In details : the 7+ is to avoid negative value, the -1 is to have Monday as the first day of the week and the %7 is to have the right day number (0 to 6)
  // In details : setMiddleDay - 1 is to have the middle day of the week, aka Wednesday
  // Its to avoid the fact that Sunday is in the next week with simpler JS code.
  return _date;
};

export const epochWNToDate = (epochWeekNumber: number)=>dayToWeekCommonDay(weekNumberToMiddleDate(epochWeekNumber));

export const epochWNToPronoteWN = (epochWeekNumber: number, account: PronoteAccount) =>
  translateToWeekNumber(epochWNToDate(epochWeekNumber), account.instance?.instance.firstMonday || pronoteFirstDate) || 1;

/**
 * Convert a date to a week number.
 */
export const dateToEpochWeekNumber = (date: Date): number => {
  const commonDay = dayToWeekCommonDay(date);
  const epochWeekNumber = Math.floor((commonDay.getTime() + EPOCH_WN_CONFIG.adjustEpochInitialDate  - ( (EPOCH_WN_CONFIG.setMiddleDay - 1) /7 ) * EPOCH_WN_CONFIG.numberOfMsInAWeek) / EPOCH_WN_CONFIG.numberOfMsInAWeek);
  // this is the opposite of the weekNumberToMiddleDate function
  return epochWeekNumber;
};

/**
 * Check if the test date is in the same week as the reference date.
 * If we need to check if the test date is "near" our reference date, we can use the numberOfWeeksBefore and numberOfWeeksAfter parameters.
 * So if I want to check if the test date is in the same week or the next week, I can call isInTheWeek(referenceDate, testDate, 0, 1).
 */
export const isInTheWeek = (referenceDate: Date, testDate: Date, numberOfWeeksBefore = 0, numberOfWeeksAfter = 0): boolean => {
  const referenceWeek = dateToEpochWeekNumber(referenceDate);
  const testWeek = dateToEpochWeekNumber(testDate);
  return testWeek >= referenceWeek - numberOfWeeksBefore && testWeek <= referenceWeek + numberOfWeeksAfter;
};

export const weekNumberToDateRange = (epochWeekNumber: number, numberOfWeeksBefore = 0, numberOfWeeksAfter = 0): { start: Date; end: Date } => {
  const start = new Date(
    epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek
    - EPOCH_WN_CONFIG.adjustEpochInitialDate
    - numberOfWeeksBefore * EPOCH_WN_CONFIG.numberOfMsInAWeek
  );
  const end = new Date(
    epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek
    + ( 6/7 ) * EPOCH_WN_CONFIG.numberOfMsInAWeek // 6/7 is to have the end of the week, aka Sunday (we are in Europe so we dont need to worry if we want to include the Sunday)
    - EPOCH_WN_CONFIG.adjustEpochInitialDate
    + numberOfWeeksAfter * EPOCH_WN_CONFIG.numberOfMsInAWeek
  );
  return { start, end };
};


export const weekNumberToDaysList = (epochWeekNumber: number): Date[] => {
  const weekdays = [];
  for (let i = 0; i < 7; i++) {
    weekdays.push(new Date(
      epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek + (i/7)
        * EPOCH_WN_CONFIG.numberOfMsInAWeek
        - EPOCH_WN_CONFIG.adjustEpochInitialDate
    ));
  }
  return weekdays;
};

export const weekNumberToMiddleDate = (epochWeekNumber: number): Date => {
  const date = new Date(
    epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek
    + ( (EPOCH_WN_CONFIG.setMiddleDay - 1) /7 ) * EPOCH_WN_CONFIG.numberOfMsInAWeek // (setMiddleDay-1)/7 is to have the middle of the week, aka Wednesday
    - EPOCH_WN_CONFIG.adjustEpochInitialDate
  );
  return date;
};

export const epochWMToCalendarWeekNumber = (epochWeekNumber: number): number => {
  const date = weekNumberToMiddleDate(epochWeekNumber);
  // Set Day to Sunday and make it the 7th day of the week
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  // Return array of year and week number
  return weekNo;
};
