import { Grade } from "@/services/shared/grade";

const PapillonWeightedAvg = (grades: Grade[]): number => {
  let calcGradesSum = 0;
  let calcOutOfSum = 0;

  grades.forEach((grade) => {
    // Skip invalid grades
    if (
      !grade.studentScore ||
      grade.studentScore.disabled ||
      grade.studentScore.value === null ||
      grade.studentScore.value < 0 ||
      grade.coefficient === 0 ||
      typeof grade.studentScore.value !== "number" ||
      !grade.outOf?.value
    ) {
      return;
    }

    const coefficient = grade.coefficient || 1;
    const outOfValue = grade.outOf.value;
    const gradeValue = grade.studentScore.value;

    // Handle bonus grades
    if (grade.bonus) {
      const averageMoy = outOfValue / 2;
      const newGradeValue = gradeValue - averageMoy;

      if (newGradeValue >= 0) {
        calcGradesSum += newGradeValue;
        calcOutOfSum += 1;
      }
      return;
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
  });

  if (calcOutOfSum > 0) {
    const result = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
    return isNaN(result) ? 0 : result;
  }

  return 0;
};

export default PapillonWeightedAvg;