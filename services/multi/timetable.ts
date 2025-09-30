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
  weekNumber: number
): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);
  const result: CourseDay[] = [];

  const timetable = await session.getSchedules({
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  });

  for (const day of timetable.plannings) {
    const courses = mapMultiCourse(day.events, accountId);
    result.push({
      date: day.events[0]?.startDateTime
        ? new Date(day.events[0].startDateTime)
        : new Date(),
      courses: courses,
    });
  }

  return result;
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
