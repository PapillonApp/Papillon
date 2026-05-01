import { getDateRangeOfWeek } from "@/database/useHomework";
import { Day, WebUntisClient } from "webuntis-client";
import { Course, CourseDay, CourseStatus, CourseType } from "@/services/shared/timetable";


export async function fetchWebUntisTimetable(client: WebUntisClient, accountId: string, weekNumberRaw: number): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumberRaw)
  const timetable = await client.timetable.getOwn({ start, end });

  const mappedCourses = mapCourses(accountId, timetable);
  const dayMap: Record<string, Course[]> = {};

  for ( const course of mappedCourses ) {
    const dayKey = course.from.toISOString().split("T")[0];
    dayMap[dayKey] = dayMap[dayKey] || [];
    dayMap[dayKey].push(course);
  }

  for ( const day in dayMap ) {
    dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
  }

  return Object.entries(dayMap).map(([day, courses]) => ({
    date: new Date(day),
    courses
  }));
}

const mapCourses = (accountId: string, days: Day[]): Course[] => {
  const coursesList: Course[] = [];

  for ( const d of days ) {
    for ( const c of d.courses ) {
      const subject = c.subject?.longName ?? "";
      const teacher = c.teacher?.longName ?? "";
      const room = c.room?.longName ?? "";

      coursesList.push({
        id: c.id.toString(),
        from: c.from,
        to: c.to,
        subject: subject,
        teacher: teacher,
        room: room,
        type: CourseType.LESSON,
        status: mapCourseStatus(c.type),
        createdByAccount: accountId,
      });
    }
  }

  return coursesList;
}

const mapCourseStatus = (type: "NORMAL_TEACHING_PERIOD" | "EXAM" | string): CourseStatus | undefined => {
  switch ( type ) {
    case "EXAM":
      return CourseStatus.EVALUATED;
  }

  return undefined;
}