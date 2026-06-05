import { User, getPlanning, Lesson } from "@studentsphere/linkgor";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseType } from "../shared/timetable";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

function parseWigorDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const parsed = new Date(dateStr.replace(" ", "T"));
  if (isNaN(parsed.getTime())) return parsed;
  return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60 * 1000);
}

let planningPromiseCache: Promise<Lesson[]> | null = null;
let cachedPlanning: Lesson[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchWigorTimetable(
  session: User,
  accountId: string,
  weekNumber: number,
  instanceId: string,
  forceRefresh?: boolean
): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);
  try {
    let planning: Lesson[];
    const now = Date.now();
    const shouldBypassCache = forceRefresh || (now - lastFetchTime > CACHE_TTL);

    if (shouldBypassCache) {
      planningPromiseCache = null;
      cachedPlanning = null;
    }

    if (cachedPlanning) {
      planning = cachedPlanning;
    } else {
      if (!planningPromiseCache) {
        planningPromiseCache = getPlanning(instanceId, session.token)
          .then((res) => {
            cachedPlanning = res;
            lastFetchTime = Date.now();
            return res;
          })
          .catch((err) => {
            planningPromiseCache = null;
            throw err;
          });
      }
      planning = await planningPromiseCache;
    }

    if (!planning) {
      throw new Error("Une erreur est survenue lors de la récupération de l'emploi du temps.");
    }
    const weekEvents = planning.filter((lesson: Lesson) => {
      const lessonDate = parseWigorDate(lesson.Start);
      return lessonDate >= start && lessonDate <= end;
    });
    const eventsByDate = new Map<string, Lesson[]>();
    weekEvents.forEach((lesson: Lesson) => {
      const lessonDate = parseWigorDate(lesson.Start);
      const dateKey = lessonDate.toISOString().split("T")[0];
      const existing = eventsByDate.get(dateKey) || [];
      existing.push(lesson);
      eventsByDate.set(dateKey, existing);
    });
    const result: CourseDay[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0];
      const dayEvents = eventsByDate.get(dateKey) || [];
      result.push({
        date: new Date(d),
        courses: mapWigorCourses(dayEvents, accountId),
      });
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch Wigor timetable: ${error}`);
  }
}

function mapWigorCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons
    .map((lesson) => {
      const subjectName = lesson.Matiere || lesson.Title || "Cours";
      
      getSubjectEmoji(subjectName);
      getSubjectColor(subjectName);
      getSubjectName(subjectName);
      
      return {
        subject: subjectName,
        id: lesson.NoCours ? String(lesson.NoCours) : `${lesson.Start}-${lesson.Title}`,
        type: CourseType.LESSON,
        from: parseWigorDate(lesson.Start),
        to: parseWigorDate(lesson.End),
        additionalInfo: lesson.Description || lesson.Commentaire || undefined,
        room: lesson.Salles || undefined,
        teacher: lesson.NomProf || undefined,
        group: lesson.LibelleGroupe || undefined,
        status: undefined,
        createdByAccount: accountId,
      };
    })
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}
