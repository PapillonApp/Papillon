import { t } from "i18next";

export const getPeriodName = (name: string) => {
  // If the name is a year range (like 2025/2026), return it as is
  if ( /^\d{4}\/\d{4}$/.test(name) ) {
    return name;
  }

  // Remove common prefixes that might be leftover (like "er" from "1er")
  let newName = name.replace(/^\d{1,4}[a-zÀ-ù]{0,4}/, "").replace(/\d/g, "").trim();

  // Remove digits
  newName = newName.replace(/\d/g, "").trim();

  switch ( newName.toLowerCase() ) {
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
  // If the name is a year range (like 2025/2026), return false (it's not a period with a number like "1er trimestre")
  if ( /^\d{4}\/\d{4}$/.test(name) ) {
    return false;
  }

  // return only digits
  let newName = name.replace(/\D/g, "").trim();

  return newName.length > 0;
}

export const getPeriodNumber = (name: string) => {
  //  If the name is a year range (like 2025/2026), return nothing
  if ( /^\d{4}\/\d{4}$/.test(name) ) {
    return "";
  }

  // return only digits
  let newName = name.replace(/\D/g, "").trim();

  if ( newName.length === 0 ) {
    newName = name[0].toUpperCase();
  }

  return newName.toString()[0];
}