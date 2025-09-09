import { Account, Document, Session, setHomeworkState, studentHomeworks } from "pawdirecte";

import { warn } from "@/utils/logger/logger";

import { Attachment, AttachmentType } from "../shared/attachment";
import { Homework } from "../shared/homework";

export async function fetchEDHomeworks(
  session: Session,
  account: Account,
  accountId: string,
  weekNumber: number
): Promise<Homework[]> {
  const weekdays = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];
  for (const date of weekdays) {
    const formattedDate = formatDate(date);

    const { homeworks } = await studentHomeworks(
      session,
      account,
      formattedDate,
    );

    for (const homework of homeworks) {
      response.push({
        attachments: homework.attachments.map((att) => ({
          url: `${att.name}\\${att.id}\\${att.kind}`,
          type: AttachmentType.FILE,
          name: att.name,
          createdByAccount: accountId
        })),
        content: homework.content,
        isDone: homework.done,
        dueDate: date,
        id: homework.id.toString(),
        subject: homework.subject,
        evaluation: homework.exam,
        custom: false,
        createdByAccount: accountId
      });
    }
  }

  return response
}

function mapEDAttachments(data: Document[], accountId: string): Attachment[] {
  return data.map(att => ({
    type: AttachmentType.FILE,
    name: att.name,
    url: att.name,
    createdByAccount: accountId
  }))
}

export async function setEDHomeworkAsDone(session: Session, account: Account, homework: Homework, state?: boolean): Promise<Homework> {
  await setHomeworkState(session, account, Number(homework.id), state ?? !homework.isDone)
  return {
    ...homework,
    isDone: state ?? !homework.isDone
  }
}

import { startOfISOWeek, addDays } from "date-fns";

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

import { format } from "date-fns";

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};