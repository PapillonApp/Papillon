import { Absence, Attendance } from '@/services/shared/attendance';
import { error } from '@/utils/logger/logger';

import { ScodocAPI, ScodocClient } from './module';
import { ScodocAbsence } from './module/types';

export async function fetchScodocAttendance(
  client: ScodocClient,
  etudid: number,
  deptAcronym: string,
  accountId: string,
  periodId: string
): Promise<Attendance> {
  const empty: Attendance = {
    delays: [],
    absences: [],
    punishments: [],
    observations: [],
    createdByAccount: accountId,
  };

  try {
    const api = new ScodocAPI(client);
    const formsemestreId = parseInt(periodId, 10);

    if (isNaN(formsemestreId)) {
      return empty;
    }

    const result = await api.getAbsences(deptAcronym, etudid, formsemestreId);

    if (!result.success || !result.data) {
      return empty;
    }

    const absencesData = result.data as Record<string, ScodocAbsence[]>;
    const absences = processAbsences(absencesData, accountId);

    return {
      ...empty,
      absences,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`[ScoDoc] fetchScodocAttendance error: ${msg}`, 'fetchScodocAttendance');
    return empty;
  }
}

function processAbsences(
  data: Record<string, ScodocAbsence[]>,
  accountId: string
): Absence[] {
  const absences: Absence[] = [];

  for (const [dateKey, dayAbsences] of Object.entries(data)) {
    if (!Array.isArray(dayAbsences)) { continue; }

    for (const absence of dayAbsences) {
      const from = new Date(dateKey);
      const to = new Date(absence.dateFin || dateKey);

      if (absence.debut) {
        from.setHours(Math.floor(absence.debut), Math.round((absence.debut % 1) * 60));
      }
      if (absence.fin) {
        to.setHours(Math.floor(absence.fin), Math.round((absence.fin % 1) * 60));
      }

      absences.push({
        id: absence.idAbs?.toString() || `${dateKey}-${absence.debut}`,
        from,
        to,
        reason: absence.matiereComplet || undefined,
        timeMissed: ((absence.fin || 0) - (absence.debut || 0)) || 0,
        justified: absence.justifie || false,
        createdByAccount: accountId,
      });
    }
  }

  return absences;
}
