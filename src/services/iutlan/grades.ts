import { LocalAccount } from "@/stores/account/types";
import  {
  type AverageOverview,
  type Grade
} from "@/services/shared/Grade";
import uuid from "@/utils/uuid-v4";

export const saveIUTLanGrades = async (account: LocalAccount): Promise<{
  grades: Grade[];
  averages: AverageOverview;
}> => {
  try {
    // Il faudrait peut-être penser à typer cette partie, tous les types sont any :(
    const scodocData = account.identityProvider.rawData;

    const ressources = (scodocData["relevé"] as any).ressources;
    const saes = (scodocData["relevé"] as any).saes;

    Object.keys(ressources).forEach((key) => {
      ressources[key].type = "ressource";
    });

    Object.keys(saes).forEach((key) => {
      saes[key].type = "sae";
    });

    const matieres = {
      ...ressources,
      ...saes,
    };

    const gradesList: Grade[] = [];
    const averages: AverageOverview = {
      classOverall: {
        value: null,
        disabled: true,
      },
      overall: {
        value: null,
        disabled: true,
      },
      subjects: []
    };

    Object.keys(matieres).forEach((key) => {
      const matiere = matieres[key];
      const subjectName =
        matiere.type === "sae"
          ? key + " - " + matiere.titre + " > " + key
          : matiere.titre + " > " + key;

      const subject = {
        id: uuid(),
        name: subjectName,
      };

      const grades: Grade[] = matiere.evaluations.map((note: any) => {
        const parsedStudent = note.note.value !== "~" ? parseFloat(note.note.value) : null; // Create a condition when ~ ("~" appears when a grade is not already put in scodoc)
        const parsedAverage = note.note.moy !== "~" ? parseFloat(note.note.moy) : null;
        const parsedMin = note.note.min !== "~" ? parseFloat(note.note.min) : null;
        const parsedMax = note.note.max !== "~" ? parseFloat(note.note.max) : null;
        const grade: Grade = {
          student: {
            value: parseFloat(note.note.value),
            disabled: parsedStudent === null || isNaN(parsedStudent),
          },
          min: {
            value: parseFloat(note.note.min),
            disabled: parsedMin === null || isNaN(parsedMin),
          },
          max: {
            value: parseFloat(note.note.max),
            disabled: parsedMax === null || isNaN(parsedMax),
          },
          average: {
            value: parseFloat(note.note.moy),
            disabled: parsedAverage === null || isNaN(parsedAverage),
          },

          id: uuid(),
          outOf: {
            value: 20,
            disabled: false,
          },
          description: note.description,
          timestamp: new Date(note.date).getTime(),
          coefficient: parseFloat(note.coef),
          isBonus: false,
          isOptional: false,
          subjectName: subject.name,
        };

        gradesList.push(grade);

        return grade;
      });

      //
      const average = grades.filter(grade => grade.student.value != null && !isNaN(grade.student.value)).length > 0? grades.filter(grade => grade.student.value != null && !isNaN(grade.student.value)).reduce((acc, grade) => acc + (grade.student.value as number), 0) / grades.filter(grade => grade.student.value != null && !isNaN(grade.student.value)).length: NaN;

      const min = grades.filter(grade => grade.min.value != null && !isNaN(grade.min.value)).length > 0 ?grades.filter(grade => grade.min.value != null && !isNaN(grade.min.value)).reduce((acc, grade) => Math.min(acc, (grade.min.value as number)), 20): NaN;
      const max = grades.filter(grade => grade.max.value != null && !isNaN(grade.max.value)).length > 0 ? grades.filter(grade => grade.max.value != null && !isNaN(grade.max.value)).reduce((acc, grade) => Math.max(acc, (grade.max.value as number)), 0): NaN;

      const classAverage = grades.filter(grades => grades.average.value != null && !isNaN(grades.average.value)).length > 0 ? grades.filter(grades => grades.average.value != null && !isNaN(grades.average.value)).reduce((acc, grade) => acc + (grade.average.value as number), 0) / grades.filter(grades => grades.average.value != null && !isNaN(grades.average.value)).length: NaN;


      if (grades.length === 0) {
        return;
      }

      averages.subjects.push({
        classAverage: {
          value: classAverage,
          disabled: false,
        },
        color: "#888888",
        max: {
          value: max,
          disabled: false,
        },
        subjectName: subject.name,
        min: {
          value: min,
          disabled: false,
        },
        average: {
          value: average,
          disabled: false,
        },
        outOf: {
          value: 20,
          disabled: false,
        },
      });
    });

    return { grades: gradesList, averages: averages };
  }
  catch(e) {
    console.error(e);
    return {
      grades: [],
      averages: {
        classOverall: {
          value: null,
          disabled: true,
        },
        overall: {
          value: null,
          disabled: true,
        },
        subjects: []
      }
    };
  }
};
