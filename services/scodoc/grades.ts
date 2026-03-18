import { Grade, Period, PeriodGrades, Score, Subject } from '@/services/shared/grade';
import PapillonWeightedAvg from '@/utils/grades/algorithms/weighted';
import { error } from '@/utils/logger/logger';

import { ScodocAPI, ScodocClient } from './module';
import { ScodocEvaluation, ScodocReleve, ScodocRessource, ScodocUE } from './module/types';

function safeParseFloat(value: string | number | null | undefined): number {
  if (value === null || value === undefined) { return 0; }
  if (typeof value === 'number') { return isNaN(value) ? 0 : value; }
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

function createScore(value: number, disabled = false, outOf?: number): Score {
  return {
    value,
    disabled,
    ...(outOf !== undefined && { outOf }),
  };
}

function getGradeScore(evaluation: ScodocEvaluation | undefined, key: 'value' | 'moy' | 'min' | 'max'): Score {
  const rawValue = evaluation?.note?.[key];
  const value = safeParseFloat(rawValue);
  const isValid = value !== 0 || rawValue === '0' || rawValue === 0;

  if (isValid && rawValue !== undefined && rawValue !== null) {
    return { value, status: '', disabled: false };
  }
  return { value: 0, status: 'N.not', disabled: true };
}

function getAverageScore(item: ScodocRessource | ScodocUE | undefined, key: 'value' | 'moy' | 'min' | 'max'): Score {
  const rawValue = item?.moyenne?.[key];
  return createScore(safeParseFloat(rawValue));
}

function buildGrade(
  evaluation: ScodocEvaluation,
  subjectId: string,
  subjectName: string,
  accountId: string
): Grade {
  const baseId = evaluation.id?.toString() || `${subjectId}-${evaluation.description || 'eval'}`;
  return {
    id: `${subjectId}-${baseId}`,
    subjectId,
    subjectName,
    description: evaluation.description || '',
    givenAt: new Date(evaluation.date || Date.now()),
    outOf: createScore(20),
    coefficient: safeParseFloat(evaluation.coef),
    studentScore: getGradeScore(evaluation, 'value'),
    averageScore: getGradeScore(evaluation, 'moy'),
    minScore: getGradeScore(evaluation, 'min'),
    maxScore: getGradeScore(evaluation, 'max'),
    createdByAccount: accountId,
  };
}

function buildSubjectFromRessource(
  key: string,
  ressource: ScodocRessource,
  accountId: string,
  prefix?: string
): Subject | null {
  if (!Array.isArray(ressource.evaluations) || ressource.evaluations.length === 0) {
    return null;
  }

  const subjectId = ressource.id?.toString() || key;
  const rawName = String(ressource.titre || key);
  const subjectName = prefix ? `${key} - ${rawName}` : rawName;

  const grades: Grade[] = ressource.evaluations.map((ev) =>
    buildGrade(ev, subjectId, subjectName, accountId)
  );

  return {
    id: subjectId,
    name: subjectName,
    studentAverage: createScore(PapillonWeightedAvg(grades, 'studentScore')),
    classAverage: createScore(PapillonWeightedAvg(grades, 'averageScore')),
    minimum: createScore(PapillonWeightedAvg(grades, 'minScore')),
    maximum: createScore(PapillonWeightedAvg(grades, 'maxScore')),
    outOf: createScore(20),
    grades,
  };
}

function buildUESubject(
  key: string,
  ue: ScodocUE,
  accountId: string
): Subject | null {
  if (!ue.titre) { return null; }

  const subjectId = ue.id?.toString() || key;
  const subjectName = `${key} - ${ue.titre}`;

  // UEs contain sub-resources/saes as grades
  const grades: Grade[] = [];
  const processItems = (items: Record<string, unknown> | undefined) => {
    if (!items) { return; }
    for (const [subKey, item] of Object.entries(items)) {
      const sub = item as ScodocRessource;
      if (typeof sub === 'object' && sub !== null && 'moyenne' in sub) {
        grades.push({
          id: `${subjectId}-${subKey}`,
          subjectId,
          subjectName,
          description: `${subKey}`,
          studentScore: createScore(safeParseFloat(sub.moyenne?.value)),
          coefficient: safeParseFloat(sub.coef),
          outOf: createScore(20),
          createdByAccount: accountId,
        });
      }
    }
  };

  processItems(ue.ressources);
  processItems(ue.saes);

  return {
    id: subjectId,
    name: subjectName,
    studentAverage: getAverageScore(ue, 'value'),
    classAverage: getAverageScore(ue, 'moy'),
    minimum: getAverageScore(ue, 'min'),
    maximum: getAverageScore(ue, 'max'),
    outOf: createScore(20),
    grades,
  };
}

export async function fetchScodocGrades(
  client: ScodocClient,
  etudid: number,
  deptAcronym: string,
  accountId: string,
  period: Period
): Promise<PeriodGrades> {
  const defaultGrades: PeriodGrades = {
    studentOverall: createScore(0),
    classAverage: createScore(0),
    rank: createScore(0),
    subjects: [],
    modules: [],
    createdByAccount: accountId,
  };

  try {
    const api = new ScodocAPI(client);
    const formsemestreId = parseInt(period.id, 10);

    if (isNaN(formsemestreId)) {
      error(`Invalid formsemestre_id: ${period.id}`, 'fetchScodocGrades');
      return defaultGrades;
    }

    const result = await api.getBulletin(deptAcronym, etudid, formsemestreId);

    if (!result.success || !result.data) {
      error(`getBulletin failed for period ${period.id}`, 'fetchScodocGrades');
      return defaultGrades;
    }

    const releve = result.data as ScodocReleve;
    const releveData = releve.relevé;

    if (!releveData) {
      return defaultGrades;
    }

    const studentOverall = safeParseFloat(releveData.semestre?.notes?.value);
    const classAverage = safeParseFloat(releveData.semestre?.notes?.moy);
    const rankValue = safeParseFloat(releveData.semestre?.rang?.value);
    const rankTotal = safeParseFloat(releveData.semestre?.rang?.total);

    const subjects: Subject[] = [];
    const modules: Subject[] = [];

    // Process ressources
    if (releveData.ressources) {
      for (const [key, ressource] of Object.entries(releveData.ressources)) {
        const subject = buildSubjectFromRessource(key, ressource as ScodocRessource, accountId);
        if (subject) { subjects.push(subject); }
      }
    }

    // Process SAEs
    if (releveData.saes) {
      for (const [key, sae] of Object.entries(releveData.saes)) {
        const subject = buildSubjectFromRessource(key, sae as ScodocRessource, accountId, key);
        if (subject) { subjects.push(subject); }
      }
    }

    // Process UEs as modules
    if (releveData.ues) {
      for (const [key, ue] of Object.entries(releveData.ues)) {
        const module = buildUESubject(key, ue as ScodocUE, accountId);
        if (module) { modules.push(module); }
      }
    }

    return {
      studentOverall: createScore(studentOverall),
      classAverage: createScore(classAverage),
      rank: createScore(rankValue, rankValue === 0, rankTotal || undefined),
      subjects,
      modules,
      createdByAccount: accountId,
      features: {
        'scodoc-ues': releveData.ues,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    error(`[ScoDoc] fetchScodocGrades error: ${msg}`, 'fetchScodocGrades');
    return defaultGrades;
  }
}
