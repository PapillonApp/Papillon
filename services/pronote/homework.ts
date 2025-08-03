import { assignmentsFromWeek, SessionHandle, translateToWeekNumber } from "pawnote";

import { Homework, ReturnFormat } from "@/services/shared/homework";
import { getDateRangeOfWeek, getWeekNumberFromDate } from "@/database/useHomework";

/**
  * Fetches homework assignments from PRONOTE for the current week.
  * @param {SessionHandle} session - The session handle for the PRONOTE account.
  * @param {string} accountId - The ID of the account requesting the homeworks.
  * @returns {Promise<Homework[]>} A promise that resolves to an array of Homework objects.
 */
export async function fetchPronoteHomeworks(session: SessionHandle, accountId: string, weekNumberRaw: number): Promise<Homework[]> {
  const result: Homework[] = [];

	const { start } = getDateRangeOfWeek(weekNumberRaw)
  const weekNumber = translateToWeekNumber(start, session.instance.firstMonday);

  if (session) {
    const homeworks = await assignmentsFromWeek(session, weekNumber);
    for (const homework of homeworks) {
      result.push({
        id: homework.id,
        subject: homework.subject.name,
        content: homework.description,
        dueDate: homework.deadline,
        isDone: homework.done,
        returnFormat:
          homework.return.kind === 1 ? ReturnFormat.PAPER : ReturnFormat.FILE_UPLOAD,
        attachments: homework.attachments.map((attachment) => ({
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
  }

  return result;
}