import { Absence, Attendance } from "@/services/shared/attendance";
import { error } from "@/utils/logger/logger";

import { LannionAPI, LannionClient } from "./module";
import { LannionReleve } from "./module/types";

export async function fetchLannionAttendance(session: LannionClient, accountId: string, period: string): Promise<Attendance> {
  try {
    if (!session) {
      error("Session is not valid", "fetchLannionAttendance");
      throw new Error("Session is not valid");
    }

    const api = new LannionAPI(session);
    const releveResult = await api.getReleveEtudiant(period);
    
    if (!releveResult.success || !releveResult.data) {
      return {
        delays: [],
        absences: [],
        punishments: [],
        observations: [],
        createdByAccount: accountId
      };
    }

    const releve = releveResult.data as unknown as LannionReleve;
    const absences = processAbsences(releve, accountId);

    return {
      delays: [],
      absences,
      punishments: [],
      observations: [],
      createdByAccount: accountId
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    error(`[Lannion] Error in fetchLannionAttendance: ${errorMessage}`, 'fetchLannionAttendance');
    error("Failed to get attendance for period", "fetchLannionAttendance");
    return {
      delays: [],
      absences: [],
      punishments: [],
      observations: [],
      createdByAccount: accountId
    };
  }
}

function processAbsences(releve: LannionReleve, accountId: string): Absence[] {
  const absences: Absence[] = [];
  if (!releve.absences) {
    return absences;
  }

  for (const [dateKey, dayAbsences] of Object.entries(releve.absences)) {
    if (Array.isArray(dayAbsences)) {
      for (const absence of dayAbsences) {
        const from = new Date(dateKey);
        const to = new Date(absence.dateFin || dateKey);
        
        if (absence.debut) {
          from.setHours(Math.floor(absence.debut), (absence.debut % 1) * 60);
        }
        if (absence.fin) {
          to.setHours(Math.floor(absence.fin), (absence.fin % 1) * 60);
        }

        absences.push({
          id: absence.idAbs?.toString() || `${dateKey}-${absence.debut}`,
          from,
          to,
          reason: absence.matiereComplet || undefined,
          timeMissed: ((absence.fin || 0) - (absence.debut || 0)) || 0,
          justified: absence.justifie || false,
          createdByAccount: accountId
        });
      }
    }
  }
  return absences;
}
