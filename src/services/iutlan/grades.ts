import { LocalAccount } from "@/stores/account/types";
import  {
  type AverageOverview,
  type Grade
} from "@/services/shared/Grade";
import uuid from "@/utils/uuid-v4";

export const saveIUTLanGrades = async (account: LocalAccount, periodName: string): Promise<{
  grades: Grade[];
  averages: AverageOverview;
}> => {
  try {
    // console.log(periodName);

    // Il faudrait peut-être penser à typer cette partie, tous les types sont any :(
    const data = account.serviceData.semestres as any;
    const scodocData = data[periodName] as any;

    if (!scodocData) {
      return {
        grades: [],
        averages: {
          classOverall: {
            value: null,
            disabled: true,
            status: null,
          },
          overall: {
            value: null,
            disabled: true,
            status: null,
          },
          subjects: []
        }
      };
    }

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
        status: null,
      },
      overall: {
        value: null,
        disabled: true,
        status: null,
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
            status: null,
          },
          min: {
            value: parseFloat(note.note.min),
            disabled: parsedMin === null || isNaN(parsedMin),
            status: null,
          },
          max: {
            value: parseFloat(note.note.max),
            disabled: parsedMax === null || isNaN(parsedMax),
            status: null,
          },
          average: {
            value: parseFloat(note.note.moy),
            disabled: parsedAverage === null || isNaN(parsedAverage),
            status: null,
          },

          id: uuid(),
          outOf: {
            value: 20,
            disabled: false,
            status: null,
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
          status: null,
        },
        color: "#888888",
        max: {
          value: max,
          disabled: false,
          status: null,
        },
        subjectName: subject.name,
        min: {
          value: min,
          disabled: false,
          status: null,
        },
        average: {
          value: average,
          disabled: false,
          status: null,
        },
        outOf: {
          value: 20,
          disabled: false,
          status: null,
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
          status: null,
        },
        overall: {
          value: null,
          disabled: true,
          status: null,
        },
        subjects: []
      }
    };
  }
};

export const saveIUTLanPeriods = async (account: LocalAccount): Promise<any> => {
  const scodocData = account.identityProvider.rawData;

  const semestresData = account.serviceData.semestres as any;

  const semestres = (scodocData["semestres"] as any).map((semestre: any) => {
    const semestreName = "Semestre " + semestre.semestre_id;
    const innerData = semestresData[semestreName] as any;

    const startTime = innerData["relevé"].semestre.date_debut ? new Date(innerData["relevé"].semestre.date_debut).getTime() : 1609459200;
    const endTime = innerData["relevé"].semestre.date_fin ? new Date(innerData["relevé"].semestre.date_fin).getTime() : 1622505600;

    return {
      name: semestreName,
      startTimestamp: startTime,
      endTimestamp: endTime,
    };
  });

  const finalData = {
    periods: semestres.length > 0 ? semestres : [
      {
        name: "Toutes",
        startTimestamp: 1609459200,
        endTimestamp: 1622505600
      },
    ],
    defaultPeriod: semestres.length > 0 ? semestres[semestres.length - 1].name : "Toutes"
  };

  return finalData;
};
