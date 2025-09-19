import { User, getPlanning, Lesson } from "appscho";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseType } from "../shared/timetable";

function parseAppschoDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  return new Date(dateStr.replace(" ", "T").replace(" +0000", "Z"));
}

const appschoCache = new Map<string, { data: Lesson[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchAppschoTimetable(
  session: User,
  accountId: string,
  weekNumber: number,
  instanceId: string,
  forceRefresh?: boolean
): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);
  try {
    const cacheKey = `${instanceId}-${session.token}`;
    const cached = appschoCache.get(cacheKey);
    let planning: Lesson[];
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      planning = cached.data;
    } else {
      planning = await getPlanning(instanceId, session.token);
      appschoCache.set(cacheKey, { data: planning, timestamp: Date.now() });
    }
    const weekEvents = planning.filter((lesson: Lesson) => {
      const lessonDate = parseAppschoDate(lesson.dtstart);
      return lessonDate >= start && lessonDate <= end;
    });
    const eventsByDate = new Map<string, Lesson[]>();
    weekEvents.forEach((lesson: Lesson) => {
      const lessonDate = parseAppschoDate(lesson.dtstart);
      const dateKey = lessonDate.toISOString().split('T')[0];
      const existing = eventsByDate.get(dateKey) || [];
      existing.push(lesson);
      eventsByDate.set(dateKey, existing);
    });
    const result: CourseDay[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateKey) || [];
      result.push({
        date: new Date(d),
        courses: mapAppschoCourses(dayEvents, accountId)
      });
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch AppScho timetable: ${error}`);
  }
}


function parseAppschoDescription(description: string): { group?: string; teacher?: string; courseType?: string } {
  if (!description) return {};
  const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
  let group: string | undefined;
  let teacher: string | undefined;
  let courseType: string | undefined;
  for (const line of lines) {
    if (!line) continue;
    if (line.match(/^(CM|TDA|TD|TP|TP\d+|TD\d+|CM\d+|projection film)$/i)) {
      group = line;
    }
    else if (!teacher && line.split(' ').length <= 2 && line === line.toUpperCase() &&
             !/^0_Enseignant-non-renseigné/i.test(line) &&
             !line.match(/^(CM|TDA|TD|TP)/i)) {
      teacher = line;
    }
    else if (!courseType && line.match(/^[A-Z0-9\-]+$/)) {
      courseType = line;
    }
  }
  return { group, teacher, courseType };
}

function mapAppschoCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons
    .map((lesson) => {
      const { group, teacher, courseType } = parseAppschoDescription(lesson.description || '');
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