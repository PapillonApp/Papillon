const PapillonWeightedAvg = (grades) => {
  let Addition = 0;
  let Total = 0;

  grades.filter(grade => !grade.studentScore?.disabled).forEach((grade) => {
    if (grade.studentScore?.value !== null && grade.outOf?.value !== null) {
      Addition += (grade.studentScore.value / grade.outOf.value) * 20 * (grade.coef || 1); // Use coef or default to 1 if not provided
      Total += grade.coefficient || 1; // Use coef or default to 1 if not provided
    }
  });

  return Total > 0 ? Addition / Total : 0;
};

export default PapillonWeightedAvg;