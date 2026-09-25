import { Client, TimetableCourse, TimetableCourseType } from "@blockshub/blocksdirecte";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";
import { requireResponseArray } from "./response";

export async function fetchEDTimetable(session: Client, accountId: string, weekNumber: number): Promise<CourseDay[]> {
  try {
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const response = await session.timetable.getTimetableBetweenDates(start, end, false);
    const timetable = requireResponseArray<TimetableCourse>(response, [
      "cours",
      "courses",
      "timetable",
      "emploiDuTemps",
      "data",
      "result",
    ], "EcoleDirecte timetable").filter(course => course.codeMatiere !== "");
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
    throw error
  }
}

function mapEcoleDirecteCourses(data: TimetableCourse[], accountId: string): Course[] {
  return data.flatMap(item => {
    if (!item) return [];
    const from = new Date(item.start_date);
    const to = new Date(item.end_date);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) return [];

    return [{
      createdByAccount: accountId,
      subject: item.matiere ?? "Cours",
      id: String(item.id ?? `${from.getTime()}-${to.getTime()}`),
      type: mapCourseKind(item.typeCours),
      from,
      to,
      additionalInfo: item.text,
      room: item.salle,
      teacher: item.prof,
      backgroundColor: item.color,
      status: item.isAnnule ? CourseStatus.CANCELED : undefined
    }];
  });
}

function mapCourseKind(kind: TimetableCourseType): CourseType {
  switch (kind) {
  case TimetableCourseType.PERMANENCY:
    return CourseType.ACTIVITY
  default:
    return CourseType.LESSON
  }
}
