import { endOfISOWeek, format, startOfDay, startOfISOWeek } from "date-fns";
import { EventResponse, Multi } from "esup-multi.js";

import { getDateRangeOfWeek } from "@/database/useHomework";

import {
  Course,
  CourseDay,
  CourseStatus,
  CourseType,
} from "../shared/timetable";

export async function fetchMultiTimetable(
  session: Multi,
  accountId: string,
  weekNumber: number,
  date?: Date
): Promise<CourseDay[]> {
  const { start, end } = date
    ? { start: startOfISOWeek(date), end: endOfISOWeek(date) }
    : getDateRangeOfWeek(weekNumber);

  const timetable = await session.getSchedules({
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  });

  const dayMap: Record<string, Course[]> = {};
  for (const planning of timetable.plannings) {
    const courses = mapMultiCourse(planning.events, accountId);
    for (const course of courses) {
      const dayKey = format(course.from, "yyyy-MM-dd");
      dayMap[dayKey] = dayMap[dayKey] || [];
      dayMap[dayKey].push(course);
    }
  }

  for (const day in dayMap) {
    dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
  }

  return Object.values(dayMap).map(courses => ({
    date: startOfDay(courses[0].from),
    courses,
  }));
}

function mapMultiCourse(data: EventResponse[], accountId: string): Course[] {
  return data.map(lesson => ({
    subject: lesson.course.label,
    id: lesson.id,
    type: CourseType.LESSON,
    from: new Date(lesson.startDateTime),
    to: new Date(lesson.endDateTime),
    room: lesson.rooms.map(r => r.label).join(", "),
    teacher: lesson.teachers.map(t => t.displayname).join(", "),
    backgroundColor: lesson.course.color,
    group: lesson.groups.map(g => g.label).join(", "),
    status: lesson.course.online ? CourseStatus.ONLINE : undefined,
    createdByAccount: accountId,
  }));
}
