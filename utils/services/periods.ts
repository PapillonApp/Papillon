import { t } from "i18next";


export const getPeriodName = (name: string) => {
  // return only name
  let digits = name.replace(/[^0-9]/g, '').trim();
  let newName = name.replace(digits, '').trim();

  switch (newName.toLowerCase()) {
    case "trimestre":
      return t("Grades_Trimester");
    case "semestre":
      return t("Grades_Semester");
    case "hors période":
      return t("Grades_OutPeriod");
    case "bac blanc":
      return t("Grades_MockExamBac");
    case "brevet blanc":
      return t("Grades_MockExamBrevet");
    case "année":
      return t("Grades_Year");
    default:
      return newName;
  }
}

export const isPeriodWithNumber = (name: string) => {
  // return only digits
  let newName = name.replace(/[^0-9]/g, '').trim();

  return newName.length > 0;
}

export const getPeriodNumber = (name: string) => {
  // return only digits
  let newName = name.replace(/[^0-9]/g, '').trim();

  if (newName.length === 0) {
    newName = name[0].toUpperCase();
  }

  return newName.toString()[0];
}