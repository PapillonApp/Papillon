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

// From https://github.com/PapillonApp/Papillon/blob/main/src/utils/epochWeekNumber.ts

const EPOCH_WN_CONFIG = {
  setHour: 6, // We are in Europe, so we set the hour to 6 UTC to avoid any problem with the timezone (= 2h in the morning in Summer Paris timezone)
  setStartDay: 1, // We set the first day of the week to Monday to ensure that the week number is the same for the whole world
  setMiddleDay: 3, // We set the middle day of the week to Wednesday to ensure <... same than above ...>
  setEndDay: 7, // We set the last day of the week to Sunday to ensure <...>
  numberOfMsInAWeek: 1000 /* ms */ * 60 /* s */ * 60 /* min */ * 24 /* h */ * 7, /* days */
  adjustEpochInitialDate: 259200000, // =(((new Date(0)).getDay()-1) * EPOCH_WN_CONFIG.numberOfMsInAWeek/7) // We need to substract this for having a good range cause 01/01/1970 was not a Monday and the "-1" is to have Monday as the first day of the week
};

export const weekNumberToDaysList = (epochWeekNumber: number): Date[] => {
  const baseTime =
    epochWeekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek -
    EPOCH_WN_CONFIG.adjustEpochInitialDate;
  const weekdays = [];
  for (let i = 0; i < 7; i++) {
    weekdays.push(new Date(baseTime + i * 86400000));
  }
  return weekdays;
};