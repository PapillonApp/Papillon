const PapillonSubjectAvg = (grades) => {
  const subjectAverages = {};

  // Group grades by subjectId
  grades.forEach((grade) => {
    if (!subjectAverages[grade.subjectId]) {
      subjectAverages[grade.subjectId] = { addition: 0, total: 0 };
    }

    if (grade.score !== null && grade.outOf !== null) {
      subjectAverages[grade.subjectId].addition += (grade.score / grade.outOf) * 20 * (grade.coef || 1);
      subjectAverages[grade.subjectId].total += grade.coef || 1;
    }
  });

  // Calculate each subject's average
  const subjectAvgValues = Object.values(subjectAverages).map(({ addition, total }) => {
    return total > 0 ? addition / total : 0;
  });

  // Return the average of all subjects
  const overallAverage = subjectAvgValues.reduce((sum, avg) => sum + avg, 0) / subjectAvgValues.length;

  return overallAverage;
};

export default PapillonSubjectAvg;