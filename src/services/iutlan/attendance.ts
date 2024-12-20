import { LocalAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { Attendance } from "../shared/Attendance";

export const saveIUTLanAttendance = async (account: LocalAccount): Promise<Attendance> => {
  try {
    // Il faudrait peut-être penser à typer cette partie, tous les types sont any :(
    const scodocData = account.identityProvider.rawData;

    const allAbsences = [];

    // for all scodocData.absences
    if(scodocData.absences && Object.keys(scodocData.absences).length > 0) {
      for (const day of Object.keys(scodocData.absences)) {
        for (const absence of scodocData.absences[day]) {
          let from = new Date(day);
          from.setHours(absence.debut);

          let to = new Date(absence.dateFin);
          to.setHours(absence.fin);
          if (!(absence.statut === "present")){
            allAbsences.push({
              id: absence.idAbs,
              fromTimestamp: from ? new Date(from).getTime() : undefined,
              toTimestamp: to ? new Date(to).getTime() : undefined,
              justified: Boolean(absence.justifie), // Caster dans un bool au cas ou mais non essentiel
              hours: (parseInt(absence.fin) - parseInt(absence.debut)) + "h 00",
              administrativelyFixed: Boolean(absence.justifie),
              reasons: undefined,
            });
          }
        }
      }
    }

    // sort allAbsences by fromTimestamp
    allAbsences.sort((a, b) => a.fromTimestamp - b.fromTimestamp);

    return {
      delays: [],
      absences: allAbsences,
      punishments: [],
      observations: [],
    };
  } catch (error) {
    console.error(error);
  }

};