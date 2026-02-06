import { WebUntisClient } from "webuntis-client";
import { OwnTimetableResponse } from "webuntis-client/dist/types/timetable";

import {
  Course,
  CourseDay,
  CourseStatus,
  CourseType,
} from "@/services/shared/timetable";
import { error } from "@/utils/logger/logger";

const EXAM = "EXAM";

export async function fetchWebUntisWeekTimetable(
  session: WebUntisClient,
  accountId: string,
  date: Date
): Promise<CourseDay[]> {
  if (!session) {
    error("Session is undefined", "fetchWebUntisTimetable");
  }

  const startWeek = getStartOfWeek(date);
  const endWeek = getEndOfWeek(date);

  const timetable = await session.getOwnTimetable(startWeek, endWeek);

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
    courses,
  }));
}

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

const mapCourses = (
  accountId: string,
  timetable: OwnTimetableResponse
): Course[] => {
  const courseList: Course[] = [];

  for (const day of timetable.days) {
    // Traiter les gridEntries (cours normaux)
    for (const entry of day.gridEntries) {
      const courses = mapGridEntryToCourses(accountId, day.date, entry);
      courseList.push(...courses);
    }

    // Optionnel: traiter aussi les backEntries si nécessaire
    for (const entry of day.backEntries) {
      const course = mapBackEntryToCourse(accountId, day.date, entry);
      if (course) {
        courseList.push(course);
      }
    }
  }

  return courseList;
};

const mapGridEntryToCourses = (
  accountId: string,
  dateStr: string,
  entry: any
): Course[] => {
  const courses: Course[] = [];

  try {
    // Parser la date (format: "YYYYMMDD")
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));

    // Parser les heures (format: "HH:MM")
    const [startHour, startMin] = entry.duration.start.split(":").map(Number);
    const [endHour, endMin] = entry.duration.end.split(":").map(Number);

    const from = new Date(year, month, day, startHour, startMin);
    const to = new Date(year, month, day, endHour, endMin);

    // Parcourir toutes les positions pour créer un cours par position
    const positions = [
      entry.position1,
      entry.position2,
      entry.position3,
      entry.position4,
      entry.position5,
      entry.position6,
      entry.position7,
    ].filter(pos => pos && pos.length > 0);

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (!position || position.length === 0) {
        continue;
      }

      const posData = position[0]?.current;
      if (!posData) {
        continue;
      }

      const course: Course = {
        id: `${entry.ids.join("-")}-pos${i + 1}`,
        type: CourseType.LESSON,
        subject:
          posData.displayName ||
          posData.longName ||
          posData.shortName ||
          "Unknown",
        room: entry.position3?.[0]?.current?.displayName || "",
        teacher: "", // À ajuster selon votre besoin
        createdByAccount: accountId,
        from,
        to,
      };

      // Vérifier le statut
      if (entry.status === EXAM || entry.statusDetail === EXAM) {
        course.status = CourseStatus.EVALUATED;
      }

      console.log(course);

      courses.push(course);
    }

    // Si aucune position n'est trouvée, créer un cours par défaut
    if (courses.length === 0) {
      const course: Course = {
        id: entry.ids.join("-"),
        type: CourseType.LESSON,
        subject: entry.name || "Unknown",
        room: "",
        teacher: "",
        createdByAccount: accountId,
        from,
        to,
      };

      if (entry.status === EXAM || entry.statusDetail === EXAM) {
        course.status = CourseStatus.EVALUATED;
      }

      courses.push(course);
    }
  } catch (err) {
    error(`Failed to map grid entry: ${err}`, "mapGridEntryToCourses");
  }

  return courses;
};

const mapBackEntryToCourse = (
  accountId: string,
  dateStr: string,
  entry: any
): Course | null => {
  try {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));

    const [startHour, startMin] = entry.duration.start.split(":").map(Number);
    const [endHour, endMin] = entry.duration.end.split(":").map(Number);

    const from = new Date(year, month, day, startHour, startMin);
    const to = new Date(year, month, day, endHour, endMin);

    const course: Course = {
      id: entry.id.toString(),
      type: CourseType.LESSON,
      subject: entry.longName || entry.shortName || "Unknown",
      room: "",
      teacher: "",
      createdByAccount: accountId,
      from,
      to,
    };

    if (entry.status === EXAM || entry.statusDetail === EXAM) {
      course.status = CourseStatus.EVALUATED;
    }

    return course;
  } catch (err) {
    error(`Failed to map back entry: ${err}`, "mapBackEntryToCourse");
    return null;
  }
};
