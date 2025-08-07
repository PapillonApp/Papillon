type Grade = {
  score: number | null;
  outOf: number | null;
  coef?: number;
};

const PapillonMedian = (grades: Grade[]): number => {
  const validGrades = grades
    .filter((grade) => grade.score !== null && grade.outOf !== null)
    .map((grade) => ((grade.score! / grade.outOf!) * 20 * (grade.coef || 1)));

  if (validGrades.length === 0) {return 0;}

  validGrades.sort((a, b) => a - b);

  const middle = Math.floor(validGrades.length / 2);

  if (validGrades.length % 2 === 0) {
    return (validGrades[middle - 1] + validGrades[middle]) / 2;
  } 
  return validGrades[middle];
  
};

export default PapillonMedian;