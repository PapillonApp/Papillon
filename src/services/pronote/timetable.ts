import type { PronoteAccount } from "@/stores/account/types";
import { TimetableClassStatus, type Timetable, type TimetableClass } from "../shared/Timetable";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote from "pawnote";
import { info } from "@/utils/logger/logger";

export const pronoteFirstDate = new Date("2024-09-01");

const decodeTimetableClass = (c: pronote.TimetableClassLesson | pronote.TimetableClassDetention | pronote.TimetableClassActivity): TimetableClass => {
  const base = {
    startTimestamp: c.startDate.getTime(),
    endTimestamp: c.endDate.getTime(),
    additionalNotes: c.notes,
    backgroundColor: c.backgroundColor
  };

  if (c.is === "lesson") {
    return {
      type: "lesson",
      id: c.id,
      title: c.subject!.name,
      subject: c.subject!.name,
      room: c.classrooms.join(", ") || void 0,
      teacher: c.teacherNames?.join(", ") ?? void 0,
      status: c.status === "Cours annulé" || c.status === "Prof. absent" || c.status === "Classe absente" || c.status === "Prof./pers. absent" || c.status === "Sortie pédagogique" ? TimetableClassStatus.CANCELED : c.test ? TimetableClassStatus.TEST : void 0,
      statusText: c.test ? "Devoir Surveillé" : c.status,
      ...base
    } satisfies TimetableClass;
  }
  else if (c.is === "activity") {
    return {
      type: "activity",
      id: c.id,
      subject: "Activité",
      title: c.title,
      ...base
    } satisfies TimetableClass;
  }
  else if (c.is === "detention") {
    return {
      type: "detention",
      id: c.id,
      subject: "",
      title: c.title ?? "Sans titre",
      room: c.classrooms.join(", ") || void 0,
      ...base
    } satisfies TimetableClass;
  }

  throw new Error("pronote: unknown class type");
};

export const getTimetableForWeek = async (account: PronoteAccount, weekNumber: number): Promise<Timetable> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  if (weekNumber < 1 || weekNumber > 62) {
    info("PRONOTE->getTimetableForWeek(): Le numéro de semaine est en dehors des bornes (1<>62), une liste vide est retournée.", "pronote");
    return [];
  }

  const timetable = await pronote.timetableFromWeek(account.instance, weekNumber);
  pronote.parseTimetable(account.instance, timetable, {
    withSuperposedCanceledClasses: false,
    withCanceledClasses: true,
    withPlannedClasses: true
  });

  return timetable.classes.map(decodeTimetableClass);
};
