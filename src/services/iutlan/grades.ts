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
    const matieres = (scodocData["relevé"] as any).ressources;

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
      const subjectName = matiere.titre + " > " + key;

      const subject = {
        id: uuid(),
        name: subjectName,
      };

      const grades: Grade[] = matiere.evaluations.map((note: any) => {
        const grade: Grade = {
          student: {
            value: parseFloat(note.note.value),
            disabled: isNaN(parseFloat(note.note.value)),
          },
          min: {
            value: parseFloat(note.note.min),
            disabled: false,
          },
          max: {
            value: parseFloat(note.note.max),
            disabled: false,
          },
          average: {
            value: parseFloat(note.note.moy),
            disabled: false,
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

      const average = grades.filter(grade => grade.student.value != null).reduce((acc, grade) => acc + (grade.student.value as number), 0) / grades.length;
      const min = grades.filter(grade => grade.min.value != null).reduce((acc, grade) => Math.min(acc, (grade.min.value as number)), 20);
      const max = grades.filter(grade => grade.max.value != null).reduce((acc, grade) => Math.max(acc, (grade.max.value as number)), 0);
      const classAverage = grades.filter(grade => grade.average.value != null).reduce((acc, grade) => acc + (grade.average.value as number), 0) / grades.length;


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
