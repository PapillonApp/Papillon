import type { UphfAccount } from "@/stores/account/types";
import type { Timetable, TimetableClass} from "../../shared/Timetable";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import type { EventResponse } from "uphf-api";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";

const decodeTimetableClass = (c: EventResponse): TimetableClass => ({
  subject: c.course.label,
  id: c.id,
  type: "lesson",
  title: c.course.label,
  startTimestamp: new Date(c.startDateTime).getTime(),
  endTimestamp: new Date(c.endDateTime).getTime(),
  room: c.course.online ? "En ligne" : c.rooms.map((room: any) => room.label).join(", "),
  teacher: c.teachers.map((teacher: any) => teacher.displayname).join(", "),
  backgroundColor: c.course.color,
  source: "UPHF",
});

export const getTimetableForWeek = async (account: UphfAccount, weekNumber: number): Promise<Timetable> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("UPHF");

  const timetable = await account.instance.getSchedule({startDate: weekNumberToDateRange(weekNumber).start.toISOString().split("T")[0], endDate:weekNumberToDateRange(weekNumber).end.toISOString().split("T")[0]});
  const eventsList = timetable.plannings.flatMap((planning) =>
    planning.events.map((event: EventResponse) => ({
      id: event.id,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      course: event.course,
      // TODO please test this... I refactored because it looked weird
      rooms: event.rooms,
      teachers: event.teachers,
      group: event.groups,
      groups: []
    }))
  );

  return await eventsList.map(decodeTimetableClass); // TODO for Papillon team: add the group to the timetable
};
