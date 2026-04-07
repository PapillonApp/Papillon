import { getDateRangeOfWeek } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";
import { WebUntisClient } from "webuntis-client";


export async function fetchWebUntisHomeworks(client: WebUntisClient, accountId: string, weekNumberRaw: number): Promise<Homework[]> {
  const result: Homework[] = [];

  const { start, end } = getDateRangeOfWeek(weekNumberRaw)
  const homeworks = await client.homeworks.get({ start, end });

  for ( const homework of homeworks ) {
    result.push({
      id: homework.id,
      subject: homework.subject,
      content: homework.text,
      dueDate: homework.dueDate,
      isDone: homework.completed,
      canComplete: false,
      attachments: [],
      evaluation: false,
      custom: false,
      createdByAccount: accountId,
    });

  }

  return result;
}