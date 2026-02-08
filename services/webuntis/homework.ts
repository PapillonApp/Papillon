import { WebUntisClient } from "webuntis-client";
import { UtilsDate } from "webuntis-client/dist/utils/date";

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
    const response = await session.getHomeworksLessons(start, end);

    const homeworks = response.homeworks || [];
    const lessons = response.lessons || [];

    for (const homework of homeworks) {
      const lesson = lessons.find(l => l.id === homework.lessonId);

      const date = UtilsDate.fromUntisDate(
        homework.dueDate.toString(),
        "YYYYMMDD"
      );

      result.push({
        id: homework.id.toString(),
        subject: lesson?.subject || "Unknown",
        content: homework.text,
        dueDate: date,
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
