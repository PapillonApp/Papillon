import { Course, CourseStatus, CourseType } from "@/services/shared/timetable";
import type { TransportStorage } from "@/stores/account/types";

import type { CommuteDirection, CommuteTarget } from "./types";

export const MARGINS = [0, 5, 10, 15];

export function margin(transport: TransportStorage | undefined): number {
  return transport?.marginMinutes ?? 10;
}

function counts(course: Course): boolean {
  return course.status !== CourseStatus.CANCELED && course.type !== CourseType.VACATION;
}

export function target(
  courses: Course[],
  direction: CommuteDirection,
  marginMinutes: number,
): CommuteTarget | null {
  const relevant = courses
    .filter(counts)
    .sort((a, b) => a.from.getTime() - b.from.getTime());
  if (relevant.length === 0) {
    return null;
  }

  if (direction === "departure") {
    const course = relevant[0]!;
    return {
      direction,
      course,
      time: new Date(course.from.getTime() - marginMinutes * 60_000),
      arriveBy: true,
      marginMinutes,
    };
  }

  const course = relevant.reduce((latest, candidate) =>
    candidate.to.getTime() > latest.to.getTime() ? candidate : latest,
  );
  return { direction, course, time: new Date(course.to.getTime()), arriveBy: false, marginMinutes: 0 };
}
