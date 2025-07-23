const PapillonWeightedAvg = (grades) => {
  let Addition = 0;
  let Total = 0;

  grades.forEach((grade) => {
    if (grade.score !== null && grade.outOf !== null) {
      Addition += (grade.score / grade.outOf) * 20 * (grade.coef || 1); // Use coef or default to 1 if not provided
      Total += grade.coef || 1; // Use coef or default to 1 if not provided
    }
  });

  return Total > 0 ? Addition / Total : 0;
};

export default PapillonWeightedAvg;