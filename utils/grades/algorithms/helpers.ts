import { Grade } from "@/services/shared/grade";

type ScoreProperty = "studentScore" | "averageScore" | "minScore" | "maxScore";

const getSubjectAverageByProperty = (
  subject: Grade[],
  property: ScoreProperty = "studentScore",
  loop: boolean = false
): number => {
  let calcGradesSum = 0;
  let calcOutOfSum = 0;

  for (let i = 0; i < subject.length; i++) {
    const grade = subject[i];
    const targetScore = grade[property];

    // Skip invalid grades
    if (
      !targetScore ||
      targetScore.disabled ||
      targetScore.value === null ||
      targetScore.value < 0 ||
      grade.coefficient === 0 ||
      typeof targetScore.value !== "number" ||
      !grade.outOf?.value
    ) {
      continue;
    }

    const coefficient = grade.coefficient || 1;
    const outOfValue = grade.outOf.value;
    const gradeValue = targetScore.value;

    // Handle optional grades (only for student scores)
    if (property === "studentScore" && grade.optional && !loop) {
      const filteredSubject = subject.filter((_, idx) => idx !== i);
      const avgWithout = getSubjectAverageByProperty(filteredSubject, property, true);
      const avgWith = getSubjectAverageByProperty(subject, property, true);

      // Only keep optional grade if it improves the average
      if (avgWithout > avgWith) {
        continue;
      }
    }

    // Handle bonus grades (only for student scores)
    if (property === "studentScore" && grade.bonus) {
      const averageMoy = outOfValue / 2;
      const newGradeValue = gradeValue - averageMoy;

      if (newGradeValue >= 0) {
        calcGradesSum += newGradeValue;
        calcOutOfSum += 1;
      }
      continue;
    }

    // Normalize grades to /20 scale
    if (gradeValue > 20 || (coefficient < 1 && outOfValue - 20 >= -5) || outOfValue > 20) {
      const gradeOn20 = (gradeValue / outOfValue) * 20;
      calcGradesSum += gradeOn20 * coefficient;
      calcOutOfSum += 20 * coefficient;
    } else {
      calcGradesSum += gradeValue * coefficient;
      calcOutOfSum += outOfValue * coefficient;
    }
  }

  if (calcOutOfSum > 0) {
    const result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
    return isNaN(result) ? -1 : result;
  }

  return -1;
};

export const PapillonSubjectAvgByProperty = (
  grades: Grade[],
  property: ScoreProperty = "studentScore"
): number => {
  if (!grades?.length) {
    return 0;
  }

  const groupedBySubject: Record<string, Grade[]> = {};
  let countedSubjects = 0;
  let totalAverage = 0;

  // Group grades by subject
  for (let i = 0; i < grades.length; i++) {
    const grade = grades[i];
    const key = grade.subjectId;
    if (!groupedBySubject[key]) {
      groupedBySubject[key] = [];
    }
    groupedBySubject[key].push(grade);
  }

  const subjects = Object.values(groupedBySubject);

  // Calculate average for each subject
  for (let i = 0; i < subjects.length; i++) {
    const nAvg = getSubjectAverageByProperty(subjects[i], property);
    if (nAvg !== -1) {
      countedSubjects++;
      totalAverage += nAvg;
    }
  }

  return countedSubjects > 0 ? totalAverage / countedSubjects : 0;
};
