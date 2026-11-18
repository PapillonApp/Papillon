import { Grade } from "@/services/shared/grade";

export type ScoreProperty =
  | "studentScore"
  | "averageScore"
  | "minScore"
  | "maxScore";

export interface NormalizedGrade {
  gradeOn20: number;
  coefficient: number;
  bonus: boolean;
  optional: boolean;
}

export interface AverageDetails {
  average: number;
  isOptionalOnly: boolean;
}

/**
 * Validates a grade for a given score property and normalizes its value to /20.
 */
export const normalizeValidGrade = (
  grade: Grade,
  property: ScoreProperty = "studentScore"
): NormalizedGrade | null => {
  const targetScore = grade[property];

  if (
    !targetScore ||
    targetScore.disabled ||
    targetScore.value === null ||
    targetScore.value === undefined ||
    typeof targetScore.value !== "number" ||
    !Number.isFinite(targetScore.value) ||
    targetScore.value < 0 ||
    grade.coefficient === 0 ||
    !grade.outOf?.value ||
    !Number.isFinite(grade.outOf.value) ||
    grade.outOf.value <= 0
  ) {
    return null;
  }

  const rawCoefficient = grade.coefficient ?? 1;
  if (!Number.isFinite(rawCoefficient) || rawCoefficient <= 0) {
    return null;
  }

  const applyStudentRules = property === "studentScore";

  return {
    gradeOn20: (targetScore.value / grade.outOf.value) * 20,
    coefficient: rawCoefficient,
    bonus: applyStudentRules && Boolean(grade.bonus),
    optional: applyStudentRules && Boolean(grade.optional),
  };
};

/**
 * Computes a weighted /20 average with PRONOTE bonus and greedy-descending optional handling.
 */
export const computeWeightedAverageDetails = (
  grades: Grade[],
  property: ScoreProperty = "studentScore",
  allowOptionalOnlyFallback: boolean = false
): AverageDetails => {
  const mandatory: NormalizedGrade[] = [];
  const optional: NormalizedGrade[] = [];
  const bonus: NormalizedGrade[] = [];

  for (const grade of grades) {
    const normalized = normalizeValidGrade(grade, property);
    if (!normalized) {
      continue;
    }

    if (normalized.bonus) {
      bonus.push(normalized);
    } else if (normalized.optional) {
      optional.push(normalized);
    } else {
      mandatory.push(normalized);
    }
  }

  let calcGradesSum = 0;
  let calcOutOfSum = 0;

  for (const item of mandatory) {
    calcGradesSum += item.gradeOn20 * item.coefficient;
    calcOutOfSum += 20 * item.coefficient;
  }

  if (calcOutOfSum > 0) {
    for (const item of bonus) {
      const bonusPoints = Math.max(0, item.gradeOn20 - 10) * item.coefficient;
      calcGradesSum += bonusPoints;
    }

    // Evaluate optional grades from highest to lowest so inferior ones cannot ride in early.
    const sortedOptional = [...optional].sort(
      (a, b) => b.gradeOn20 - a.gradeOn20 || b.coefficient - a.coefficient
    );

    for (const item of sortedOptional) {
      const currentAverage = (calcGradesSum / calcOutOfSum) * 20;
      if (item.gradeOn20 > currentAverage) {
        calcGradesSum += item.gradeOn20 * item.coefficient;
        calcOutOfSum += 20 * item.coefficient;
      }
    }

    const result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
    return {
      average: Number.isNaN(result) ? -1 : result,
      isOptionalOnly: false,
    };
  }

  if (allowOptionalOnlyFallback && optional.length > 0) {
    for (const item of optional) {
      calcGradesSum += item.gradeOn20 * item.coefficient;
      calcOutOfSum += 20 * item.coefficient;
    }

    for (const item of bonus) {
      const bonusPoints = Math.max(0, item.gradeOn20 - 10) * item.coefficient;
      calcGradesSum += bonusPoints;
    }

    const result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
    return {
      average: Number.isNaN(result) ? -1 : result,
      isOptionalOnly: true,
    };
  }

  return { average: -1, isOptionalOnly: false };
};

/**
 * Computes the overall subject-based average, treating 100%-optional subjects greedily.
 */
export const computeOverallSubjectAverage = (
  grades: Grade[],
  property: ScoreProperty = "studentScore",
  emptyValue: number = -1
): number => {
  if (!grades?.length) {
    return emptyValue;
  }

  const groupedBySubject: Record<string, Grade[]> = {};

  for (const grade of grades) {
    const key = grade.subjectId;
    if (!groupedBySubject[key]) {
      groupedBySubject[key] = [];
    }
    groupedBySubject[key].push(grade);
  }

  let countedSubjects = 0;
  let totalAverage = 0;
  const optionalSubjectAverages: number[] = [];

  for (const subjectGrades of Object.values(groupedBySubject)) {
    const { average, isOptionalOnly } = computeWeightedAverageDetails(
      subjectGrades,
      property,
      true
    );

    if (average === -1) {
      continue;
    }

    if (isOptionalOnly) {
      optionalSubjectAverages.push(average);
    } else {
      countedSubjects++;
      totalAverage += average;
    }
  }

  if (countedSubjects > 0 && optionalSubjectAverages.length > 0) {
    optionalSubjectAverages.sort((a, b) => b - a);
    for (const optAverage of optionalSubjectAverages) {
      if (optAverage > totalAverage / countedSubjects) {
        totalAverage += optAverage;
        countedSubjects++;
      }
    }
  }

  return countedSubjects > 0 ? totalAverage / countedSubjects : emptyValue;
};

export const getSubjectAverageByProperty = (
  subject: Grade[],
  property: ScoreProperty = "studentScore",
  _loop: boolean = false
): number => computeWeightedAverageDetails(subject, property, true).average;

export const PapillonSubjectAvgByProperty = (
  grades: Grade[],
  property: ScoreProperty = "studentScore"
): number => computeOverallSubjectAverage(grades, property, 0);
