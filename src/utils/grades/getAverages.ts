import type { Grade } from "@/services/shared/Grade";

export interface GradeHistory {
  value: number;
  date: string;
}

type Target = "student" | "average" | "min" | "max";

export type AverageDiffGrade = {
  difference?: number;
  with: number;
  without: number;
};

const getPronoteAverage = (grades: Grade[], target: Target = "student"): number => {
  if (!grades || grades.length === 0) return -1;

  const groupedBySubject = grades.reduce((acc: Record<string, Grade[]>, grade) => {
    const subject = grade.subjectName.split(">")[0].trim();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(grade);
    return acc;
  }, {});

  const subjectAverages = Object.values(groupedBySubject).map(subjectGrades =>
    getSubjectAverage(subjectGrades, target)
  );

  const validAverages = subjectAverages.filter(avg => avg !== -1);
  if (validAverages.length === 0) return 0;

  // Calcul de la moyenne générale : somme des moyennes par matière divisée par le nombre de matières
  return validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length;
};

const getSubjectAverage = (grades: Grade[], target: Target = "student"): number => {
  const validGrades = grades.filter(grade => {
    const targetGrade = grade[target];
    return targetGrade && !targetGrade.disabled && targetGrade.value !== null;
  });

  if (validGrades.length === 0) return -1;

  let totalWeightedGrade = 0;
  let totalWeight = 0;

  validGrades.forEach(grade => {
    const targetGrade = grade[target];
    const value = targetGrade.value!;
    const outOf = grade.outOf.value!;
    const coefficient = grade.coefficient || 1;

    if (grade.isBonus) {
      // Note bonus : ajoutée directement à la somme sans affecter le poids total
      // Formule : (valeur / total) * 20 * coefficient
      totalWeightedGrade += (value / outOf) * 20 * coefficient;
    } else if (grade.isOptional) {
      // Note optionnelle : ajoutée seulement si elle améliore la moyenne
      const gradeValue = (value / outOf) * 20;
      if (gradeValue > (totalWeightedGrade / totalWeight) || totalWeight === 0) {
        totalWeightedGrade += gradeValue * coefficient;
        totalWeight += coefficient;
      }
    } else if (grade.isOutOf20) {
      // Note sur 20 : ajoutée directement
      totalWeightedGrade += value * coefficient;
      totalWeight += coefficient;
    } else {
      // Note standard : normalisée sur 20 et pondérée
      // Formule : (valeur / total) * 20 * coefficient
      totalWeightedGrade += (value / outOf) * 20 * coefficient;
      totalWeight += coefficient;
    }
  });

  // Calcul de la moyenne : somme des notes pondérées divisée par la somme des coefficients
  return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
};

const getAverageDiffGrade = (grades: Grade[], list: Grade[], target: Target = "student"): AverageDiffGrade => {
  const baseList = list;
  const gradesToRemove = grades;
  const baseListWithoutGrade = baseList.filter(grade => !gradesToRemove.includes(grade));

  const baseAverage = getSubjectAverage(baseList, target);
  const baseWithoutGradeAverage = getSubjectAverage(baseListWithoutGrade, target);

  // Calcul de la différence entre la moyenne sans les notes et la moyenne avec les notes
  return {
    difference: baseWithoutGradeAverage - baseAverage,
    with: baseAverage,
    without: baseWithoutGradeAverage,
  };
};

const getAveragesHistory = (grades: Grade[], target: Target = "student", final?: number): GradeHistory[] => {
  // Calcul de l'historique des moyennes en ajoutant progressivement chaque note
  const history = grades.map((_, index) => ({
    value: getPronoteAverage(grades.slice(0, index + 1), target),
    date: new Date(grades[index].timestamp).toISOString(),
  }));

  // Ajout de la moyenne finale ou de la moyenne actuelle
  history.push({
    value: final !== undefined ? final : getPronoteAverage(grades, target),
    date: new Date().toISOString(),
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
};

export {
  getPronoteAverage,
  getAverageDiffGrade,
  getAveragesHistory
};