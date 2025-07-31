import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import type { SkolengoAccount } from "@/stores/account/types";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { toSkolengoDate } from "../skolengo-types";
import { TimetableClassStatus, type Timetable, type TimetableClass } from "@/services/shared/Timetable";
import type { Lesson } from "scolengo-api/types/models/Calendar";
import { htmlToText } from "html-to-text";

const decodeLesson = (lesson: Lesson): TimetableClass => ({
  subject: lesson.subject.label,
  id: lesson.id,
  type: "lesson",
  title: lesson.title,
  startTimestamp: new Date(lesson.startDateTime).getTime(),
  endTimestamp: new Date(lesson.endDateTime).getTime(),
  additionalNotes: lesson.contents?.map(e=>e.title+":\n"+htmlToText(e.html)).join("\n\n\n"),
  room: lesson.location ? lesson.location+(lesson.locationComplement ? " - "+lesson.locationComplement : "") : void 0,
  teacher: lesson.teachers?.map(e=>`${e.firstName.at(0)}. ${e.lastName}`).join("/"),
  backgroundColor: lesson.subject.color || void 0,
  status: lesson.canceled ? TimetableClassStatus.CANCELED : void 0,
});

export const getTimetableForWeek = async (account: SkolengoAccount, epochWeekNumber: number): Promise<Timetable> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const {start, end} = weekNumberToDateRange(epochWeekNumber);

  const agenda = await account.instance.getAgenda(undefined, toSkolengoDate(start), toSkolengoDate(end));
  const lessons = agenda.map(e=>e.lessons).flat();

  return lessons.map(decodeLesson);
};