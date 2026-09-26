import { Grade } from "@/services/shared/grade";
import { ScoreProperty } from "./helpers";

const PapillonGradesAveragesOverTime = (algorithm: (grades: Grade[], key: ScoreProperty) => number, grades: Grade[], key: ScoreProperty = "studentScore") => {
  const sortedGrades = grades.sort((a, b) => new Date(a.givenAt).getTime() - new Date(b.givenAt).getTime());

  const averages: { date: Date; average: number }[] = [];

  for (let i = 0; i < sortedGrades.length; i++) {
    const currentGrades = sortedGrades.slice(0, i + 1);
    const average = algorithm(currentGrades, key);
    averages.push({ date: sortedGrades[i].givenAt, average });
  }

  return averages;
};

export default PapillonGradesAveragesOverTime;