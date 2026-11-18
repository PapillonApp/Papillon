import { getPlanning, Lesson, User } from "@blockshub/blockscho";
import { endOfISOWeek, format, startOfDay, startOfISOWeek } from "date-fns";

import { getDateRangeOfWeek } from "@/database/useHomework";

import { parseADEDescription } from "../local/parsers/ade-parser";
import { Course, CourseDay, CourseType } from "../shared/timetable";

function parseAppschoDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  return new Date(dateStr.replace(" ", "T").replace(" +0000", "Z"));
}

export async function fetchAppschoTimetable(
  session: User,
  accountId: string,
  weekNumber: number,
  instanceId: string,
  _forceRefresh?: boolean,
  date?: Date
): Promise<CourseDay[]> {
  const { start, end } = date
    ? { start: startOfISOWeek(date), end: endOfISOWeek(date) }
    : getDateRangeOfWeek(weekNumber);
  try {
    const planning = await getPlanning(instanceId, session.token);
    if(!planning || planning.length === 0) {
      Error('Une erreur est survenue lors de la récupération de l\'emploi du temps. Veuillez réessayer ultérieurement.');
    }
    const weekEvents = planning.filter((lesson: Lesson) => {
      const lessonDate = parseAppschoDate(lesson.dtstart);
      return lessonDate >= start && lessonDate <= end;
    });
    const eventsByDate = new Map<string, Lesson[]>();
    weekEvents.forEach((lesson: Lesson) => {
      const lessonDate = parseAppschoDate(lesson.dtstart);
      const dateKey = format(lessonDate, "yyyy-MM-dd");
      const existing = eventsByDate.get(dateKey) || [];
      existing.push(lesson);
      eventsByDate.set(dateKey, existing);
    });
    const result: CourseDay[] = [];
    for (let d = startOfDay(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, "yyyy-MM-dd");
      const dayEvents = eventsByDate.get(dateKey) || [];
      result.push({
        date: startOfDay(d),
        courses: mapAppschoCourses(dayEvents, accountId)
      });
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch AppScho timetable: ${error}`);
  }
}



function mapAppschoCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons
    .map((lesson) => {
      const parsed = parseADEDescription(lesson.description || '');
      const group = parsed?.groups?.join(', ') || parsed?.group || undefined;
      const teacher = parsed?.teacher || undefined;
      const courseType = parsed?.type;

      let subjectName = lesson.summary || "Cours";
      if (courseType && !subjectName.includes(courseType)) {
        subjectName = `${subjectName} (${courseType})`;
      }

      return {
        subject: subjectName,
        id: lesson.uid || `${lesson.dtstart}-${lesson.summary}`,
        type: CourseType.LESSON,
        from: parseAppschoDate(lesson.dtstart),
        to: parseAppschoDate(lesson.dtend),
        additionalInfo: lesson.description,
        room: lesson.locations && lesson.locations.length > 0 ? lesson.locations.join(", ") : lesson.location,
        teacher,
        group,
        backgroundColor: "#1E3035",
        status: undefined,
        createdByAccount: accountId,
      };
    })
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}