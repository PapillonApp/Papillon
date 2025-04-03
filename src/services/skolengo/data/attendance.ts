import type { SkolengoAccount } from "@/stores/account/types";
import { info } from "@/utils/logger/logger";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import type { Attendance } from "@/services/shared/Attendance";
import { SupportedAbsenceType } from "scolengo-api/types/models/SchoolLife/AbsenceReason";

const dateIntervalToDeltaInMin = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime())/(1000 * 60));

const dateIntervalToTime = (from: Date, to: Date) => {
  const deltaInMin = dateIntervalToDeltaInMin(from, to);
  if (deltaInMin < 60) {
    return `${deltaInMin}min`;
  } else if (deltaInMin < 1440) {
    return `${Math.floor(deltaInMin/60)}h${deltaInMin%60}`;
  } else {
    return `${Math.floor(deltaInMin/1440)}j${Math.floor((deltaInMin%1440)/60)}h${deltaInMin%60}`;
  }
};

const _strs = (strs: (string|null|undefined)[], defaultStr: string) => strs.filter((e) => e && e.trim().length > 0).length > 0 ? strs.filter((e) => e && e.trim().length > 0).join(" - ") : defaultStr;

export const getAttendance = async (account: SkolengoAccount): Promise<Attendance> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const absences = await account.instance.getAbsenceFiles();

  const attendance : Attendance= {
    delays: [],
    absences: [],
    // Not implemented in Skolengo
    punishments: [],
    // Not implemented in Skolengo
    observations: []
  };

  absences.map((e) => e.currentState).forEach((absence) => {
    switch (absence.absenceType as SupportedAbsenceType) {

      case ("ABSENCE"):
        attendance.absences.push({
          id: absence.id,
          fromTimestamp: new Date(absence.absenceStartDateTime).getTime(),
          toTimestamp: new Date(absence.absenceEndDateTime).getTime(),
          justified: absence.absenceFileStatus === "LOCKED",
          hours: dateIntervalToTime(new Date(absence.absenceStartDateTime), new Date(absence.absenceEndDateTime)),
          administrativelyFixed: absence.absenceFileStatus === "LOCKED",
          reasons: _strs([absence.absenceReason?.longLabel, absence.comment],"Non renseigné"),
        });
        break;

      case ("LATENESS"):
        attendance.delays.push({
          id: absence.id,
          timestamp: new Date(absence.absenceStartDateTime).getTime(),
          duration: dateIntervalToDeltaInMin(new Date(absence.absenceStartDateTime), new Date(absence.absenceEndDateTime)),
          justified: absence.absenceFileStatus === "LOCKED",
          reasons: _strs([absence.absenceReason?.longLabel, absence.comment],"Non renseigné"),
          justification: _strs([absence.absenceReason?.longLabel, absence.comment],"Non renseigné"),
        });
        break;
    }
  });

  info("SKOLENGO->getAttendance(): OK", "skolengo");

  return attendance;
};
