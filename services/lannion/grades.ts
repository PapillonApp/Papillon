import { Period, PeriodGrades, Subject, Grade } from "@/services/shared/grade";
import { error } from "@/utils/logger/logger";

import { LannionAPI, LannionClient } from "./module";
import { LannionReleve, LannionRessource, LannionNote } from "./module/types";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";

function safeParseFloat(value: string | null | undefined): number {
  const parsed = parseFloat(value || "0");
  return isNaN(parsed) ? 0 : parsed;
}

function getGradeValue(note: LannionNote | undefined, key: 'value' | 'moy' | 'min' | 'max'): { value: number } | undefined {
  const valueString = note?.[key];
  if (valueString) {
    const value = safeParseFloat(valueString);
    if (value !== 0 || valueString === "0") {
      return {
        value,
        status: "",
        disabled: false
       };
    }
  }
  return {
    value: 0,
    status: "N.not",
    disabled: true
  };
}

function processSubjectData(
  subjectKey: string,
  subjectData: unknown,
  accountId: string,
  isSAE: boolean = false
): Subject | null {
  const ressource = subjectData as LannionRessource;
  
  if (!ressource || !Array.isArray(ressource.evaluations) || ressource.evaluations.length === 0) {
    return null;
  }

  const fallbackKey = subjectKey.trim() !== "" ? subjectKey : "Autre";
  
  let subjectName = String(ressource.titre || fallbackKey);
  if (isSAE) {
    subjectName = `${fallbackKey} - ${subjectName}`;
  }

  const subjectId = ressource.id?.toString() || fallbackKey;
  
  const grades: Grade[] = ressource.evaluations.map((evaluation) => {
    const baseId = evaluation.id?.toString() || `${subjectKey}-${evaluation.description || "evaluation"}`;
    const coefficient = safeParseFloat(evaluation.coef);
    
    return {
      id: `${subjectId}-${baseId}`,
      subjectId: subjectId,
      subjectName: ressource.titre || fallbackKey,
      description: evaluation.description || "",
      givenAt: new Date(evaluation.date || Date.now()),
      outOf: { value: 20 },
      coefficient: coefficient,
      studentScore: getGradeValue(evaluation.note, 'value'),
      averageScore: getGradeValue(evaluation.note, 'moy'),
      minScore: getGradeValue(evaluation.note, 'min'),
      maxScore: getGradeValue(evaluation.note, 'max'),
      createdByAccount: accountId
    };
  });

  const studentAverage = PapillonWeightedAvg(grades, "studentScore");
  const classAverage = PapillonWeightedAvg(grades, "averageScore");
  const minimum = PapillonWeightedAvg(grades, "minScore");
  const maximum = PapillonWeightedAvg(grades, "maxScore");

  return {
    id: subjectId,
    name: subjectName,
    studentAverage: { value: studentAverage, disabled: false },
    classAverage: { value: classAverage, disabled: false },
    minimum: { value: minimum, disabled: false },
    maximum: { value: maximum, disabled: false },
    outOf: { value: 20 },
    grades: grades,
  };
}

export async function fetchLannionGrades(session: LannionClient, accountId: string, period: Period): Promise<PeriodGrades> {
  const defaultGrades: PeriodGrades = {
    studentOverall: { value: 0 },
    classAverage: { value: 0 },
    subjects: [],
    createdByAccount: accountId
  };

  try {
    if (!session || !period.id) {
      error("Session or Period ID is not valid", "fetchLannionGrades");
      throw new Error("Invalid session or missing period ID.");
    }

    const api = new LannionAPI(session);
    const releveResult = await api.getReleveEtudiant(period.id);
    
    if (!releveResult.success || !releveResult.data) {
      error(`API returned unsuccessful result or no data for period ${period.id}`, "fetchLannionGrades");
      return defaultGrades;
    }

    const releve = releveResult.data as LannionReleve;
    const releveData = releve.relevé;
    
    if (!releveData) {
      error("Relevé data is missing from the API response structure.", "fetchLannionGrades");
      return defaultGrades;
    }
    
    const studentOverall = safeParseFloat(releveData.semestre?.notes?.value);
    const classAverage = safeParseFloat(releveData.semestre?.notes?.moy);

    const subjects: Subject[] = [];

    if (releveData.ressources && typeof releveData.ressources === 'object') {
      for (const [ressourceKey, ressourceData] of Object.entries(releveData.ressources)) {
        const subject = processSubjectData(ressourceKey, ressourceData, accountId, false);
        if (subject) {
          subjects.push(subject);
        }
      }
    }

    if (releveData.saes && typeof releveData.saes === 'object') {
      for (const [saeKey, saeData] of Object.entries(releveData.saes)) {
        const subject = processSubjectData(saeKey, saeData, accountId, true);
        if (subject) {
          subjects.push(subject);
        }
      }
    }

    return {
      studentOverall: { value: studentOverall },
      classAverage: { value: classAverage },
      subjects,
      createdByAccount: accountId
    };
    
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    error(`[Lannion] Critical Error in fetchLannionGrades: ${errorMessage}`, 'fetchLannionGrades');
    
    return defaultGrades;
  }
}