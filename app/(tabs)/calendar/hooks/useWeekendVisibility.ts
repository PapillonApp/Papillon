import { useRef } from "react";

import type { CourseDay } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";

import type { WeekendVisibility } from "../utils/weekGeometry";

const SATURDAY = 6;
const SUNDAY = 0;

// Only ever turns days on. The timetable loads a few weeks at a time, so turning
// them back off would collapse the grid the moment the user swiped past the week
// holding the Saturday class.
export function useWeekendVisibility(
  timetable: CourseDay[],
  date: Date = new Date()
): WeekendVisibility {
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const previousAccount = useRef(lastUsedAccount);
  const visibility = useRef<WeekendVisibility>({ saturday: false, sunday: false });

  if (previousAccount.current !== lastUsedAccount) {
    previousAccount.current = lastUsedAccount;
    visibility.current = { saturday: false, sunday: false };
  }

  let saturday = visibility.current.saturday || date.getDay() === SATURDAY;
  let sunday = visibility.current.sunday;

  for (const day of timetable) {
    if (saturday && sunday) {
      break;
    }
    if (day.courses.length === 0) {
      continue;
    }
    const weekday = day.date.getDay();
    if (weekday === SATURDAY) {
      saturday = true;
    } else if (weekday === SUNDAY) {
      sunday = true;
    }
  }

  if (saturday !== visibility.current.saturday || sunday !== visibility.current.sunday) {
    visibility.current = { saturday, sunday };
  }

  return visibility.current;
}
