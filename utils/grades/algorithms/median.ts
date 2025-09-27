import { Grade } from "@/services/shared/grade";

const PapillonMedian = (grades: Grade[]): number => {
  const validGrades = grades
    .filter((grade) => grade.studentScore?.value && grade.studentScore?.value !== null && grade.outOf !== null && !grade.studentScore.disabled)
    .map((grade) => ((grade.studentScore?.value! / grade.outOf.value!) * 20 * (grade.coefficient || 1)));

  if (validGrades.length === 0) {return 0;}

  validGrades.sort((a, b) => a - b);

  const middle = Math.floor(validGrades.length / 2);

  if (validGrades.length % 2 === 0) {
    return (validGrades[middle - 1] + validGrades[middle]) / 2;
  } 
  return validGrades[middle];
  
};

export default PapillonMedian;