import { Model, Q } from "@nozbe/watermelondb";

import { Course as SharedCourse,CourseDay as SharedCourseDay } from "@/services/shared/timetable"
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider"
import { mapCourseToShared } from "./mappers/course";
import Course from "./models/Timetable";
import { getDateRangeOfWeek } from "./useHomework";

export async function addCourseDayToDatabase(courses: SharedCourseDay[]) {
  const db = getDatabaseInstance();
  for (const day of courses) {
    for (const item of day.courses) {
      const id = generateId(JSON.stringify({...item, id: undefined}));
      const existingForAccount = await db.get('courses').query(Q.where('courseId', id)).fetch();

      if (existingForAccount.length === 0) {
        await db.write(async () => {
          await db.get('courses').create((record: Model) => {
            const course = record as Course;
            Object.assign(course, {
              createdByAccount: item.createdByAccount,
              courseId: id,
              subject: item.subject,
              type: item.type,
              from: item.from.getTime(),
              to: item.to.getTime(),
              additionalInfo: item.additionalInfo,
              room: item.room,
              teacher: item.teacher,
              group: item.group,
              backgroundColor: item.backgroundColor,
              status: item.status,
              customStatus: item.customStatus,
              url: item.url,
              kidName: item.kidName
            })
          })
        })
      }
    }
  }
}

export async function getCoursesFromCache(weekNumber: number): Promise<SharedCourseDay[]> {
  try {
    const database = getDatabaseInstance();
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const courses = await database
      .get<Course>('courses')
      .query(Q.where('from', Q.between(start.getTime(), end.getTime())))
      .fetch();

    const dayMap: Record<string, SharedCourse[]> = {};
    for (const course of courses) {
      const dayKey = new Date(course.from).toISOString().split("T")[0];
      dayMap[dayKey] = dayMap[dayKey] || [];
      dayMap[dayKey].push(mapCourseToShared(course));
    }

    for (const day in dayMap) {
      dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
    }
		
    return Object.entries(dayMap).map(([day, courses]) => ({
      date: new Date(day),
      courses
    }));
  } catch (e) {
    warn(String(e));
    return [];
  }
}