import { User, getPlanning, Lesson } from "appscho";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseType } from "../shared/timetable";

function parseAppschoDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  return new Date(dateStr.replace(" ", "T").replace(" +0000", "Z"));
}

export async function fetchAppschoTimetable(
  session: User,
  accountId: string,
  weekNumber: number,
  instanceId: string
): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);
  try {
    const planning = await getPlanning(instanceId, session.token);

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

function mapAppschoCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons
    .map((lesson) => {
      let group: string | undefined;
      let teacher: string | undefined;
      if (lesson.description) {
        const lines = lesson.description.split('\n');
        group = lines[0]?.trim() || undefined;
        const rawTeacher = lines[1]?.trim();
        if (
          rawTeacher &&
          !/^0_Enseignant-non-renseigné/i.test(rawTeacher)
        ) {
          teacher = rawTeacher;
        }
      }
      return {
        subject: lesson.summary || "Cours",
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