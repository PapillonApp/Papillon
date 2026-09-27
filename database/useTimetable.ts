import { Model, Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { getICalCourseById, getICalEventsForWeek } from "@/services/local/ical";
import { Course as SharedCourse,CourseDay as SharedCourseDay } from "@/services/shared/timetable"
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider"
import { mapCourseToShared } from "./mappers/course";
import Course from "./models/Timetable";
import { safeWrite } from "./utils/safeTransaction";
import { getISOWeekYear, getWeekRange } from "@/utils/services/periods";

function isoYearOf(d: Date): number {
  try {
    return getISOWeekYear(d).year;
  } catch {
    return d.getFullYear();
  }
}

export function getCourseRouteId(course: SharedCourse): string {
  try {
    const owner = typeof course?.createdByAccount === "string" ? course.createdByAccount : "";
    if (owner.startsWith('ical_') || owner === 'android_calendar' || owner.startsWith('calendar_')) {
      return `device_${owner}_${String(course?.id ?? "")}`;
    }
    const from = course?.from instanceof Date ? course.from.toISOString() : new Date(course?.from).toISOString();
    const to = course?.to instanceof Date ? course.to.toISOString() : new Date(course?.to).toISOString();
    const kid = typeof (course as any)?.kidName === "string" ? (course as any).kidName : "";
    return generateId(
      from + to + (course?.subject ?? "") + (course?.teacher ?? "") + (course?.room ?? "") + kid + owner
    );
  } catch {
    return generateId(
      String(course?.id ?? "") + String(course?.subject ?? "") + String(course?.createdByAccount ?? "")
    );
  }
}

export async function getCourseById(id: string): Promise<SharedCourse | undefined> {  try {
    const courses = await getDatabaseInstance()
      .get<Course>('courses')
      .query(Q.where('courseId', id))
      .fetch();
    return courses[0] ? mapCourseToShared(courses[0]) : await getICalCourseById(id);
  } catch {
    return getICalCourseById(id);
  }
}

/** Persiste le contenu/ressources d'un cours (batch cahier de textes ou
 *  fiche cours) sans toucher au reste. Best-effort : jamais de throw. */
export async function saveCourseContentRaw(
  routeId: string,
  resources: SharedCourse["content"]
): Promise<boolean> {
  try {
    if (!routeId || !Array.isArray(resources) || resources.length === 0) return false;
    const db = getDatabaseInstance();
    const recs = await db.get<Course>("courses").query(Q.where("courseId", routeId)).fetch();
    if (recs.length === 0) return false;
    const raw = JSON.stringify(resources);
    await safeWrite(
      db,
      async () => {
        await (recs[0] as Course).update((model: Model) => {
          (model as Course).contentRaw = raw;
        });
      },
      10000,
      "save_course_content"
    );
    return true;
  } catch {
    return false;
  }
}

export function useTimetable(refresh = 0, weekNumber: number | number[] = 0, date: Date = new Date()) {
  const database = useDatabase();
  const [timetable, setTimetable] = useState<SharedCourseDay[]>([]);

  const weeks = Array.isArray(weekNumber) ? weekNumber : [weekNumber];
  // Create a stable key for the weeks array to use in dependency arrays
  const weeksKey = weeks.join(',');
  const isoYear = isoYearOf(date);

  useEffect(() => {
    const fetchTimetable = async () => {
      const timetableFetched = await getCoursesFromCache(weeks, isoYearOf(date));
      setTimetable(timetableFetched);
    };
    fetchTimetable();
  }, [refresh, database, weeksKey, isoYear]);

  useEffect(() => {
    const icalQuery = database.get('icals').query();
    const subscription = icalQuery.observe().subscribe(() => {
      const fetchTimetable = async () => {
        const timetableFetched = await getCoursesFromCache(weeks, isoYearOf(date));
        setTimetable(timetableFetched);
      };
      fetchTimetable();
    });
    // Les writes EDT (addCourseDayToDatabase / saveCourseContentRaw) ne
    // changeaient jamais `database` ni `refresh` : le widget accueil restait
    // vide après le fetch. On observe aussi `courses` pour recharger.
    let courseSub: { unsubscribe: () => void } | null = null;
    try {
      const courseQuery = database.get('courses').query();
      courseSub = courseQuery.observe().subscribe(() => {
        const fetchTimetable = async () => {
          const timetableFetched = await getCoursesFromCache(weeks, isoYearOf(date));
          setTimetable(timetableFetched);
        };
        fetchTimetable();
      });
    } catch {
      courseSub = null;
    }
    return () => {
      subscription.unsubscribe();
      try { courseSub?.unsubscribe(); } catch { /* best-effort */ }
    };
  }, [database, weeksKey, isoYear]);

  return timetable;
}

export async function addCourseDayToDatabase(courses: SharedCourseDay[]) {
  const db = getDatabaseInstance();
  await safeWrite(
    db,
    async () => {
      const courseKey = (c: SharedCourseDay["courses"][number]) =>
        `${c.createdByAccount}::${(c as any)?.kidName ?? ""}`;
      // Clés rafraîchies sur toute la semaine : permet de purger les jours
      // devenus vides (aucun cours) pour ces comptes/enfants.
      const weekKeys = new Set<string>();
      for (const day of courses) {
        for (const c of day.courses) weekKeys.add(courseKey(c));
      }
      for (const day of courses) {
        const dayTimestamp = day.date.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        const dbCourses = await db.get<Course>('courses')
          .query(
            Q.where('from', Q.between(dayTimestamp, dayTimestamp + oneDayMs))
          )
          .fetch();

        const dayCourseIds = new Set(
          day.courses.map(course => {
            const kid = (course as any)?.kidName ?? "";
            const oldId = generateId(course.from.toISOString() + course.to.toISOString() + course.subject + course.teacher + course.room + course.createdByAccount);
            const midId = generateId(course.from.toISOString() + course.to.toISOString() + course.subject + course.teacher + course.createdByAccount);
            const newId = getCourseRouteId(course as SharedCourse);
            void kid;
            return [oldId, midId, newId];
          }).flat()
        );
        const refreshedKeys = new Set(day.courses.map(courseKey));
        // Jour vide : on purge avec les clés de la semaine (même fetch).
        const keysForDay = day.courses.length > 0 ? refreshedKeys : weekKeys;

        const coursesToDelete = dbCourses.filter(
          dbCourse =>
            keysForDay.has(`${dbCourse.createdByAccount}::${(dbCourse as any)?.kidName ?? ""}`) &&
            !dayCourseIds.has(dbCourse.courseId)
        );

        if (coursesToDelete.length > 0) {
          await Promise.all(coursesToDelete.map(course => course.markAsDeleted()));
        }

        for (const item of day.courses) {
          // MIGRATION TO AVOID DUPES, DO NOT DELETE
          const oldId = generateId(item.from.toISOString() + item.to.toISOString() + item.subject + item.teacher + item.room + item.createdByAccount);
          const id = getCourseRouteId(item);

          const oldExistingRecords = await db.get('courses')
            .query(Q.where('courseId', oldId))
            .fetch();
          const existingRecords = await db.get('courses')
            .query(Q.where('courseId', id))
            .fetch();

          if (oldId !== id && oldExistingRecords.length > 0) {
            await Promise.all(oldExistingRecords.map(oldRecord => oldRecord.markAsDeleted()));
          }

          if (existingRecords.length > 1) {
            // Doublons historiques sur le même courseId -> on ne garde que le 1er.
            await Promise.all(existingRecords.slice(1).map(r => r.markAsDeleted()));
          }

          if (existingRecords.length === 0) {
            await db.get('courses').create((record: Model) => {
              const course = record as Course;
              Object.assign(course, {
                createdByAccount: item.createdByAccount,
                courseId: id,
                subject: item.subject,
                subjectId: (item as any).subjectId,
                type: item.type,
                from: item.from.getTime(),
                to: item.to.getTime(),
                additionalInfo: item.additionalInfo,
                room: item.room,
                teacher: item.teacher,
                teacherNamesRaw: (item as any).teacherNames ? JSON.stringify((item as any).teacherNames) : undefined,
                classroomsRaw: (item as any).classrooms ? JSON.stringify((item as any).classrooms) : undefined,
                group: item.group,
                groupNamesRaw: (item as any).groupNames ? JSON.stringify((item as any).groupNames) : undefined,
                num: (item as any).num,
                detention: (item as any).detention,
                outing: (item as any).outing,
                isTest: (item as any).isTest,
                exempted: (item as any).exempted,
                virtualClassroomsRaw: (item as any).virtualClassrooms ? JSON.stringify((item as any).virtualClassrooms) : undefined,
                backgroundColor: item.backgroundColor,
                status: item.status,
                customStatus: item.customStatus,
                url: item.url,
                kidName: item.kidName,
                resourceId: (item as { resourceId?: string }).resourceId,
                contentRaw: item.content && item.content.length > 0 ? JSON.stringify(item.content) : undefined,
              });
            });
          } else {
            const courseToUpdate = existingRecords[0];
            await courseToUpdate.update((model: Model) => {
              const course = model as Course;
              Object.assign(course, {
                subject: item.subject ?? course.subject,
                subjectId: (item as any).subjectId ?? (course as any).subjectId,
                type: item.type ?? course.type,
                from: item.from.getTime(),
                to: item.to.getTime(),
                additionalInfo: item.additionalInfo ?? course.additionalInfo,
                room: item.room ?? course.room,
                teacher: item.teacher ?? course.teacher,
                teacherNamesRaw: (item as any).teacherNames ? JSON.stringify((item as any).teacherNames) : (course as any).teacherNamesRaw,
                classroomsRaw: (item as any).classrooms ? JSON.stringify((item as any).classrooms) : (course as any).classroomsRaw,
                group: item.group ?? course.group,
                groupNamesRaw: (item as any).groupNames ? JSON.stringify((item as any).groupNames) : (course as any).groupNamesRaw,
                num: (item as any).num ?? (course as any).num,
                detention: (item as any).detention ?? (course as any).detention,
                outing: (item as any).outing ?? (course as any).outing,
                isTest: (item as any).isTest ?? (course as any).isTest,
                exempted: (item as any).exempted ?? (course as any).exempted,
                virtualClassroomsRaw: (item as any).virtualClassrooms ? JSON.stringify((item as any).virtualClassrooms) : (course as any).virtualClassroomsRaw,
                backgroundColor: item.backgroundColor ?? course.backgroundColor,
                status: item.status ?? course.status,
                customStatus: item.customStatus ?? course.customStatus,
                url: item.url ?? course.url,
                kidName: item.kidName ?? course.kidName,
                resourceId: (item as { resourceId?: string }).resourceId ?? (course as unknown as { resourceId?: string }).resourceId,
                // Ne jamais écraser un contenu existant par un EDT vide :
                // l'EDT rapide renvoie content: [] volontairement.
                contentRaw: item.content && item.content.length > 0 ? JSON.stringify(item.content) : course.contentRaw,
              });
            });
          }
        }
      }
    },
    15000,
    `add_timetable_${courses.length}_days`
  );
}

export async function getCoursesFromCache(weeks: number[], year: number): Promise<SharedCourseDay[]> {
  try {
    const database = getDatabaseInstance();
    
    let minStart = new Date(8640000000000000);
    let maxEnd = new Date(-8640000000000000);
    
    for (const w of weeks) {
      const { start, end } = getWeekRange(w, year);
      if (start < minStart) {minStart = start;}
      if (end > maxEnd) {maxEnd = end;}
    }

    const courses = await database
      .get<Course>('courses')
      .query(Q.where('from', Q.between(minStart.getTime(), maxEnd.getTime())))
      .fetch();

    const localDayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayMap: Record<string, SharedCourse[]> = {};
    const seenKeys = new Set<string>();
    // Clé canonique partout (DB + hooks) : sans owner, avec teacher + kid.
    const cacheKey = (c: SharedCourse) =>
      `${new Date(c.from).getTime()}::${new Date(c.to).getTime()}::${c.subject}::${(c as any)?.room ?? ""}::${(c as any)?.teacher ?? ""}::${(c as any)?.kidName ?? ""}`;
    for (const course of courses) {
      const shared = mapCourseToShared(course);
      const k = cacheKey(shared);
      if (seenKeys.has(k)) continue;
      seenKeys.add(k);
      const dayKey = localDayKey(new Date(course.from));
      dayMap[dayKey] = dayMap[dayKey] || [];
      dayMap[dayKey].push(shared);
    }

    try {
      const icalEvents = await getICalEventsForWeek(minStart, maxEnd);
      for (const event of icalEvents) {
        const k = cacheKey(event);
        if (seenKeys.has(k)) continue;
        seenKeys.add(k);
        const dayKey = localDayKey(new Date(event.from));
        dayMap[dayKey] = dayMap[dayKey] || [];
        dayMap[dayKey].push(event);
      }
    } catch (icalError) {
      console.warn('Error loading iCal events:', icalError);
    }

    for (const day in dayMap) {
      dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
    }

    return Object.entries(dayMap)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([day, courses]) => ({
        date: new Date(day + "T00:00:00"),
        courses
      }));
  } catch (e) {
    warn(String(e));
    return [];
  }
}
