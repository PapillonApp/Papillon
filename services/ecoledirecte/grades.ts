
import { Client } from "@blockshub/blocksdirecte";

import { getSubjectAverageByProperty } from "@/utils/grades/algorithms/helpers";
import { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { createMissingGradeScore, isMissingGradeScore } from "@/utils/grades/score";
import { warn } from "@/utils/logger/logger";
import { SkillChipLevel } from "@/ui/components/SkillChip";
import { SkillsColorsPalette } from "@/constants/SkillsColorsPalette";

import { createEDAttachment } from "./attachments";
import {
  Grade,
  GradeDisplaySettings,
  GradeScore,
  Period,
  PeriodGrades,
  Subject
} from "../shared/grade";

const DEFAULT_AVERAGE_SCALE = 20;

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
    const display = getDisplaySettings(overview.parametrage)
    const periodReport = overview.periodes.find(
      item => item.codePeriode === period.id || item.idPeriode === period.id
    )
    const grades = getGradesForPeriod(overview.notes, period)

    if (!periodReport && grades.length === 0) {
      warn("Invalid grades data structure or period not found")
      return emptyPeriodGrades(accountId, display)
    }

    const reportSubjects = periodReport?.ensembleMatieres?.disciplines ?? []
    const reportSubjectsById = new Map<string, (typeof reportSubjects)[number]>(
      reportSubjects.map(subject => [
        getEDSubjectId(subject.codeMatiere, subject.codeSousMatiere, subject.discipline),
        subject
      ])
    )
    const skillColors = {
      insufficient: overview.parametrage?.couleurEval1,
      weak: overview.parametrage?.couleurEval2,
      almostProficient: overview.parametrage?.couleurEval3,
      satisfactory: overview.parametrage?.couleurEval4,
    }

    const allMappedGrades: Grade[] = grades.map(g => {
      const subjectId = getEDSubjectId(g.codeMatiere, g.codeSousMatiere, g.libelleMatiere)
      const reportSubject = reportSubjectsById.get(subjectId)
        ?? findClosestReportSubject(reportSubjects, g.codeMatiere)
      const gradeOutOf = parseNumericValue(g.noteSur, display.scale) ?? display.scale

      return {
        id: String(g.id),
        subjectId,
        subjectName: reportSubject?.discipline || g.libelleMatiere,
        description: g.devoir?.trim() || g.commentaire?.trim() || "",
        givenAt: new Date(g.date),
        subjectFile: createEDAttachment(
          session,
          accountId,
          g.uncSujet,
          "subject",
          g.devoir?.trim() || g.libelleMatiere,
          {
            fileType: "NODEVOIR",
            downloadParams: { idDevoir: g.id },
          }
        ),
        correctionFile: createEDAttachment(
          session,
          accountId,
          g.uncCorrige,
          "correction",
          g.devoir?.trim() || g.libelleMatiere,
          {
            fileType: "NODEVOIR",
            downloadParams: { idDevoir: g.id },
          }
        ),
        bonus: false,
        optional: g.nonSignificatif,
        outOf: createNumericScore(gradeOutOf),
        coefficient: parseNumericValue(g.coef, 1) ?? 1,
        subjectCoefficient: parseNumericValue(reportSubject?.coef, 1) ?? 1,
        studentScore: parseGradeValue(g.valeur, gradeOutOf),
        averageScore: display.showGradeClassAverage ? parseGradeValue(g.moyenneClasse, gradeOutOf) : undefined,
        minScore: display.showGradeMinimum ? parseGradeValue(g.minClasse, gradeOutOf) : undefined,
        maxScore: display.showGradeMaximum ? parseGradeValue(g.maxClasse, gradeOutOf) : undefined,
        skills: (g.elementsProgramme ?? [])
          .map(skill => ({
            name: skill.libelleCompetence?.trim() ?? "",
            description: skill.descriptif?.trim() ?? "",
            score: parseSkillLevel(parseNumericValue(skill.valeur) ?? 0, skillColors),
          }))
          .filter(skill => skill.name || skill.description),
        createdByAccount: accountId
      }
    })

    const gradesBySubject = groupGradesBySubject(allMappedGrades)
    const subjects: Record<string, Subject> = {}

    for (const subject of reportSubjects) {
      const subjectId = getEDSubjectId(subject.codeMatiere, subject.codeSousMatiere, subject.discipline)
      const grades = gradesBySubject.get(subjectId) ?? []
      const computedAverage = getSubjectAverage(grades)
      const computedClassAverage = getSubjectAverageByProperty(grades, "averageScore")
      const computedMaximum = getSubjectAverageByProperty(grades, "maxScore")
      const computedMinimum = getSubjectAverageByProperty(grades, "minScore")

      subjects[subjectId] = {
        id: subjectId,
        name: subject.discipline,
        studentAverage: getResolvedScore(subject.moyenne, computedAverage, display.scale),
        classAverage: display.showSubjectClassAverage
          ? getResolvedScore(subject.moyenneClasse, computedClassAverage, display.scale)
          : createMissingGradeScore(),
        maximum: display.showSubjectMaximum
          ? getResolvedScore(subject.moyenneMax, computedMaximum, display.scale)
          : undefined,
        minimum: display.showSubjectMinimum
          ? getResolvedScore(subject.moyenneMin, computedMinimum, display.scale)
          : undefined,
        outOf: createNumericScore(display.scale),
        grades: grades.map(grade => ({
            ...grade,
            subjectName: subject.discipline,
            subjectCoefficient: parseNumericValue(subject.coef, 1) ?? 1
          })),
        coefficient: parseNumericValue(subject.coef, 1) ?? 1,
        rank: display.showSubjectRank ? parseRankScore(subject.rang, subject.effectif) : undefined,
      }
    }

    for (const [subjectId, subjectGrades] of gradesBySubject.entries()) {
      if (subjects[subjectId]) {
        continue
      }

      const firstGrade = subjectGrades[0]
      const computedAverage = getSubjectAverage(subjectGrades)
      const computedClassAverage = getSubjectAverageByProperty(subjectGrades, "averageScore")
      const computedMaximum = getSubjectAverageByProperty(subjectGrades, "maxScore")
      const computedMinimum = getSubjectAverageByProperty(subjectGrades, "minScore")

      subjects[subjectId] = {
        id: subjectId,
        name: firstGrade?.subjectName || "Inconnu",
        studentAverage: getResolvedScore(undefined, computedAverage, display.scale),
        classAverage: display.showSubjectClassAverage
          ? getResolvedScore(undefined, computedClassAverage, display.scale)
          : createMissingGradeScore(),
        maximum: display.showSubjectMaximum
          ? getResolvedScore(undefined, computedMaximum, display.scale)
          : undefined,
        minimum: display.showSubjectMinimum
          ? getResolvedScore(undefined, computedMinimum, display.scale)
          : undefined,
        outOf: createNumericScore(display.scale),
        grades: subjectGrades,
        coefficient: firstGrade?.subjectCoefficient ?? 1,
      }
    }

    const subjectValues = Object.values(subjects).filter(subject => subject.grades?.length)
    const average = getAverageScore(
      parseGradeValue(periodReport?.ensembleMatieres?.moyenneGenerale, display.scale),
      subjectValues,
      "studentAverage",
      display.useSubjectCoefficients,
      display.scale
    )
    const classAverage = getAverageScore(
      display.showOverallClassAverage
        ? parseGradeValue(periodReport?.ensembleMatieres?.moyenneClasse, display.scale)
        : createMissingGradeScore(),
      subjectValues,
      "classAverage",
      display.useSubjectCoefficients,
      display.scale
    )

    return {
      studentOverall: average,
      classAverage,
      rank: display.showOverallRank
        ? parseRankScore(periodReport?.ensembleMatieres?.rang, periodReport?.ensembleMatieres?.effectif)
        : undefined,
      subjects: subjectValues,
      display,
      createdByAccount: accountId
    }
  } catch (error) {
    warn(String(error))
    return emptyPeriodGrades(accountId)
  }
}

function emptyPeriodGrades(accountId: string, display: GradeDisplaySettings = getDisplaySettings()): PeriodGrades {
  return {
    createdByAccount: accountId,
    classAverage: createMissingGradeScore(),
    studentOverall: createMissingGradeScore(),
    subjects: [],
    display
  }
}

function parseGradeValue(value?: string | number | null, outOf?: number): GradeScore {
  const score = parseNumericValue(value);
  if (typeof score === "number" && Number.isFinite(score)) {
    return createNumericScore(score, outOf);
  }

  const status = formatGradeStatus(value)
  if (status) {
    return { value: 0, disabled: true, status, kind: "status" };
  }

  return createMissingGradeScore();
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
    return ""
  }

  const normalized = value
    .replace(/\u00A0/g, " ")
    .trim()

  if (!normalized) {
    return ""
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
  key: "studentAverage" | "classAverage",
  useSubjectCoefficients: boolean = false,
  outOf?: number
): GradeScore {
  if (!directScore.disabled && Number.isFinite(directScore.value)) {
    return directScore
  }

  let weightedTotal = 0
  let totalWeight = 0

  for (const subject of subjects) {
    const score = subject[key]
    if (!score || score.disabled || !Number.isFinite(score.value)) {
      continue
    }

    const weight = useSubjectCoefficients
      ? getSafeCoefficient(subject.coefficient)
      : 1

    weightedTotal += score.value * weight
    totalWeight += weight
  }

  if (totalWeight === 0) {
    return createMissingGradeScore()
  }

  return createNumericScore(weightedTotal / totalWeight, outOf)
}

function getDisplaySettings(settings?: {
  affichageMoyenneDevoir?: boolean
  affichagePositionMatiere?: boolean
  coefficientNote?: boolean
  colonneCoefficientMatiere?: boolean
  moyenneClasse?: boolean
  moyenneCoefMatiere?: boolean
  moyenneMax?: boolean
  moyenneMin?: boolean
  moyenneRang?: boolean
  moyenneSur?: number
}): GradeDisplaySettings {
  return {
    scale: parseNumericValue(settings?.moyenneSur, DEFAULT_AVERAGE_SCALE) ?? DEFAULT_AVERAGE_SCALE,
    showOverallClassAverage: Boolean(settings?.moyenneClasse),
    showOverallRank: Boolean(settings?.moyenneRang),
    showSubjectClassAverage: Boolean(settings?.moyenneClasse),
    showSubjectMinimum: Boolean(settings?.moyenneMin),
    showSubjectMaximum: Boolean(settings?.moyenneMax),
    showSubjectRank: Boolean(settings?.affichagePositionMatiere || settings?.moyenneRang),
    showSubjectCoefficient: Boolean(settings?.colonneCoefficientMatiere || settings?.moyenneCoefMatiere),
    showGradeClassAverage: Boolean(settings?.affichageMoyenneDevoir && settings?.moyenneClasse),
    showGradeMinimum: Boolean(settings?.affichageMoyenneDevoir && settings?.moyenneMin),
    showGradeMaximum: Boolean(settings?.affichageMoyenneDevoir && settings?.moyenneMax),
    showGradeCoefficient: Boolean(settings?.coefficientNote),
    useSubjectCoefficients: Boolean(settings?.moyenneCoefMatiere),
  }
}

function getResolvedScore(
  value: string | number | null | undefined,
  computedValue: number,
  outOf?: number
): GradeScore {
  const directScore = parseGradeValue(value, outOf)
  if (!isMissingGradeScore(directScore)) {
    return directScore
  }

  if (computedValue >= 0) {
    return createNumericScore(computedValue, outOf)
  }

  return directScore
}

function createNumericScore(value: number, outOf?: number): GradeScore {
  return {
    value,
    outOf,
    kind: "numeric"
  }
}

function parseRankScore(value?: string | number | null, total?: string | number | null): GradeScore | undefined {
  const rank = parseNumericValue(value)
  if (typeof rank !== "number" || rank <= 0) {
    return undefined
  }

  const outOf = parseNumericValue(total)
  return createNumericScore(rank, outOf)
}

function getEDSubjectId(codeMatiere?: string, codeSousMatiere?: string, fallbackName?: string): string {
  const parts = [normalizeString(codeMatiere), normalizeString(codeSousMatiere)].filter(Boolean)

  if (parts.length > 0) {
    return parts.join("::")
  }

  return normalizeString(fallbackName) || "unknown-subject"
}

function normalizeString(value?: string | null): string {
  return typeof value === "string"
    ? value.replace(/\u00A0/g, " ").trim()
    : ""
}

function findClosestReportSubject<T extends { codeMatiere?: string }>(
  subjects: T[],
  codeMatiere?: string
): T | undefined {
  return subjects.find(subject => subject.codeMatiere === codeMatiere)
}

function groupGradesBySubject(grades: Grade[]): Map<string, Grade[]> {
  const grouped = new Map<string, Grade[]>()

  for (const grade of grades) {
    const currentGrades = grouped.get(grade.subjectId) ?? []
    currentGrades.push(grade)
    grouped.set(grade.subjectId, currentGrades)
  }

  return grouped
}

function getSafeCoefficient(value?: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 1
}

type SkillColorSet = {
  insufficient?: string | null
  weak?: string | null
  almostProficient?: string | null
  satisfactory?: string | null
}

type RGBColor = {
  r: number
  g: number
  b: number
}

function parseSkillLevel(value: number, colors: SkillColorSet): SkillChipLevel | string {
  switch (value) {
  case 1:
    return parseSkillColor(colors.insufficient, SkillChipLevel.Insufficient)
  case 2:
    return parseSkillColor(colors.weak, SkillChipLevel.Weak)
  case 3:
    return parseSkillColor(colors.almostProficient, SkillChipLevel.AlmostProficient)
  case 4:
    return parseSkillColor(colors.satisfactory, SkillChipLevel.Satisfactory)
  case -1:
    return SkillChipLevel.Absent
  case -2:
    return SkillChipLevel.Exempt
  default:
    return SkillChipLevel.NotGraded
  }
}

function parseSkillColor(hex?: string | null, fallback: SkillChipLevel = SkillChipLevel.NotGraded): SkillChipLevel | string {
  const normalized = normalizeHexColor(hex)
  if (!normalized) {
    return fallback
  }

  const color = hexToRgb(normalized)
  if (!color) {
    return fallback
  }

  const palette = SkillsColorsPalette
    .map(colorHex => hexToRgb(colorHex))
    .filter((entry): entry is RGBColor => typeof entry !== "undefined")

  if (!palette.length) {
    return fallback
  }

  let closestColor = palette[0]
  let minDistance = Number.MAX_VALUE

  for (const paletteColor of palette) {
    const distance = Math.sqrt(
      Math.pow(color.r - paletteColor.r, 2)
      + Math.pow(color.g - paletteColor.g, 2)
      + Math.pow(color.b - paletteColor.b, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = paletteColor
    }
  }

  return `#${componentToHex(closestColor.r)}${componentToHex(closestColor.g)}${componentToHex(closestColor.b)}`
}

function normalizeHexColor(hex?: string | null): string | undefined {
  if (!hex) {
    return undefined
  }

  const normalized = hex.trim()
  if (!normalized) {
    return undefined
  }

  return normalized.startsWith("#") ? normalized : `#${normalized}`
}

function hexToRgb(hex: string): RGBColor | undefined {
  const normalized = normalizeHexColor(hex)
  if (!normalized) {
    return undefined
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  return result
    ? {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
    : undefined
}

function componentToHex(component: number): string {
  const hex = component.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}
