import { Account, Session, studentTimetable, TimetableItem, TimetableItemKind } from "pawdirecte";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";

export async function fetchEDTimetable(session: Session, account: Account, accountId: string, weekNumber: number): Promise<CourseDay[]> {
  try {
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const timetable = await studentTimetable(session, account, start, end);
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

function mapEcoleDirecteCourses(data: TimetableItem[], accountId: string): Course[] {
  return data.map(item => ({
    createdByAccount: accountId,
    subject: item.subjectName,
    id: String(item.id),
    type: mapCourseKind(item.kind),
    from: item.startDate,
    to: item.endDate,
    additionalInfo: item.notes,
    room: item.room,
    teacher: item.teacher,
    backgroundColor: item.color,
    status: item.cancelled ? CourseStatus.CANCELED : undefined
  }))
}

function mapCourseKind(kind: TimetableItemKind): CourseType {
  switch (kind) {
  case TimetableItemKind.SANCTION:
    return CourseType.DETENTION
  case TimetableItemKind.EVENEMENT:
    return CourseType.ACTIVITY
  case TimetableItemKind.CONGE:
    return CourseType.VACATION
  default:
    return CourseType.LESSON
  }
}