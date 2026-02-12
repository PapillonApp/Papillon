import { User, getPlanning, Lesson } from "appscho";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseType } from "../shared/timetable";
import { parseADEDescription } from "../local/parsers/ade-parser";

function parseAppschoDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  
  const formatted = dateStr
    .trim()
    .replace(" ", "T")
    .replace(/\s?\+(\d{2})(\d{2})/, "+$1:$2")
  const d = new Date(formatted);
  
  if (isNaN(d.getTime())) {
    return new Date(dateStr.replace(" ", "T").split(" ")[0]);
  }
  
  return d;
}

export async function fetchAppschoTimetable(
  session: User,
  accountId: string,
  weekNumber: number,
  instanceId: string,
  _forceRefresh?: boolean
): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);

  try {
    const rawData = await getPlanning(instanceId, session.token);

    const planning: Lesson[] = Array.isArray(rawData) ? rawData : (rawData as any)?.response || [];

    if (planning.length === 0) return [];

    const weekEvents = planning.filter((lesson: Lesson) => {
      const rawStart = lesson.dtstart || (lesson as any).DTSTART;
      const lessonDate = parseAppschoDate(rawStart);

      if (isNaN(lessonDate.getTime())) return false;

      const isAfterStart = lessonDate >= start;
      const isBeforeEnd = lessonDate <= end;

      return isAfterStart && isBeforeEnd;
    });

    const eventsByDate = new Map<string, Lesson[]>();
    weekEvents.forEach((lesson: Lesson) => {
      const lessonDate = parseAppschoDate(lesson.dtstart || (lesson as any).DTSTART);
      const dateKey = lessonDate.toISOString().split('T')[0];
      const existing = eventsByDate.get(dateKey) || [];
      existing.push(lesson);
      eventsByDate.set(dateKey, existing);
    });

    const result: CourseDay[] = [];
    const currentIterDate = new Date(start);

    for (let i = 0; i < 7; i++) {
      const dateKey = currentIterDate.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateKey) || [];
      
      result.push({
        date: new Date(currentIterDate),
        courses: mapAppschoCourses(dayEvents, accountId)
      });
      
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error(`[Appscho-Error] ${error}`);
    throw new Error(`Failed to fetch AppScho timetable: ${error}`);
  }
}

function mapAppschoCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons
    .map((lesson) => {
      const raw = lesson as any;
      const parsed = parseADEDescription(lesson.description || '');
      
      const group = parsed?.groups?.join(', ') || parsed?.group || undefined;
      const teacher = parsed?.teacher || raw.teachers?.join(", ") || undefined;
      const courseType = parsed?.type;

      let subjectName = lesson.summary || "Cours";
      if (courseType && !subjectName.includes(courseType)) {
        subjectName = `${subjectName} (${courseType})`;
      }

      const from = parseAppschoDate(lesson.dtstart || raw.DTSTART);
      const to = parseAppschoDate(lesson.dtend || raw.DTEND);

      return {
        subject: subjectName,
        id: lesson.uid || `${from.getTime()}-${subjectName}`,
        type: CourseType.LESSON,
        from,
        to,
        additionalInfo: lesson.description,
        room: (lesson.locations && lesson.locations.length > 0) 
          ? lesson.locations.join(", ") 
          : lesson.location,
        teacher,
        group,
        backgroundColor: "#1E3035",
        status: undefined,
        createdByAccount: accountId,
      };
    })
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}