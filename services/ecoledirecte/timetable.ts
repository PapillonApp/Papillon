import { Client, TimetableCourse, TimetableCourseType } from "@blockshub/blocksdirecte";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";

export async function fetchEDTimetable(session: Client, accountId: string, weekNumber: number): Promise<CourseDay[]> {
  try {
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const timetable = normalizeTimetable(
      await session.timetable.getTimetableBetweenDates(start, end, false)
    ).filter(course => course.codeMatiere !== "");
    const mappedCourses = mapEcoleDirecteCourses(timetable, accountId);
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
      courses
    }));
  } catch(error) {
    warn(String(error))
    return []
  }
}

function normalizeTimetable(data: unknown): TimetableCourse[] {
  if (Array.isArray(data)) {
    return data as TimetableCourse[];
  }

  if (data && typeof data === "object") {
    return Object.values(data as Record<string, unknown>).flatMap(value => {
      if (Array.isArray(value)) {
        return value as TimetableCourse[];
      }
      if (value && typeof value === "object" && "start_date" in value) {
        return [value as TimetableCourse];
      }
      return [];
    });
  }

  return [];
}

function mapEcoleDirecteCourses(data: TimetableCourse[], accountId: string): Course[] {
  return data.flatMap(item => {
    const from = new Date(item.start_date);
    const to = new Date(item.end_date);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return [];
    }

    return [{
      createdByAccount: accountId,
      subject: item.matiere,
      id: String(item.id),
      type: mapCourseKind(item.typeCours),
      from,
      to,
      additionalInfo: item.text,
      room: item.salle,
      teacher: item.prof,
      backgroundColor: item.color,
      status: item.isAnnule ? CourseStatus.CANCELED : undefined
    }];
  })
}

function mapCourseKind(kind: TimetableCourseType): CourseType {
  switch (kind) {
  case TimetableCourseType.PERMANENCY:
    return CourseType.ACTIVITY
  default:
    return CourseType.LESSON
  }
}