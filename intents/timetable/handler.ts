import { IntentHandler, registerHandler } from "papillon-intents";
import { error } from "@/utils/logger/logger";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { initManager, parseDate } from "@/intents/helpers";
import { getSubjectName } from "@/utils/subjects/name";
import { CourseStatus } from "@/services/shared/timetable";
import { isSameDay } from "date-fns";

async function fetchCoursesForDate(date: Date) {
  const manager = await initManager();
  if (!manager) return null;

  const weekNumber = getWeekNumberFromDate(date);
  const courseDays = await manager.getWeeklyTimetable(weekNumber, date);
  const day = courseDays.find(d => isSameDay(d.date, date));
  if (!day || day.courses.length === 0) return null;

  return day.courses.map(course => ({
    id: course.id,
    subject: getSubjectName(course.subject),
    from: course.from,
    to: course.to,
    room: course.room,
    teacher: course.teacher,
    isCanceled: course.status === CourseStatus.CANCELED,
    status:
      course.status !== undefined ? CourseStatus[course.status] : undefined,
  }));
}

const getTodayTimetable: IntentHandler = async () => {
  try {
    return await fetchCoursesForDate(new Date());
  } catch (err) {
    error(`Error in getTodayTimetable: ${err}`);
    return null;
  }
};

const getTimetableForDay: IntentHandler = async params => {
  try {
    return await fetchCoursesForDate(parseDate(params.day));
  } catch (err) {
    error(`Error in getTimetableForDay: ${err}`);
    return null;
  }
};

registerHandler("timetable.getToday", getTodayTimetable);
registerHandler("timetable.getForDay", getTimetableForDay);