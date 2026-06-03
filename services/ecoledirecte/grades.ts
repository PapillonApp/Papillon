import { Client } from "@blockshub/blocksdirecte";

import { getSubjectAverageByProperty } from "@/utils/grades/algorithms/helpers";
import { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { warn } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject, } from "../shared/grade";
import { SkillChipLevel } from "@/ui/components/SkillChip";
import { SkillsColorsPalette } from "@/constants/SkillsColorsPalette";
import is from "@sindresorhus/is";
import undefined = is.undefined;

export async function fetchEDGradePeriods(
  session: Client,
  accountId: string
): Promise<Period[]> {
  try {
    const overview = await session.marks.getMark();
    return overview.periodes.map(period => ({
      name: period.periode,
      id: period.codePeriode,
      start: new Date(period.dateDebut),
      end: new Date(period.dateFin),
      createdByAccount: accountId,
    }));
  } catch {
    return [];
  }
}

export async function fetchEDGrades(
  session: Client,
  accountId: string,
  period: Period
): Promise<PeriodGrades> {
  try {
    const overview = await session.marks.getMark();
    const periodReport = overview.periodes.find(
      item => item.codePeriode === period.id || item.idPeriode === period.id
    );
    const grades = getGradesForPeriod(overview.notes, period);

    if (!periodReport) {
      warn("Invalid grades data structure or period not found");
      return emptyPeriodGrades(accountId);
    }

    const subjects: Record<string, Subject> = {};
    const skillColors = {
      insufficient: overview.parametrage.couleurEval1,
      weak: overview.parametrage.couleurEval2,
      almostProficient: overview.parametrage.couleurEval3,
      satisfactory: overview.parametrage.couleurEval4,
    };
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
        createdByAccount: accountId,
        skills: g.elementsProgramme.map(s => ({
          name: s.libelleCompetence,
          description: s.descriptif,
          score: parseSkillLevel(parseInt(s.valeur), skillColors),
        })),
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
    warn(String(error));
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

function parseSkillLevel(value: number, colors: {insufficient: string, weak: string, almostProficient: string, satisfactory: string}): string | SkillChipLevel {
  switch (value) {
    case 1:
      return parseColor(colors.insufficient);
    case 2:
      return parseColor(colors.weak);
    case 3:
      return parseColor(colors.almostProficient);
    case 4:
      return parseColor(colors.satisfactory);
    case -1:
      return SkillChipLevel.Absent;
    case -2:
      return SkillChipLevel.Exempt;
    default:
      return SkillChipLevel.NotGraded;
  }
}

function parseSubjectAverage(
  current: string,
  grades: Grade[]
): GradeScore | undefined {
  const parsedAverage = parseGradeValue(current);
  if (parsedAverage) return parsedAverage;

  const estimatedAverage = getSubjectAverage(grades);
  if (estimatedAverage >= 0) return { value: estimatedAverage };

  return undefined;
}

function parseGradeValue(value?: string | number | null): GradeScore {
  const score = parseNumericValue(value);
  if (typeof score === "number" && Number.isFinite(score)) {
    return { value: score };
  }


  return { value: 0, disabled: true, status: formatGradeStatus(value) };
}

function hexToRgb(hex: string): {r: number; g: number; b: number} | undefined {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : undefined;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function parseColor(hex: string): string {
  const color: { r: number; g: number; b: number } | undefined = hexToRgb(hex);

  if (!color) return hex;

  const palette: ({r: number, g: number, b: number} | undefined)[] = SkillsColorsPalette.map((c) => hexToRgb(c));

  let closestColor = palette[0]!;
  let minDistance = Number.MAX_VALUE;

  for (const p of palette) {
    if (p === undefined) continue;

    const distance = Math.sqrt(
      Math.pow(color.r - p.r, 2) +
      Math.pow(color.g - p.g, 2) +
      Math.pow(color.b - p.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = p;
    }
  }

  return `#${componentToHex(closestColor.r)}${componentToHex(closestColor.g)}${componentToHex(closestColor.b)}`;
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
