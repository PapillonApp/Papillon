import { Grade, Period, PeriodGrades, Score,Subject } from "@/services/shared/grade";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import { error } from "@/utils/logger/logger";

import { LannionAPI, LannionClient } from "./module";
import { LannionNote,LannionReleve, LannionRessource } from "./module/types";

function safeParseFloat(value: string | null | undefined): number {
  if (typeof value !== 'string') {
    if (typeof value === 'number') {
      return parseFloat(String(value));
    }
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function createScore(value: number, disabled: boolean = false, outOf?: number): Score {
  return {
    value,
    disabled,
    ...(outOf !== undefined && { outOf }),
  };
}

function getGradeScore(note: LannionNote | undefined, key: 'value' | 'moy' | 'min' | 'max'): Score {
  const valueString = note?.[key];
  const value = safeParseFloat(valueString);
  const isValidValue = (value !== 0 || valueString === "0");

  if (isValidValue) {
    return { value, status: "", disabled: false };
  }

  return { value: 0, status: "N.not", disabled: true };
}

function getSubjectAverageScore(ressource: LannionRessource, key: 'value' | 'moy' | 'min' | 'max'): Score {
  const valueString = ressource.moyenne?.[key];
  const value = safeParseFloat(valueString);
  return createScore(value);
}

function getSubjectRankScore(ressource: LannionRessource): Score | undefined {
  const rank = safeParseFloat(ressource.moyenne?.rang);
  const total = safeParseFloat(ressource.moyenne?.total);

  if (rank === 0 && total === 0) {
    return undefined;
  }

  return createScore(rank, false, total);
}

function createEvaluationGrade(
  ressource: LannionRessource,
  evaluation: NonNullable<LannionRessource['evaluations']>[number],
  subjectId: string,
  subjectName: string,
  accountId: string,
): Grade {
  const baseId = evaluation.id?.toString() || `${subjectId}-${evaluation.description || "evaluation"}`;
  const coefficient = safeParseFloat(evaluation.coef);

  return {
    id: `${subjectId}-${baseId}`,
    subjectId,
    subjectName,
    description: evaluation.description || "",
    givenAt: new Date(evaluation.date || Date.now()),
    outOf: createScore(20),
    coefficient,
    studentScore: getGradeScore(evaluation.note, 'value'),
    averageScore: getGradeScore(evaluation.note, 'moy'),
    minScore: getGradeScore(evaluation.note, 'min'),
    maxScore: getGradeScore(evaluation.note, 'max'),
    createdByAccount: accountId
  };
}

function processRessourceGrades(ressource: LannionRessource, subjectId: string, subjectName: string, accountId: string): Grade[] {
  if (!Array.isArray(ressource.evaluations) || ressource.evaluations.length === 0) {
    return [];
  }

  return ressource.evaluations.map((evaluation) =>
    createEvaluationGrade(ressource, evaluation, subjectId, subjectName, accountId)
  );
}

function processUEGrades(ressource: LannionRessource, subjectId: string, subjectName: string, accountId: string, releveData: LannionReleve['relevé']): Grade[] {
  const allSubjects = [];
  const releve = releveData || {};

  const keys = ['ressources', 'saes'] as const;

  for (const key of keys) {
    const items = ressource[key];
    const releveItems = releve[key] || {};
    if (typeof items === 'object' && items !== null) {
      for (const [subKey, item] of Object.entries(items)) {
        if (typeof item === 'object' && item !== null && 'moyenne' in item && 'coef' in item) {
          const releveTitle = typeof releveItems === 'object' && releveItems !== null && releveItems[subKey] ? releveItems[subKey].titre : 'Inconnu';
          allSubjects.push({
            ...item,
            name: `${subKey} - ${releveTitle}`,
          });
        }
      }
    }
  }

  return allSubjects.map((subject) => ({
    id: subject.id || `${subjectId}-${subject.name}`,
    description: subject.name,
    studentScore: createScore(safeParseFloat(subject.moyenne)),
    coefficient: safeParseFloat(subject.coef),
    outOf: createScore(20),
    subjectId: subjectId,
    subjectName: subjectName,
    createdByAccount: accountId
  }));
}

function processSubjectData(
  subjectKey: string,
  subjectData: unknown,
  accountId: string,
  type: 'ressource' | 'sae' | 'ue',
  releveData?: LannionReleve['relevé'],
): Subject | null {
  const ressource = subjectData as LannionRessource;

  if (typeof subjectData !== 'object' || subjectData === null || !('titre' in ressource) || !('id' in ressource)) {
    return null;
  }

  const isUE = type === 'ue';

  if (!isUE && (!Array.isArray(ressource.evaluations) || ressource.evaluations.length === 0)) {
    return null;
  }

  const fallbackKey = subjectKey.trim() !== "" ? subjectKey : "Autre";
  let subjectName = String(ressource.titre || fallbackKey);
  if (type === 'sae') {
    subjectName = `${fallbackKey} - ${subjectName}`;
  } else if (type === 'ue') {
    subjectName = `${fallbackKey} - ${subjectName}`;
  }

  const subjectId = ressource.id?.toString() || fallbackKey;
  let grades: Grade[] = [];

  if (isUE) {
    grades = processUEGrades(ressource, subjectId, subjectName, accountId, releveData);
  } else {
    grades = processRessourceGrades(ressource, subjectId, subjectName, accountId);
  }

  const avgSourceKey = isUE ? 'value' : 'studentScore';
  const moySourceKey = isUE ? 'moy' : 'averageScore';
  const minSourceKey = isUE ? 'min' : 'minScore';
  const maxSourceKey = isUE ? 'max' : 'maxScore';

  const studentAverage = isUE ? getSubjectAverageScore(ressource, avgSourceKey) : createScore(PapillonWeightedAvg(grades, avgSourceKey));
  const classAverage = isUE ? getSubjectAverageScore(ressource, moySourceKey) : createScore(PapillonWeightedAvg(grades, moySourceKey));
  const minimum = isUE ? getSubjectAverageScore(ressource, minSourceKey) : createScore(PapillonWeightedAvg(grades, minSourceKey));
  const maximum = isUE ? getSubjectAverageScore(ressource, maxSourceKey) : createScore(PapillonWeightedAvg(grades, maxSourceKey));

  return {
    id: subjectId,
    name: subjectName,
    studentAverage,
    classAverage,
    minimum,
    maximum,
    outOf: createScore(20),
    rank: isUE ? getSubjectRankScore(ressource) : undefined,
    grades,
  };
}

export async function fetchLannionGrades(session: LannionClient, accountId: string, period: Period): Promise<PeriodGrades> {
  const defaultGrades: PeriodGrades = {
    studentOverall: createScore(0),
    classAverage: createScore(0),
    rank: createScore(0),
    subjects: [],
    modules: [],
    createdByAccount: accountId
  };

  try {
    if (!session || !period.id) {
      error("Session or Period ID is not valid", "fetchLannionGrades");
      // Use the default grades instead of throwing if we want to prevent returning invalid data
      return defaultGrades; 
    }

    const api = new LannionAPI(session);
    const releveResult = await api.getReleveEtudiant(period.id);

    if (!releveResult.success || !releveResult.data) {
      error(`API returned unsuccessful result or no data for period ${period.id}`, "fetchLannionGrades");
      return defaultGrades;
    }

    const releve = releveResult.data as LannionReleve;
    const releveData = releve.relevé;

    if (typeof releveData !== 'object' || releveData === null) {
      error("Relevé data is missing or invalid from the API response structure.", "fetchLannionGrades");
      return defaultGrades;
    }

    const studentOverallValue = safeParseFloat(releveData.semestre?.notes?.value);
    const classAverageValue = safeParseFloat(releveData.semestre?.notes?.moy);

    const rankStudentValue = safeParseFloat(releveData.semestre?.rang?.value);
    const rankClassValue = safeParseFloat(releveData.semestre?.rang?.total);
    const rankEnabled = rankStudentValue !== 0;

    const subjects: Subject[] = [];
    const modules: Subject[] = [];

    const processCategory = (data: typeof releveData.ressources, type: 'ressource' | 'sae' | 'ue') => {
      if (typeof data === 'object' && data !== null) {
        for (const [key, itemData] of Object.entries(data)) {
          const subject = processSubjectData(key, itemData, accountId, type, releveData);
          if (subject) {
            (type === 'ue' ? modules : subjects).push(subject);
          }
        }
      }
    };

    processCategory(releveData.ressources, 'ressource');
    processCategory(releveData.saes, 'sae');
    processCategory(releveData.ues, 'ue');

    return {
      studentOverall: createScore(studentOverallValue),
      classAverage: createScore(classAverageValue),
      rank: createScore(rankStudentValue, !rankEnabled, rankClassValue),
      subjects,
      modules,
      createdByAccount: accountId,
      features: {
        "scodoc-ues": releveData.ues
      }
    };

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    error(`[Lannion] Critical Error in fetchLannionGrades: ${errorMessage}`, 'fetchLannionGrades');
    return defaultGrades;
  }
}