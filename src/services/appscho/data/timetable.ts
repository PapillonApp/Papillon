import type { AppschoAccount } from "@/stores/account/types";
import { type Timetable, type TimetableClass } from "../../shared/Timetable";
import { getPlanning, type Lesson } from "appscho";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { parse } from "date-fns";

const decodeTimetableClass = (c: any): TimetableClass => ({
  subject: c.course,
  id: c.id,
  type: "lesson",
  title: c.course,
  startTimestamp: c.startDateTime.getTime(),
  endTimestamp: c.endDateTime.getTime(),
  room: c.rooms && Array.isArray(c.rooms) ? c.rooms.join(", ") : (c.rooms || undefined),
  teacher: c.teachers ? c.teachers.split("\n ").join(", ") : undefined,
  source: "APPSCHO",

});

export const getTimetableForWeek = async (account: AppschoAccount, weekNumber: number): Promise<Timetable> => {
  if (!account.authentication) {
    throw new ErrorServiceUnauthenticated("Appscho");
  }

  const { start: weekStartDate, end: weekEndDate } = weekNumberToDateRange(weekNumber);

  let allEventsFromAPI = [];
  try {
    allEventsFromAPI = await getPlanning(account.authentication.instanceAppscho, account.authentication.token);
  } catch (error) {
    return [];
  }

  const eventsForWeek = allEventsFromAPI.filter((event: Lesson) => {
    if (!event.dtstart || !event.dtstart) {
      return false;
    }
    const eventStartDate = parse(event.dtstart, "yyyy-MM-dd HH:mm:ss X", new Date());
    return eventStartDate >= weekStartDate && eventStartDate <= weekEndDate;
  });

  const eventsList = eventsForWeek.map((event: Lesson) => ({
    id: event.uid,
    startDateTime: parse(event.dtstart, "yyyy-MM-dd HH:mm:ss X", new Date()),
    endDateTime: parse(event.dtend, "yyyy-MM-dd HH:mm:ss X", new Date()),
    course: event.summary,
    rooms: event.locations,
    teachers: event.description,
    groups: "",
  }));

  return eventsList.map(decodeTimetableClass);
};
