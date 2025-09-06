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
  try {
    const weekdays = weekNumberToDaysList(weekNumber);
    const allHomeworks = await Promise.all(
      weekdays.map(day =>
        studentHomeworks(session, account, day.toISOString().split("T")[0]).then(res =>
          res.homeworks.map(hw => ({
            id: String(hw.id),
            subject: hw.subject,
            content: hw.content,
            dueDate: day,
            isDone: hw.done,
            attachments: mapEDAttachments(hw.attachments, accountId),
            evaluation: hw.exam,
            custom: false,
            createdByAccount: accountId
          }))
        )
      )
    );
    return allHomeworks.flat();
  } catch (error) {
    warn(String(error))
    return []
  }
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

export const weekNumberToDaysList = (weekNumber: number, year?: number): Date[] => {
  const currentYear = year || new Date().getFullYear();
  
  const firstDayOfYear = new Date(currentYear, 0, 1);
  
  const firstMonday = new Date(firstDayOfYear);
  const dayOfWeek = firstDayOfYear.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  firstMonday.setDate(firstDayOfYear.getDate() + daysToAdd);
  
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  
  const weekdays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekdays.push(day);
  }
  
  console.log(weekdays);
  return weekdays;
};