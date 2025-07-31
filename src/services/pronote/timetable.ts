import type { PronoteAccount } from "@/stores/account/types";
import { TimetableClassStatus, TimetableRessource, WeekFrequency, type Timetable, type TimetableClass } from "../shared/Timetable";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import pronote from "pawnote";
import { info } from "@/utils/logger/logger";

export const pronoteFirstDate = new Date("2024-09-01");

const decodeTimetableClass = (c: pronote.TimetableClassLesson | pronote.TimetableClassDetention | pronote.TimetableClassActivity): TimetableClass => {
  const base = {
    startTimestamp: c.startDate.getTime(),
    endTimestamp: c.endDate.getTime(),
    additionalNotes: c.notes,
    backgroundColor: c.backgroundColor,
  };

  if (c.is === "lesson") {
    return {
      type: "lesson",
      id: c.id,
      title: c.subject!.name,
      subject: c.subject!.name,
      room: c.classrooms.join(", ") || void 0,
      teacher: c.teacherNames?.join(", ") ?? void 0,
      group: c.groupNames.join(", ") || void 0,
      status: c.status === "Cours annulé" || c.status === "Prof. absent" || c.status === "Classe absente" || c.status === "Prof./pers. absent" || c.status === "Sortie pédagogique" ? TimetableClassStatus.CANCELED : c.test ? TimetableClassStatus.TEST : void 0,
      statusText: c.test ? "Devoir Surveillé" : c.status,
      ressourceID: c.lessonResourceID ?? void 0,
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

  let timetable_formatted = timetable.classes.map(decodeTimetableClass);

  return timetable_formatted;
};

const category_match = {
  0: undefined,
  1: "Cours",
  2: "Correction",
  3: "Devoir sur table",
  4: "Interrogation orale",
  5: "Travaux Dirigés",
  6: "Travaux Pratiques",
  7: "Évaluation",
  8: "Enseignements Pratiques Interdisciplinaires",
  9: "Accompagnement personnalisé",
  12: "Visioconférence",
};

export const getWeekFrequency = (account: PronoteAccount, weekNumber: number): WeekFrequency | null => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  if (weekNumber < 1 || weekNumber > 62) {
    info("PRONOTE->getTimetableForWeek(): Le numéro de semaine est en dehors des bornes (1<>62), null est retourné.", "pronote");
    return null;
  }

  const frequency = pronote.frequency(account.instance, weekNumber);

  if (!frequency)
    return null;

  return {
    textLabel: "Semaine",
    freqLabel: frequency.label,
    num: frequency.fortnight
  };
};

export const getCourseRessources = async (account: PronoteAccount, course: TimetableClass): Promise<TimetableRessource[]> => {
  let ressources: TimetableRessource[] = [];

  if (course.type === "lesson" && course.ressourceID) {
    let ressource = (await pronote.resource(account.instance!, course.ressourceID)).contents;
    ressources = ressource.map((r) => {
      let category = category_match[r.category];
      return {
        title: r.title,
        description: r.description,
        category,
        files: r.files.map((f) => {
          return {
            name: f.name,
            url: f.url
          };
        })
      };
    });
  }

  return ressources;
};