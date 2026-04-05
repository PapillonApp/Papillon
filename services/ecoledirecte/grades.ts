
import { Client } from "@blockshub/blocksdirecte";

import { getSubjectAverageByProperty } from "@/utils/grades/algorithms/helpers";
import { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { warn } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchEDGradePeriods(session: Client, accountId: string): Promise<Period[]> {
  try {
    const overview = await session.marks.getMark()
    return overview.periodes.map(period => ({
      name: period.periode,
      id: period.codePeriode,
      start: new Date(period.dateDebut),
      end: new Date(period.dateFin),
      createdByAccount: accountId
    }))
  } catch {
    return []
  }
}

export async function fetchEDGrades(session: Client, accountId: string, period: Period): Promise<PeriodGrades> {
  try {
    const overview = await session.marks.getMark()
    const periodReport = overview.periodes.find(
      item => item.codePeriode === period.id || item.idPeriode === period.id
    )
    const grades = getGradesForPeriod(overview.notes, period)

    if (!periodReport) {
      warn("Invalid grades data structure or period not found")
      return emptyPeriodGrades(accountId)
    }
    
    const subjects: Record<string, Subject> = {}
    const allMappedGrades: Grade[] = grades.map(g => ({
      id: String(g.id),
      subjectId: g.codeMatiere,
      subjectName: g.libelleMatiere,
      description: g.devoir?.trim() || g.commentaire?.trim() || "",
      givenAt: new Date(g.date),
      subjectFile: undefined,
      correctionFile: undefined,
      bonus: false,
      optional: g.nonSignificatif,
      outOf: parseGradeValue(g.noteSur),
      coefficient: parseNumericValue(g.coef, 1) ?? 1,
      studentScore: parseGradeValue(g.valeur),
      averageScore: parseGradeValue(g.moyenneClasse),
      minScore: parseGradeValue(g.minClasse),
      maxScore: parseGradeValue(g.maxClasse),
      createdByAccount: accountId
    }))
    
    for (const subject of periodReport.ensembleMatieres?.disciplines ?? []) {
      const parsedAverage = parseGradeValue(subject.moyenne)
      const parsedClassAverage = parseGradeValue(subject.moyenneClasse)
      const parsedMaximum = parseGradeValue(subject.moyenneMax)
      const parsedMinimum = parseGradeValue(subject.moyenneMin)
      const grades = allMappedGrades.filter(grade => grade.subjectId === subject.codeMatiere)
      const computedAverage = getSubjectAverage(grades)
      const computedClassAverage = getSubjectAverageByProperty(grades, "averageScore")
      const computedMaximum = getSubjectAverageByProperty(grades, "maxScore")
      const computedMinimum = getSubjectAverageByProperty(grades, "minScore")

      subjects[subject.codeMatiere] = {
        id: subject.codeMatiere,
        name: subject.discipline,
        studentAverage: parsedAverage.disabled && computedAverage >= 0 ? { value: computedAverage } : parsedAverage,
        classAverage: parsedClassAverage.disabled && computedClassAverage >= 0 ? { value: computedClassAverage } : parsedClassAverage,
        maximum: parsedMaximum.disabled && computedMaximum >= 0 ? { value: computedMaximum } : parsedMaximum,
        minimum: parsedMinimum.disabled && computedMinimum >= 0 ? { value: computedMinimum } : parsedMinimum,
        outOf: { value: 20 },
        grades
      }
    }

    const subjectValues = Object.values(subjects).filter(subject => subject.grades?.length)
    const average = getAverageScore(
      parseGradeValue(periodReport.ensembleMatieres?.moyenneGenerale),
      subjectValues,
      "studentAverage"
    )
    const classAverage = getAverageScore(
      parseGradeValue(periodReport.ensembleMatieres?.moyenneClasse),
      subjectValues,
      "classAverage"
    )

    return {
      studentOverall: average,
      classAverage,
      subjects: subjectValues,
      createdByAccount: accountId
    }
  } catch (error) {
    warn(String(error))
    return emptyPeriodGrades(accountId)
  }
}

function emptyPeriodGrades(accountId: string): PeriodGrades {
  return {
    createdByAccount: accountId,
    classAverage: { value: 16.66, disabled: true },
    studentOverall: { value: 16.66, disabled: true },
    subjects: []
  }
}

function parseGradeValue(value?: string | number | null): GradeScore {
  const score = parseNumericValue(value);
  if (typeof score === "number" && Number.isFinite(score)) {
    return { value: score };
  }

  return { value: 0, disabled: true, status: formatGradeStatus(value) };
}

function getGradesForPeriod<T extends { codePeriode?: string; date?: string }>(grades: T[], period: Period): T[] {
  const directMatches = grades.filter(grade => grade.codePeriode === period.id)

  if (directMatches.length > 0) {
    return directMatches
  }

  return grades.filter(grade => isGradeInPeriod(grade, period))
}

function parseNumericValue(value?: string | number | null, fallback?: number): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback
  }

  if (typeof value !== "string") {
    return fallback
  }

  const normalized = value
    .replace(/\u00A0/g, " ")
    .trim()

  if (!normalized) {
    return fallback
  }

  const score = Number.parseFloat(normalized.replace(",", "."))
  return Number.isFinite(score) ? score : fallback
}

function isGradeInPeriod(grade: { date?: string }, period: Period): boolean {
  if (!grade.date) {
    return false
  }

  const gradeDate = new Date(grade.date)
  return !Number.isNaN(gradeDate.getTime())
    && gradeDate.getTime() >= period.start.getTime()
    && gradeDate.getTime() <= period.end.getTime()
}

function formatGradeStatus(value?: string | number | null): string {
  if (typeof value !== "string") {
    return "Inconnu"
  }

  const normalized = value
    .replace(/\u00A0/g, " ")
    .trim()

  if (!normalized) {
    return "Inconnu"
  }

  switch (normalized.toLowerCase()) {
  case "abs":
  case "abs.":
    return "Abs."
  case "disp":
  case "disp.":
    return "Disp."
  case "n.not":
  case "n.not.":
    return "N. Not."
  default:
    return normalized
  }
}

function getAverageScore(
  directScore: GradeScore,
  subjects: Subject[],
  key: "studentAverage" | "classAverage"
): GradeScore {
  if (!directScore.disabled && Number.isFinite(directScore.value)) {
    return directScore
  }

  const validValues = subjects
    .map(subject => subject[key])
    .filter(score => !score.disabled && Number.isFinite(score.value))
    .map(score => score.value)

  if (validValues.length === 0) {
    return { value: 0, disabled: true, status: "Inconnu" }
  }

  return {
    value: validValues.reduce((sum, currentValue) => sum + currentValue, 0) / validValues.length
  }
}
