import { error } from "@/utils/logger/logger";

import {
  Grade,
  GradeScore,
  Period,
  PeriodGrades,
  Subject,
} from "../shared/grade";
import type {
  Evaluation,
  ReleveEtudiantResponse,
  Ressource as RessourceEval,
  SAE as SAEEval,
} from "./types";

export function mapLannionReleveToPeriodGrades(
  releve: ReleveEtudiantResponse,
  period: Period,
  accountId: string,
  kidName?: string
): PeriodGrades {
  if (!releve || !releve.relevé) {
    error("Relevé Lannion invalide", "Lannion.mapLannionReleveToPeriodGrades");
    return {
      period,
      subjects: [],
      studentOverall: { value: 0, disabled: true },
      classAverage: { value: 0, disabled: true },
      accountId,
      kidName,
    } as PeriodGrades;
  }

  const ressources = Object.values(
    releve.relevé.ressources ?? {}
  ) as RessourceEval[];

  const saes = Object.values(releve.relevé.saes ?? {}) as SAEEval[];

  const subjects: Subject[] = [
    ...mapRessourcesToSubjects(ressources, accountId, kidName),
    ...mapSaesToSubjects(saes, accountId, kidName),
  ];

  const studentOverall = computeOverall(subjects, s => s.studentAverage);
  const classAverage = computeOverall(subjects, s => s.classAverage);

  return {
    period,
    subjects,
    studentOverall,
    classAverage,
    accountId,
    kidName,
  } as PeriodGrades;
}

function mapRessourcesToSubjects(
  ressources: RessourceEval[],
  accountId: string,
  kidName?: string
): Subject[] {
  return ressources.map(r => {
    const moyenneInfo = extractMoyenneInfo(r.moyenne);

    return {
      id: String(r.id ?? r.code_apogee),
      name: r.titre ?? r.code_apogee ?? "Ressource",
      classAverage: moyenneInfo.classAverage ?? { value: 0, disabled: true },
      studentAverage: moyenneInfo.studentAverage ?? {
        value: 0,
        disabled: true,
      },
      outOf: moyenneInfo.outOf ?? { value: 20, disabled: true },
      grades: mapEvaluations(r.evaluations ?? [], accountId, kidName, r.titre),
    } as Subject;
  });
}

function mapSaesToSubjects(
  saes: SAEEval[],
  accountId: string,
  kidName?: string
): Subject[] {
  return saes.map(s => {
    const moyenneInfo = extractMoyenneInfo(s.moyenne);

    return {
      id: String(s.id ?? s.code_apogee),
      name: s.titre ?? s.code_apogee ?? "SAE",
      classAverage: moyenneInfo.classAverage ?? { value: 0, disabled: true },
      studentAverage: moyenneInfo.studentAverage ?? {
        value: 0,
        disabled: true,
      },
      outOf: moyenneInfo.outOf ?? { value: 20, disabled: true },
      grades: mapEvaluations(s.evaluations ?? [], accountId, kidName, s.titre),
    } as Subject;
  });
}

function mapEvaluations(
  evaluations: Evaluation[],
  accountId: string,
  kidName?: string,
  subjectName?: string
): Grade[] {
  return evaluations.map(e => {
    const moyenneInfo = extractMoyenneInfo(
      (e as any).note ?? (e as any).moyenne
    );

    const grade: Grade = {
      id: String(e.id),
      name:
        (e as any).titre ??
        (e as any).libelle ??
        (e as any).nom ??
        `Évaluation ${e.id}`,
      coefficient: parseCoefficient((e as any).coef),
      studentScore:
        moyenneInfo.studentAverage ??
        ({
          value: 0,
          disabled: true,
        } as GradeScore),
      classAverage:
        moyenneInfo.classAverage ??
        ({
          value: 0,
          disabled: true,
        } as GradeScore),
      outOf:
        moyenneInfo.outOf ??
        ({
          value: 20,
          disabled: true,
        } as GradeScore),
      date: (e as any).date_debut ?? (e as any).date_fin ?? undefined,
      accountId,
      kidName,
      metadata: {
        lannion: {
          raw: e,
          subjectName,
        },
      },
    } as unknown as Grade;

    return grade;
  });
}

function extractMoyenneInfo(moyenne: Record<string, any> | null | undefined): {
  studentAverage?: GradeScore;
  classAverage?: GradeScore;
  outOf?: GradeScore;
} {
  if (!moyenne) {
    return {};
  }

  const value = normalizeNumber(moyenne.value ?? moyenne.note ?? moyenne.moy);
  const max = normalizeNumber(moyenne.max);
  const moyPromo = normalizeNumber(moyenne.moy);

  const studentAverage =
    value != null ? ({ value, disabled: false } as GradeScore) : undefined;

  const classAverage =
    moyPromo != null
      ? ({ value: moyPromo, disabled: false } as GradeScore)
      : undefined;

  const outOf =
    max != null ? ({ value: max, disabled: false } as GradeScore) : undefined;

  return { studentAverage, classAverage, outOf };
}

function normalizeNumber(value: any): number | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(",", ".").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }

  return undefined;
}

function parseCoefficient(coef: any): number {
  const n = normalizeNumber(coef);
  return n != null && n > 0 ? n : 1;
}

function computeOverall(
  subjects: Subject[],
  selector: (s: Subject) => GradeScore | undefined
): GradeScore {
  const values: number[] = [];

  for (const subject of subjects) {
    const score = selector(subject);
    if (!score || score.disabled) {
      continue;
    }
    if (typeof score.value !== "number") {
      continue;
    }
    if (Number.isNaN(score.value)) {
      continue;
    }
    values.push(score.value);
  }

  if (!values.length) {
    return { value: 0, disabled: true };
  }

  const avg =
    values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1);

  return { value: avg, disabled: false };
}
