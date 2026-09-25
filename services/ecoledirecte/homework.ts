
import { Client } from "@blockshub/blocksdirecte";

import { Homework } from "../shared/homework";

export async function fetchEDHomeworks(
  session: Client,
  accountId: string,
  weekNumber: number
): Promise<Homework[]> {
  const weekdays = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];
  for (const date of weekdays) {
    const formattedDate = formatDate(date);

    const { matieres } = await session.homework.getHomeworksForDate(formattedDate);

    for (const subject of matieres) {
      const homework = subject.aFaire
      response.push({
        attachments: [],
        content: homework?.contenu ?? "",
        isDone: homework?.effectue ?? false,
        dueDate: date,
        id: String(homework?.idDevoir),
        subject: subject.matiere.length > 0 ? subject.matiere : subject.entityLibelle,
        evaluation: false,
        custom: false,
        createdByAccount: accountId
      });
    }
  }

  return response
}

export async function setEDHomeworkAsDone(session: Client, homework: Homework, state?: boolean): Promise<Homework> {
  const finalState = state ?? !homework.isDone
  const homeworkId = Number(homework.id)
  
  if (finalState) {
    await session.homework.markHomeworkAsDone(homeworkId)
  } else {
    await session.homework.markHomeworkAsUndone(homeworkId)
  }
  return {
    ...homework,
    isDone: finalState
  }
}

import { addDays,format,startOfISOWeek } from "date-fns";

export const weekNumberToDaysList = (weekNumber: number, year?: number): Date[] => {
  const currentYear = year || new Date().getFullYear();
  
  // Trouver le premier jour ISO de l'année (lundi de la semaine 1)
  const jan4 = new Date(currentYear, 0, 4); 
  const firstWeekStart = startOfISOWeek(jan4);
  
  // Calculer le lundi de la semaine demandée
  const weekStart = new Date(firstWeekStart);
  weekStart.setDate(firstWeekStart.getDate() + (weekNumber - 1) * 7);

  // Construire la liste des jours
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};