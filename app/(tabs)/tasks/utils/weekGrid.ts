import { getDateRangeOfWeek, getWeekNumberFromDate } from "@/database/useHomework";

const DAY_MS = 24 * 60 * 60 * 1000;

// The tasks screen, the pager and the homework cache all address a week the
// same way: as an index into the current calendar year, where index 1 is the
// week holding January 1st and every index after it is exactly seven days
// later. `getDateRangeOfWeek` is the only definition of that mapping, so both
// directions are derived from it here instead of being restated.

export interface WeekCell {
  /** Week index, in the same space as the pager and the homework cache. */
  index: number;
  /** The number a human reads on a calendar. */
  label: number;
  start: Date;
  end: Date;
}

const atMidnight = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

// Whole days between two dates, measured from their local midnights so a
// daylight saving change inside the span cannot shift the count.
const daysBetween = (from: Date, to: Date) =>
  Math.round((atMidnight(to).getTime() - atMidnight(from).getTime()) / DAY_MS);

export const getWeekRange = (index: number) =>
  getDateRangeOfWeek(index, new Date().getFullYear());

export const getWeekIndexOfDate = (date: Date) =>
  1 + Math.floor(daysBetween(getWeekRange(1).start, date) / 7);

/**
 * The week we are in. Derived from the week ranges themselves rather than from
 * `getWeekNumberFromDate`, which counts weeks as starting on Sunday and so
 * names the *next* week for any Sunday. The title, the pager's origin and the
 * picker all read this, so they cannot drift apart.
 */
export const getCurrentWeekIndex = () => getWeekIndexOfDate(new Date());

export const getWeekCell = (index: number): WeekCell => {
  const { start, end } = getWeekRange(index);
  return { index, label: getWeekNumberFromDate(start), start, end };
};

/** The month a week is filed under: the one its Monday falls in. */
export const getMonthOfWeek = (index: number) => {
  const { start } = getWeekRange(index);
  return { year: start.getFullYear(), month: start.getMonth() };
};

/**
 * The weeks the month wheel offers, in order — those whose Monday falls inside
 * the month. Never empty: even a 28 day month starting on a Monday holds four.
 */
export const getWeeksOfMonth = (year: number, month: number): WeekCell[] => {
  // Which index the month opens on depends on how its first day falls, so a
  // wider band is scanned and whatever lands inside the month is kept.
  const first = getWeekIndexOfDate(new Date(year, month, 1));
  const cells: WeekCell[] = [];
  for (let index = first - 1; index <= first + 6; index++) {
    const cell = getWeekCell(index);
    if (cell.start.getFullYear() === year && cell.start.getMonth() === month) {
      cells.push(cell);
    }
  }
  return cells;
};
