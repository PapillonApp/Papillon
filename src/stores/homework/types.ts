import type { Homework } from "@/services/shared/Homework";

export interface HomeworkStore {
  homeworks: Record<number, Homework[]>;
  updateHomeworks: (epochWeekNumber: number, homeworks: Homework[]) => void;
  addHomework: (epochWeekNumber: number, homework: Homework) => void;
  updateHomework: (
    epochWeekNumber: number,
    homeworkID: string,
    updatedHomework: Homework
  ) => void;
  removeHomework: (epochWeekNumber: number, homeworkID: string) => void;
  existsHomework: (epochWeekNumber: number, homeworkID: string) => boolean;
}
