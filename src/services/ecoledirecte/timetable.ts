import type {EcoleDirecteAccount} from "@/stores/account/types";
import {Timetable, TimetableClass, TimetableClassStatus} from "../shared/Timetable";
import {ErrorServiceUnauthenticated} from "../shared/errors";
import ecoledirecte, { TimetableItemKind } from "pawdirecte";

const decodeTimetableClass = (c: ecoledirecte.TimetableItem): TimetableClass => {
  const base = {
    startTimestamp: c.startDate.getTime(),
    endTimestamp: c.endDate.getTime(),
    additionalNotes: c.notes,
    backgroundColor: c.color
  };
  switch (c.kind) {
    case TimetableItemKind.COURS:
      return {
        type: "lesson",
        id: c.id,
        subject: c.subjectName,
        title: c.subjectName,
        room: c.room || void 0,
        teacher: c.teacher || void 0,
        // TODO: add more states
        status: c.updated ? TimetableClassStatus.MODIFIED : c.cancelled ? TimetableClassStatus.CANCELED : void 0,
        statusText: c.updated ? TimetableClassStatus.MODIFIED : c.cancelled ? TimetableClassStatus.CANCELED : void 0,
        ...base
      } satisfies TimetableClass;
    case TimetableItemKind.PERMANENCE:
      return {
        type: "detention",
        subject: c.subjectName,
        id: c.id,
        title: c.subjectName ?? "Sans titre",
        teacher: c.teacher || void 0,
        room: c.room || void 0,
        ...base
      };
    case TimetableItemKind.EVENEMENT:
      return {
        type: "activity",
        subject: c.subjectName,
        id: c.id,
        title: c.subjectName ?? "Sans titre",
        teacher: c.teacher || void 0,
        room: c.room || void 0,
        ...base
      };
    case TimetableItemKind.CONGE:
      return {
        type: "vacation",
        subject: c.subjectName,
        id: c.id,
        title: "Congés",
        teacher: c.teacher || void 0,
        room: void 0,
        ...base
      };
    case TimetableItemKind.SANCTION:
      return {
        type: "detention",
        subject: "",
        id: c.id,
        title: "Sanction",
        teacher: c.teacher || void 0,
        room: "PERMANENCE",
        ...base
      };
    default:
      break;
  }

  throw new Error("ecoledirecte: unknown class type");
};

export const getTimetableForWeek = async (account: EcoleDirecteAccount, rangeDate: { start: Date, end: Date}): Promise<Timetable> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const timetable = await ecoledirecte.studentTimetable(account.authentication.session, account.authentication.account, rangeDate.start, rangeDate.end);
  return timetable.map(decodeTimetableClass).sort((a, b) => a.startTimestamp - b.startTimestamp);
};
