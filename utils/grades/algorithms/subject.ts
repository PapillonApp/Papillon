import { Grade } from "@/services/shared/grade";

const PapillonSubjectAvg = (grades: Grade[], prop: keyof Grade = "studentScore") => {
  const subjectAverages: Record<string, { addition: number; total: number }> = {};
  
  grades.filter(grade => !grade.studentScore?.disabled).forEach((grade) => {
    if (!subjectAverages[grade.subjectId]) {
      subjectAverages[grade.subjectId] = { addition: 0, total: 0 };
    }

    if (grade[prop]?.value && grade.outOf.value && grade[prop]?.value !== null && grade.outOf !== null) {
      subjectAverages[grade.subjectId].addition += (grade[prop]?.value / grade.outOf.value) * 20 * (grade.coefficient || 1);
      subjectAverages[grade.subjectId].total += grade.coefficient || 1;
    }
  });

  // Calculate each subject's average
  const subjectAvgValues = Object.values(subjectAverages).map(({ addition, total }) => {
    return total > 0 ? addition / total : 0;
  });

  // Return the average of all subjects
  const overallAverage = (subjectAvgValues.reduce((sum, avg) => sum + avg, 0) / subjectAvgValues.length);

  return overallAverage;
};

export default PapillonSubjectAvg;