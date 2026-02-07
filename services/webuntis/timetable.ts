import { WebUntisClient } from "webuntis-client";
import { TimetableDay } from "webuntis-client/dist/types/timetable/day";

import { getDateRangeOfWeek } from "@/database/useHomework";
import {
  Course,
  CourseDay,
  CourseStatus,
  CourseType,
} from "@/services/shared/timetable";
import { error } from "@/utils/logger/logger";

export async function fetchWebUntisWeekTimetable(
  session: WebUntisClient,
  accountId: string,
  weekNumber: number
): Promise<CourseDay[]> {
  if (!session) {
    error("Session is undefined", "fetchWebUntisTimetable");
  }

  const { start, end } = getDateRangeOfWeek(weekNumber);
  const timetable = await session.getOwnTimetable(start, end);

  const mappedCourses = mapCourses(accountId, timetable);
  const dayMap: Record<string, Course[]> = {};

  for (const course of mappedCourses) {
    const dayKey = course.from.toISOString().split("T")[0];
    dayMap[dayKey] = dayMap[dayKey] || [];
    dayMap[dayKey].push(course);
  }

  for (const day in dayMap) {
    dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
  }

  return Object.entries(dayMap).map(([day, courses]) => ({
    date: new Date(day),
    courses,
  }));
}

const mapCourses = (accountId: string, days: TimetableDay[]): Course[] => {
  const courseList: Course[] = [];

  for (const day of days) {
    for (const c of day.gridEntries) {
      const subject = c.subject!.longName;
      const room = c.room!.longName;
      const teacher = c.teacher!.longName;

      const course: Course = {
        id: subject + room + teacher,
        type: CourseType.LESSON,
        subject: subject,
        room: room,
        teacher: teacher,
        createdByAccount: accountId,
        from: c.from,
        to: c.to,
      };

      if (c.type === "EXAM") {
        course.status = CourseStatus.EVALUATED;
      } else if (c.status === "CHANGED") {
        course.status = CourseStatus.EDITED;
      }
    }
  }

  return courseList;
};
