import type { MultiAccount } from "@/stores/account/types";
import { TimetableClassStatus, type Timetable, type TimetableClass } from "../../shared/Timetable";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import type { EventResponse } from "esup-multi.js";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";

const decodeTimetableClass = (c: EventResponse): TimetableClass => ({
  subject: c.course.label,
  id: c.id,
  type: "lesson",
  title: c.course.label,
  startTimestamp: new Date(c.startDateTime).getTime(),
  endTimestamp: new Date(c.endDateTime).getTime(),
  room: c.rooms.map((room: any) => room.label).join(", ") || void 0,
  building: c.rooms.map((room: any) => room.building).filter((building: any) => building).join(", ") || void 0,
  teacher: c.teachers.map((teacher: any) => teacher.displayname).join(", ") || void 0,
  group: c.groups.map((group: any) => group.label).join(", ") || void 0,
  backgroundColor: c.course.color,
  status: c.course.online ? TimetableClassStatus.ONLINE : void 0,
  statusText: c.course.online ? TimetableClassStatus.ONLINE : void 0,
  source: "UPHF",
  url: c.course.url,
});

export const getTimetableForWeek = async (account: MultiAccount, weekNumber: number): Promise<Timetable> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("Multi");

  const timetable = await account.instance.getSchedules({ startDate: weekNumberToDateRange(weekNumber).start.toISOString().split("T")[0], endDate:weekNumberToDateRange(weekNumber).end.toISOString().split("T")[0] });
  const eventsList = timetable.plannings.flatMap((planning) =>
    planning.events.map((event: EventResponse) => ({
      id: event.id,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      course: event.course,
      rooms: event.rooms,
      teachers: event.teachers,
      groups: event.groups,
    }))
  );

  return await eventsList.map(decodeTimetableClass);
};
