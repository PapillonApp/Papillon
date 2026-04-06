import { Grade } from "@/services/shared/grade";
import { ScoreProperty } from "./helpers";

const PapillonGradesAveragesOverTime = (algorithm: (grades: Grade[], key: ScoreProperty) => number, grades: Grade[], key: ScoreProperty = "studentScore") => {
  const sortedGrades = [...grades].sort((a, b) => getGradeTimestamp(a.givenAt) - getGradeTimestamp(b.givenAt));

  const averages: { date: Date; average: number }[] = [];

  for (let i = 0; i < sortedGrades.length; i++) {
    const currentGrades = sortedGrades.slice(0, i + 1);
    const average = algorithm(currentGrades, key);
    averages.push({ date: sortedGrades[i].givenAt ?? new Date(), average });
  }

  return averages;
};

function getGradeTimestamp(date?: Date): number {
  if (!date) {
    return 0;
  }

  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export default PapillonGradesAveragesOverTime;
