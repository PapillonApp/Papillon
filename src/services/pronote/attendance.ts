import type { PronoteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import type { Period } from "../shared/Period";
import { Attendance } from "../shared/Attendance";
import pronote from "pawnote";
import { decodeAttachment } from "./attachment";
import { ObservationType } from "../shared/Observation";
import { decodePeriod } from "./period";
import { info } from "@/utils/logger/logger";

const getTab = (account: PronoteAccount): pronote.Tab => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const tab = account.instance.user.resources[0].tabs.get(pronote.TabLocation.Notebook);
  if (!tab)
    throw new Error("Tu n'as pas accès à l'onglet 'Vie Scolaire' dans PRONOTE");

  return tab;
};

export const getAttendancePeriods = (account: PronoteAccount): { periods: Period[], default: string } => {
  const tab = getTab(account);
  info("PRONOTE->getAttendancePeriods(): OK", "pronote");

  return {
    default: tab.defaultPeriod!.name,
    periods: tab.periods.map(decodePeriod)
  };
};

export async function getAttendance (account: PronoteAccount, periodName: string): Promise<Attendance> {
  const tab = getTab(account); // Vérifie aussi la validité de `account.instance`.
  const period = tab.periods.find((p) => p.name === periodName);
  if (!period)
    throw new Error("La période sélectionnée n'a pas été trouvée.");

  const items = await pronote.notebook(account.instance!, period);
  info(`PRONOTE->getAttendance(): OK pour ${periodName}`, "pronote");

  const attendance: Attendance = {
    observations: items.observations.map((observation) => {
      let sectionType: ObservationType;

      switch (observation.kind) {
        case pronote.NotebookObservationKind.LogBookIssue:
          sectionType = ObservationType.LogBookIssue;
          break;
        case pronote.NotebookObservationKind.Encouragement:
          sectionType = ObservationType.Encouragement;
          break;
        case pronote.NotebookObservationKind.Observation:
          sectionType = ObservationType.Observation;
          break;
        case pronote.NotebookObservationKind.Other:
          sectionType = ObservationType.Other;
          break;
      }

      return {
        id: observation.id,
        timestamp: observation.date.getTime(),
        sectionName: observation.name,
        sectionType,
        subjectName: observation.subject?.name,
        shouldParentsJustify: observation.shouldParentsJustify,
        reasons: observation.reason
      };
    }),

    punishments: items.punishments.map((punishment) => ({
      id: punishment.id,

      schedulable: false, // TODO
      schedule: [], // TODO

      timestamp: punishment.dateGiven.getTime(),
      givenBy: punishment.giver,
      exclusion: punishment.exclusion,
      duringLesson: punishment.isDuringLesson,
      homework: {
        text: punishment.workToDo,
        documents: punishment.workToDoDocuments.map(decodeAttachment)
      },
      reason: {
        text: punishment.reasons,
        circumstances: punishment.circumstances,
        documents: punishment.circumstancesDocuments.map(decodeAttachment)
      },
      nature: punishment.title,
      duration: punishment.durationMinutes
    })),

    absences: items.absences.map((absence) => ({
      id: absence.id,
      fromTimestamp: absence.startDate.getTime(),
      toTimestamp: absence.endDate.getTime(),
      justified: absence.justified,
      hours: absence.hoursMissed + "h" + absence.minutesMissed,
      administrativelyFixed: absence.administrativelyFixed,
      reasons: absence.reason
    })),

    delays: items.delays.map((delay) => ({
      id: delay.id,
      timestamp: delay.date.getTime(),
      duration: delay.minutes,
      justified: delay.justified,
      justification: delay.justification,
      reasons: delay.reason ?? void 0,
    }))
  };

  return attendance;
}
