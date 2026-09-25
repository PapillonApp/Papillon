import {
  assignmentsFromWeek,
  assignmentStatus,
  SessionHandle,
  translateToWeekNumber,
} from "@blockshub/pawnote-lts";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { Homework, ReturnFormat } from "@/services/shared/homework";
import { error } from "@/utils/logger/logger";

/**
  * Fetches homework assignments from PRONOTE for the current week.
  * @param {SessionHandle} session - The session handle for the PRONOTE account.
  * @param {string} accountId - The ID of the account requesting the homeworks.
  * @returns {Promise<Homework[]>} A promise that resolves to an array of Homework objects.
 */
export async function fetchPronoteHomeworks(session: SessionHandle, accountId: string, weekNumberRaw: number): Promise<Homework[]> {
  const result: Homework[] = [];

  if (!session) {
    throw error("Session is undefined", "fetchPronoteHomeworks");
  }

  const { start } = getDateRangeOfWeek(weekNumberRaw)
  const weekNumber = translateToWeekNumber(start, session.instance.firstMonday);
  const homeworks = await assignmentsFromWeek(session, weekNumber);
  for (const homework of Array.isArray(homeworks) ? homeworks : []) {
      result.push({
        id: homework.id,
        subject: homework.subject?.name ?? "Autre",
        content: homework.description ?? "",
        dueDate: homework.deadline,
        isDone: homework.done,
        returnFormat:
          homework.return?.kind === 1 ? ReturnFormat.PAPER : ReturnFormat.FILE_UPLOAD,
        attachments: (Array.isArray(homework.attachments) ? homework.attachments : []).map((attachment) => ({
          type: attachment.kind,
          name: attachment.name,
          url: attachment.url,
          createdByAccount: accountId,
        })),
        evaluation: false,
        custom: false,
        createdByAccount: accountId,
      });
  }

  return result;
}

export async function setPronoteHomeworkAsDone(session: SessionHandle, homework: Homework, status?: boolean): Promise<Homework> {
  if (homework.fromCache) {
    throw error("You can't set data from cache as done.")
  }

  const isDone = status ?? !homework.isDone;
  await assignmentStatus(session, homework.id, isDone);

  return {
    ...homework,
    isDone,
    progress: isDone ? 1 : 0
  }
}
