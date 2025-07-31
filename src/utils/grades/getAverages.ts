import type { Grade } from "@/services/shared/Grade";

export interface GradeHistory {
  value: number;
  date: string;
}

type Target = "student" | "average" | "min" | "max";

export type AverageDiffGrade = {
  difference?: number;
  with: number;
  without: number;
};

// Memoization cache for subject averages
const subjectAverageCache = new Map<string, number>();

const getCacheKey = (subject: Grade[], target: Target, useMath: boolean, loop: boolean): string => {
  return `${target}-${useMath}-${loop}-${subject.map(g => g.subjectId ?? g.subjectName).join(",")}`;
};

const getPronoteAverage = (
  grades: Grade[],
  target: Target = "student",
  useMath: boolean = false
): number => {
  if (!grades?.length) return -1;

  const groupedBySubject: Record<string, Grade[]> = {};
  let countedSubjects = 0;
  let totalAverage = 0;

  // Optimized grouping
  for (let i = 0; i < grades.length; i++) {
    const grade = grades[i];
    const key = grade.subjectId ?? grade.subjectName;
    groupedBySubject[key] = groupedBySubject[key] || [];
    groupedBySubject[key].push(grade);
  }

  const subjects = Object.values(groupedBySubject);

  for (let i = 0; i < subjects.length; i++) {
    const nAvg = getSubjectAverage(subjects[i], target, useMath);
    if (nAvg !== -1) {
      countedSubjects++;
      totalAverage += nAvg;
    }
  }

  return countedSubjects > 0 ? totalAverage / countedSubjects : -1;
};

export const getSubjectAverage = (
  subject: Grade[],
  target: Target = "student",
  useMath: boolean = false,
  loop: boolean = false
): number => {
  const cacheKey = getCacheKey(subject, target, useMath, loop);
  const cachedValue = subjectAverageCache.get(cacheKey);
  if (cachedValue !== undefined) return cachedValue;

  let calcGradesSum = 0;
  let calcOutOfSum = 0;
  let countedGrades = 0;

  for (let i = 0; i < subject.length; i++) {
    const grade = subject[i];
    const targetGrade = grade[target];

    if (
      !targetGrade ||
      targetGrade.disabled ||
      targetGrade.value === null ||
      targetGrade.value < 0 ||
      grade.coefficient === 0 ||
      typeof targetGrade.value !== "number"
    ) {
      continue;
    }

    const coefficient = grade.coefficient;
    const outOfValue = grade.outOf.value!;

    if (grade.isOptional && !loop) {
      const filteredSubject = subject.filter((g, idx) => idx !== i);
      const avgWithout = getSubjectAverage(filteredSubject, target, useMath, true);
      const avgWith = getSubjectAverage(subject, target, useMath, true);

      if (avgWithout > avgWith) {
        continue;
      }
    }

    if (grade.isBonus) {
      const averageMoy = outOfValue / 2;
      const newGradeValue = targetGrade.value - averageMoy;

      if (newGradeValue >= 0) {
        calcGradesSum += newGradeValue;
        calcOutOfSum += 1;
      }
    } else if (useMath) {
      calcGradesSum += targetGrade.value * coefficient;
      countedGrades += coefficient;
    } else {
      if (targetGrade.value > 20 || (coefficient < 1 && outOfValue - 20 >= -5) || outOfValue > 20) {
        const gradeOn20 = (targetGrade.value / outOfValue) * 20;
        calcGradesSum += gradeOn20 * coefficient;
        calcOutOfSum += 20 * coefficient;
      } else {
        calcGradesSum += targetGrade.value * coefficient;
        calcOutOfSum += outOfValue * coefficient;
      }
      countedGrades++;
    }
  }

  let result = 0;
  if (useMath) {
    result = countedGrades > 0 ? calcGradesSum / countedGrades : -1;
  } else if (calcOutOfSum > 0) {
    result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
    result = isNaN(result) ? -1 : result;
  }

  subjectAverageCache.set(cacheKey, result);
  return result;
};

const getAverageDiffGrade = (
  grades: Grade[],
  list: Grade[],
  target: Target = "student",
  useMath: boolean = false
): AverageDiffGrade => {
  try {
    const baseAverage = getSubjectAverage(list, target);
    const filteredList = list.filter(grade =>
      !grades.some(g =>
        g.student.value === grade.student.value &&
        g.coefficient === grade.coefficient
      )
    );
    const baseWithoutGradeAverage = getSubjectAverage(filteredList, target, useMath);

    return {
      difference: baseWithoutGradeAverage - baseAverage,
      with: baseAverage,
      without: baseWithoutGradeAverage,
    };
  } catch (e) {
    return {
      difference: 0,
      with: 0,
      without: 0,
    };
  }
};

const getAveragesHistory = (
  grades: Grade[],
  target: Target = "student",
  final?: number,
  useMath: boolean = false
): GradeHistory[] => {
  if (!grades?.length) return [];

  const history: GradeHistory[] = [];
  let cumulativeGrades: Grade[] = [];
  let lastDate = "";

  // Pre-allocate array
  history.length = grades.length;

  for (let i = 0; i < grades.length; i++) {
    cumulativeGrades.push(grades[i]);
    const currentDate = new Date(grades[i].timestamp).toISOString();

    // Only add to history if date changed to reduce calculations
    if (currentDate !== lastDate) {
      history[i] = {
        value: getPronoteAverage(cumulativeGrades, target),
        date: currentDate
      };
      lastDate = currentDate;
    }
  }

  // Filter out undefined entries and sort
  const filteredHistory = history.filter(Boolean);
  filteredHistory.sort((a, b) => a.date.localeCompare(b.date));

  // Add final value
  const finalValue = final ?? getPronoteAverage(grades, target, useMath);
  if (!isNaN(finalValue)) {
    filteredHistory.push({
      value: finalValue,
      date: new Date().toISOString()
    });
  }

  return filteredHistory;
};

export { getPronoteAverage, getAverageDiffGrade, getAveragesHistory };