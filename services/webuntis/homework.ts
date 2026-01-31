import { WebUntis } from "webuntis";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";

interface WebUntisHomework {
  id: number;
  lessonId: number;
  date: number;
  dueDate: number;
  text: string;
  remark: string;
  completed: boolean;
  attachments: WebUntisAttachment[];
}

interface WebUntisLesson {
  id: number;
  subject: string;
  lessonType: string;
}

interface WebUntisAttachment {
  kind: number;
  name: string;
  url: string;
}

interface WebUntisResponse {
  homeworks: WebUntisHomework[];
  lessons: WebUntisLesson[];
  records: unknown[];
  teachers: unknown[];
}

export async function fetchWebUntisHomeworks(session: WebUntis, accountId: string, weekNumberRaw: number): Promise<Homework[]> {
  const result: Homework[] = [];

  if (session) {
    const { start, end } = getDateRangeOfWeek(weekNumberRaw);
    const response = await session.getHomeWorkAndLessons(start, end) as unknown as WebUntisResponse;

    const homeworks = response.homeworks || [];
    const lessons = response.lessons || [];

    for (const homework of homeworks) {
      const lesson = lessons.find((l) => l.id === homework.lessonId);
    
      result.push({
        id: homework.id.toString(),
        subject: lesson?.subject || "Unknown",
        content: homework.remark || homework.text,
        dueDate: WebUntis.convertUntisDate(homework.dueDate.toString()),
        isDone: homework.completed,
        attachments: homework.attachments.map((attachment) => ({
          type: attachment.kind,
          name: attachment.name,
          url: attachment.url,
          createdByAccount: accountId,
        })),
        evaluation: false,
        custom: false,
        createdByAccount: accountId
      });
    }
  }

  return result;
}