import { Model, Q } from "@nozbe/watermelondb";

import { Course as SharedCourse,CourseDay as SharedCourseDay } from "@/services/shared/timetable"
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider"
import { mapCourseToShared } from "./mappers/course";
import Course from "./models/Timetable";
import { getDateRangeOfWeek } from "./useHomework";
import { useEffect, useState } from "react";

export function useTimetable(refresh = 0, weekNumber = 0) {
  const database = useDatabase();
  const [timetable, setTimetable] = useState<SharedCourseDay[]>([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      const timetableFetched = await getCoursesFromCache(weekNumber);
      setTimetable(timetableFetched);
    };
    fetchTimetable();
  }, [refresh, database, weekNumber]);

  return timetable;
}

async function deleteUnavailableCourses(day: SharedCourseDay) {
  const database = getDatabaseInstance();
  const start = new Date(day.date.setUTCHours(0, 0, 0, 0));
  const end = new Date(day.date.setUTCHours(23, 59, 59, 999));

  const dbCourses = await database
    .get<Course>('courses')
    .query(Q.where('from', Q.between(start.getTime(), end.getTime())))
    .fetch();

  const dayCourseIds = new Set(
    day.courses.map(item =>
      generateId(
        item.from.toISOString() +
        item.to.toISOString() +
        item.subject +
        item.teacher +
        item.createdByAccount
      )
    )
  );

  const coursesToDelete = dbCourses.filter(
    dbCourse => !dayCourseIds.has(dbCourse.courseId)
  );

  if (coursesToDelete.length > 0) {
    await database.write(async () => {
      for (const course of coursesToDelete) {
        await course.markAsDeleted();
      }
    });
  }
}

export async function addCourseDayToDatabase(courses: SharedCourseDay[]) {
  const db = getDatabaseInstance();

  await db.write(async () => {
    for (const day of courses) {
      await deleteUnavailableCourses(day)
      for (const item of day.courses) {
        // MIGRATION TO AVOID DUPES, DO NOT DELETE
        const oldId = generateId( item.from.toISOString() + item.to.toISOString() + item.subject + item.teacher + item.room + item.createdByAccount);
        const id = generateId( item.from.toISOString() + item.to.toISOString() + item.subject + item.teacher + item.createdByAccount);

        const oldExistingRecords = await db.get('courses')
          .query(Q.where('courseId', oldId))
          .fetch();
        const existingRecords = await db.get('courses')
          .query(Q.where('courseId', id))
          .fetch();

        if (oldExistingRecords.length !== 0) {
          for (const oldRecord of oldExistingRecords) {
            await oldRecord.markAsDeleted();
          }
        }

        if (existingRecords.length === 0) {
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
              kidName: item.kidName,
            });
          });
        } else {
          const courseToUpdate = existingRecords[0];
          await courseToUpdate.update((model: Model) => {
            const course = model as Course;
            Object.assign(course, {
              subject: item.subject ?? course.subject,
              type: item.type ?? course.type,
              from: item.from.getTime(),
              to: item.to.getTime(),
              additionalInfo: item.additionalInfo ?? course.additionalInfo,
              room: item.room ?? course.room,
              teacher: item.teacher ?? course.teacher,
              group: item.group ?? course.group,
              backgroundColor: item.backgroundColor ?? course.backgroundColor,
              status: item.status ?? course.status,
              customStatus: item.customStatus ?? course.customStatus,
              url: item.url ?? course.url,
              kidName: item.kidName ?? course.kidName,
            });
          });
        }
      }
    }
  });
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