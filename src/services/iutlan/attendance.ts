import { LocalAccount } from "@/stores/account/types";
import { Attendance } from "../shared/Attendance";
import { Absence } from "../shared/Absence";

export interface scodocAbsence {
  idAbs: string;
  debut: string;
  dateFin: Date;
  fin: string;
  justifie?: boolean;
}

interface scodocData {
  [key: string]: Array<scodocAbsence>;
}

export const saveIUTLanAttendance = async (
  account: LocalAccount,
  periodName: string
): Promise<Attendance> => {
  try {
    const data = account.serviceData.semestres as any;
    const scodocData = data[periodName].absences as scodocData;
    const allAbsences: Array<Absence> = [];

    if (scodocData && Object.keys(scodocData).length > 0) {
      for (const day of Object.keys(scodocData)) {
        const absences = scodocData[day];

        for (const absence of absences) {
          let from = new Date(day);
          from.setHours(parseInt(absence.debut));

          let to = new Date(absence.dateFin);
          to.setHours(parseInt(absence.fin));

          allAbsences.push({
            id: absence.idAbs,
            fromTimestamp: from ? new Date(from).getTime() : 0,
            toTimestamp: to ? new Date(to).getTime() : 0,
            justified: absence.justifie ?? false,
            hours: parseInt(absence.fin) - parseInt(absence.debut) + "h 00",
            administrativelyFixed: absence.justifie ?? false,
            reasons: undefined,
          });
        }
      }
    }

    allAbsences.sort((a, b) => (a.fromTimestamp || 0) - (b.fromTimestamp || 0));

    return {
      delays: [],
      absences: allAbsences,
      punishments: [],
      observations: [],
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save attendance data");
  }
};
