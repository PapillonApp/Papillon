import { WebAPITimetable, WebUntis } from "webuntis";

import { Course, CourseDay, CourseType } from "@/services/shared/timetable";
import { error } from "@/utils/logger/logger";

export async function fetchWebUntisWeekTimetable(
  session: WebUntis,
  accountId: string,
  weekNumberRaw: number,
  date: Date
): Promise<CourseDay[]> {
  if (!session) {
    error("Session is undefined", "fetchWebUntisTimetable");
  }

  const timetable = await session.getOwnTimetableForWeek(date);

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
    courses
  }));
}

const mapCourses = (
  accountId: string,
  courses: WebAPITimetable[]
): Course[] => {
  const courseList: Course[] = [];

  for (const c of courses) {
    const dateStr = c.date.toString();

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
  
    const startHour = Math.floor(c.startTime / 100);
    const startMin = c.startTime % 100;
    
    const endHour = Math.floor(c.endTime / 100);
    const endMin = c.endTime % 100;

    const from = new Date(year, month, day, startHour, startMin);
    const to = new Date(year, month, day, endHour, endMin);

    courseList.push({
      id: c.id.toString(),
      type: CourseType.LESSON,
      subject: c.subjects[0]?.element.name || "Unknown",
      room: c.rooms.map(r => r.element.name).join(", "),
      teacher: c.teachers.map(t => t.element.name).join(", "),
      createdByAccount: accountId,
      from: from,
      to: to,
    });
  }

  return courseList;
};