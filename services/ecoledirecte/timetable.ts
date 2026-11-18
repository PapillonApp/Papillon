import { Client, TimetableCourse, TimetableCourseType } from "@blockshub/blocksdirecte";
import { endOfISOWeek, format, startOfDay, startOfISOWeek } from "date-fns";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";

export async function fetchEDTimetable(session: Client, accountId: string, weekNumber: number, date?: Date): Promise<CourseDay[]> {
  try {
    const { start, end } = date
      ? { start: startOfISOWeek(date), end: endOfISOWeek(date) }
      : getDateRangeOfWeek(weekNumber);

    const timetable = (await session.timetable.getTimetableBetweenDates(start, end, false)).filter(course => course.codeMatiere !== "");
    const mappedCourses = mapEcoleDirecteCourses(timetable, accountId);
    const dayMap: Record<string, Course[]> = {};

    for (const course of mappedCourses) {
      const dayKey = format(course.from, "yyyy-MM-dd");
      dayMap[dayKey] = dayMap[dayKey] || [];
      dayMap[dayKey].push(course);
    }

    for (const day in dayMap) {
      dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
    }

    return Object.values(dayMap).map((courses) => ({
      date: startOfDay(courses[0].from),
      courses
    }));
  } catch(error) {
    warn(String(error))
    return []
  }
}

function mapEcoleDirecteCourses(data: TimetableCourse[], accountId: string): Course[] {
  return data.map(item => ({
    createdByAccount: accountId,
    subject: item.matiere,
    id: String(item.id),
    type: mapCourseKind(item.typeCours),
    from: new Date(item.start_date),
    to: new Date(item.end_date),
    additionalInfo: item.text,
    room: item.salle,
    teacher: item.prof,
    backgroundColor: item.color,
    status: item.isAnnule ? CourseStatus.CANCELED : undefined
  }))
}

function mapCourseKind(kind: TimetableCourseType): CourseType {
  switch (kind) {
  case TimetableCourseType.PERMANENCY:
    return CourseType.ACTIVITY
  default:
    return CourseType.LESSON
  }
}