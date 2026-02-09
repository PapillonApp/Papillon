import { WebUntisClient } from "webuntis-client";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";

export async function fetchWebUntisHomeworks(
  session: WebUntisClient,
  accountId: string,
  weekNumberRaw: number
): Promise<Homework[]> {
  const result: Homework[] = [];

  if (session) {
    const { start, end } = getDateRangeOfWeek(weekNumberRaw);
    const homeworks = await session.getHomeworks(start, end);

    for (const homework of homeworks) {
      result.push({
        id: homework.id,
        subject: homework.subject,
        content: homework.text,
        dueDate: homework.dueDate,
        isDone: homework.completed,
        attachments: [],
        evaluation: false,
        custom: false,
        createdByAccount: accountId,
      });
    }
  }

  return result;
}
