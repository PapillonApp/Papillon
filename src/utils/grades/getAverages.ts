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

const getPronoteAverage = (grades: Grade[], target: Target = "student"): number => {
  if (!grades || grades.length === 0) return -1;

  const groupedBySubject = grades.reduce((acc: Record<string, Grade[]>, grade) => {
    const subject = grade.subjectName.split(">")[0].trim();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(grade);
    return acc;
  }, {});

  const subjectAverages = Object.values(groupedBySubject).map(subjectGrades =>
    getSubjectAverage(subjectGrades, target)
  );

  const validAverages = subjectAverages.filter(avg => avg !== -1);
  if (validAverages.length === 0) return 0;

  return validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length;
};

const getSubjectAverage = (grades: Grade[], target: Target = "student"): number => {
  const validGrades = grades.filter(grade => {
    const targetGrade = grade[target];
    return targetGrade && !targetGrade.disabled && targetGrade.value !== null;
  });

  if (validGrades.length === 0) return -1;

  const sum = validGrades.reduce((acc, grade) => {
    const targetGrade = grade[target];
    const value = targetGrade.value!;
    const outOf = grade.outOf.value!;
    return acc + (value / outOf) * 20;
  }, 0);

  return sum / validGrades.length;
};

const getAverageDiffGrade = (grades: Grade[], list: Grade[], target: Target = "student"): AverageDiffGrade => {
  const baseList = list;
  const gradesToRemove = grades;
  const baseListWithoutGrade = baseList.filter(grade => !gradesToRemove.includes(grade));

  const baseAverage = getSubjectAverage(baseList, target);
  const baseWithoutGradeAverage = getSubjectAverage(baseListWithoutGrade, target);

  return {
    difference: baseWithoutGradeAverage - baseAverage,
    with: baseAverage,
    without: baseWithoutGradeAverage,
  };
};

const getAveragesHistory = (grades: Grade[], target: Target = "student", final?: number): GradeHistory[] => {
  const history = grades.map((_, index) => ({
    value: getPronoteAverage(grades.slice(0, index + 1), target),
    date: new Date(grades[index].timestamp).toISOString(),
  }));

  history.push({
    value: final !== undefined ? final : getPronoteAverage(grades, target),
    date: new Date().toISOString(),
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
};

export {
  getPronoteAverage,
  getAverageDiffGrade,
  getAveragesHistory
};