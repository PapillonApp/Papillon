import { useRef } from "react";

import type { CourseDay } from "@/services/shared/timetable";
import type { WeekendVisibility } from "../utils/weekGeometry";

const SATURDAY = 6;
const SUNDAY = 0;

// Only ever turns days on. The timetable loads a few weeks at a time, so turning
// them back off would collapse the grid the moment the user swiped past the week
// holding the Saturday class.
export function useWeekendVisibility(timetable: CourseDay[]): WeekendVisibility {
  const visibility = useRef<WeekendVisibility>({ saturday: false, sunday: false });

  let saturday = visibility.current.saturday;
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
