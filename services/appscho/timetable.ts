import { User, getPlanning, Lesson } from "appscho";
import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseType } from "../shared/timetable";

export async function fetchAppschoTimetable(session: User, accountId: string, weekNumber: number, instanceId: string): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber);
  
  try {
    const planning = await getPlanning(instanceId, session.token);
    console.log("Planning reçu:", planning.length, "événements");
    
    // Debug: regarder quelques dates d'événements
    console.log("Exemples de dates d'événements:");
    planning.slice(0, 3).forEach((lesson, i) => {
      console.log(`Événement ${i}:`, lesson.dtstart, "->", new Date(lesson.dtstart));
    });
    console.log("Filtrage entre:", start, "et", end);
    
    // Filtrer les événements de la semaine demandée
    const weekEvents = planning.filter((lesson: Lesson) => {
      const lessonDate = new Date(lesson.dtstart);
      const isInRange = lessonDate >= start && lessonDate <= end;
      
      if (isInRange) {
        console.log("Événement dans la plage:", lesson.dtstart, lesson.summary);
      }
      
      return isInRange;
    });
    
    console.log("Événements filtrés:", weekEvents.length);
    
    // Grouper les événements par date
    const eventsByDate = new Map<string, Lesson[]>();
    
    weekEvents.forEach((lesson: Lesson) => {
      const lessonDate = new Date(lesson.dtstart);
      const dateKey = lessonDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const existing = eventsByDate.get(dateKey) || [];
      existing.push(lesson);
      eventsByDate.set(dateKey, existing);
    });
    
    // Créer le résultat
    const result: CourseDay[] = [];
    
    // Générer chaque jour de la semaine
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateKey) || [];
      
      result.push({
        date: new Date(d),
        courses: mapAppschoCourses(dayEvents, accountId)
      });
    }
    
    console.log("Résultat final:", result);
    return result;
  } catch (error) {
    console.error("Erreur AppScho timetable:", error);
    throw new Error(`Failed to fetch AppScho timetable: ${error}`);
  }
}

function mapAppschoCourses(lessons: Lesson[], accountId: string): Course[] {
  return lessons.map((lesson) => {
    // Extraire le nom du professeur depuis la description si possible
    const teacherMatch = lesson.description?.match(/^([A-Z\s]+)/);
    const teacher = teacherMatch ? teacherMatch[1].trim() : undefined;

    return {
      subject: lesson.summary || "Cours",
      id: lesson.uid || `${lesson.dtstart}-${lesson.summary}`,
      type: CourseType.LESSON,
      from: new Date(lesson.dtstart),
      to: new Date(lesson.dtend),
      additionalInfo: lesson.description,
      room: lesson.locations && lesson.locations.length > 0 ? lesson.locations.join(", ") : lesson.location,
      teacher: teacher,
      backgroundColor: "#1E3035",
      status: undefined,
      createdByAccount: accountId,
    };
  }).sort((a, b) => a.from.getTime() - b.from.getTime()); // Trier par heure de début
}