import {
  assignmentsFromWeek,
  assignmentStatus,
  SessionHandle,
  translateToWeekNumber,
} from "@blockshub/pawnote-lts";

import { getDateRangeOfWeek, getHomeworkRouteId } from "@/database/useHomework";
import { Homework, ReturnFormat } from "@/services/shared/homework";
import { error } from "@/utils/logger/logger";

const DAY_MS = 24 * 60 * 60 * 1000;

function getMondayWeekIndex(date: Date): number {
  const weekStart = getDateRangeOfWeek(1).start;
  const startMidnight = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate()
  );
  const dateMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (dateMidnight.getTime() - startMidnight.getTime()) / DAY_MS
  );
  return 1 + Math.floor(diffDays / 7);
}

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

export async function setPronoteHomeworkAsDone(
  session: SessionHandle,
  homework: Homework,
  status?: boolean,
  accountId?: string
): Promise<Homework> {
  let targetHomework = homework;

  if (homework.fromCache) {
    const dueDate = new Date(homework.dueDate);
    const resolvedAccountId = accountId ?? homework.createdByAccount;
    const weekIndex = getMondayWeekIndex(dueDate);
    const freshHomeworks = await fetchPronoteHomeworks(
      session,
      resolvedAccountId,
      weekIndex
    );
    const targetRouteId = getHomeworkRouteId({
      ...homework,
      dueDate,
      createdByAccount: resolvedAccountId,
    });
    const resolved = freshHomeworks.find(
      item =>
        item.id === homework.id ||
        getHomeworkRouteId(item) === homework.id ||
        getHomeworkRouteId(item) === targetRouteId
    );
    if (!resolved) {
      throw error(
        "You can't set data from cache as done.",
        "setPronoteHomeworkAsDone"
      );
    }
    targetHomework = resolved;
  }

  const finalStatus = status ?? !homework.isDone;

  try {
    await assignmentStatus(session, targetHomework.id, finalStatus);
  } catch (err) {
    const logged = error(String(err), "setPronoteHomeworkAsDone");
    throw err instanceof Error ? err : logged;
  }

  return {
    ...targetHomework,
    isDone: finalStatus,
    progress: finalStatus ? 1 : 0,
  };
}