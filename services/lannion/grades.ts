import { Period, PeriodGrades, Subject } from "@/services/shared/grade";
import { error } from "@/utils/logger/logger";

import { LannionAPI, LannionClient } from "./module";
import { LannionReleve, LannionUE } from "./module/types";

export async function fetchLannionGrades(session: LannionClient, accountId: string, period: Period): Promise<PeriodGrades> {
  try {
    if (!session) {
      error("Session is not valid", "fetchLannionGrades");
      throw new Error("Session is not valid");
    }

    const api = new LannionAPI(session);
    const releveResult = await api.getReleveEtudiant(period.id!);
    
    if (!releveResult.success || !releveResult.data) {
      return {
        studentOverall: { value: 0 },
        classAverage: { value: 0 },
        subjects: [],
        createdByAccount: accountId
      };
    }

    const releve = releveResult.data as unknown as LannionReleve;
    const releveData = releve.relevé;
    
    const studentOverall = parseFloat(releveData.semestre?.notes?.value || "0") || 0;
    const classAverage = parseFloat(releveData.semestre?.notes?.moy || "0") || 0;

    const subjects: Subject[] = [];
    
    if (releveData.ues) {
      for (const [ueKey, ueData] of Object.entries(releveData.ues)) {
        const ue = ueData as LannionUE;
        
        const subject: Subject = {
          id: ue.id?.toString() || ueKey,
          name: ue.titre || ueKey,
          studentAverage: { value: parseFloat(ue.moyenne?.value || "0") || 0 },
          classAverage: { value: parseFloat(ue.moyenne?.moy || "0") || 0 },
          minimum: { value: parseFloat(ue.moyenne?.min || "0") || 0 },
          maximum: { value: parseFloat(ue.moyenne?.max || "0") || 0 },
          outOf: { value: 20 },
          grades: []
        };

        processResources(ue, releveData, subject, accountId);
        processSAEs(ue, releveData, subject, accountId);

        subjects.push(subject);
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
    error(`[Lannion] Error in fetchLannionGrades: ${errorMessage}`, 'fetchLannionGrades');
    error("Failed to get grades for period", "fetchLannionGrades");
    return {
      studentOverall: { value: 0 },
      classAverage: { value: 0 },
      subjects: [],
      createdByAccount: accountId
    };
  }
}

function processResources(ue: LannionUE, releveData: LannionReleve['relevé'], subject: Subject, accountId: string) {
  if (!ue.ressources) {
    return;
  }

  for (const [resKey] of Object.entries(ue.ressources)) {
    const ressourceData = releveData.ressources?.[resKey];
    
    if (ressourceData?.evaluations) {
      for (const evaluation of ressourceData.evaluations) {
        const baseId = evaluation.id?.toString() || `${resKey}-${evaluation.description}`;
        subject.grades.push({
          id: `${subject.id}-${baseId}`,
          subjectId: subject.id,
          subjectName: ressourceData.titre || resKey,
          description: evaluation.description || "",
          givenAt: new Date(evaluation.date || Date.now()),
          outOf: { value: 20 },
          coefficient: parseFloat(evaluation.coef || "1"),
          studentScore: evaluation.note?.value ? { value: parseFloat(evaluation.note.value) } : undefined,
          averageScore: evaluation.note?.moy ? { value: parseFloat(evaluation.note.moy) } : undefined,
          minScore: evaluation.note?.min ? { value: parseFloat(evaluation.note.min) } : undefined,
          maxScore: evaluation.note?.max ? { value: parseFloat(evaluation.note.max) } : undefined,
          createdByAccount: accountId
        });
      }
    }
  }
}

function processSAEs(ue: LannionUE, releveData: LannionReleve['relevé'], subject: Subject, accountId: string) {
  if (!ue.saes) {
    return;
  }

  for (const [saeKey] of Object.entries(ue.saes)) {
    const saeFullData = releveData.saes?.[saeKey];
    
    if (saeFullData?.evaluations) {
      for (const evaluation of saeFullData.evaluations) {
        const baseId = evaluation.id?.toString() || `${saeKey}-${evaluation.description}`;
        subject.grades.push({
          id: `${subject.id}-${baseId}`,
          subjectId: subject.id,
          subjectName: saeFullData.titre || saeKey,
          description: evaluation.description || "",
          givenAt: new Date(evaluation.date || Date.now()),
          outOf: { value: 20 },
          coefficient: parseFloat(evaluation.coef || "1"),
          studentScore: evaluation.note?.value ? { value: parseFloat(evaluation.note.value) } : undefined,
          averageScore: evaluation.note?.moy ? { value: parseFloat(evaluation.note.moy) } : undefined,
          minScore: evaluation.note?.min ? { value: parseFloat(evaluation.note.min) } : undefined,
          maxScore: evaluation.note?.max ? { value: parseFloat(evaluation.note.max) } : undefined,
          createdByAccount: accountId
        });
      }
    }
  }
}
