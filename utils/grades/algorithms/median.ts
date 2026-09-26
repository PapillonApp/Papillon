import { Grade } from "@/services/shared/grade";

const PapillonMedian = (grades: Grade[]): number => {
  const validGrades = grades
    .filter((grade) => 
      grade.studentScore?.value !== null && 
      grade.studentScore?.value !== undefined && 
      grade.outOf?.value !== null && 
      grade.outOf?.value !== undefined &&
      !grade.studentScore.disabled &&
      grade.coefficient !== 0 &&
      grade.studentScore.value >= 0
    )
    .map((grade) => {
      const coefficient = grade.coefficient || 1;
      const outOfValue = grade.outOf.value!;
      const gradeValue = grade.studentScore!.value!;
      
      // Normalize to /20 scale
      let normalizedValue: number;
      if (gradeValue > 20 || (coefficient < 1 && outOfValue - 20 >= -5) || outOfValue > 20) {
        normalizedValue = (gradeValue / outOfValue) * 20;
      } else {
        normalizedValue = (gradeValue / outOfValue) * 20;
      }
      
      return normalizedValue;
    });

  if (validGrades.length === 0) {
    return 0;
  }

  validGrades.sort((a, b) => a - b);

  const middle = Math.floor(validGrades.length / 2);

  if (validGrades.length % 2 === 0) {
    return (validGrades[middle - 1] + validGrades[middle]) / 2;
  }
  
  return validGrades[middle];
};

export default PapillonMedian;