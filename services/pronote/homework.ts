import { assignmentsFromWeek, SessionHandle } from "pawnote";
import { Homework, ReturnFormat } from "@/services/shared/homework";

export async function fetchPronoteHomeworks(session: SessionHandle, accountId: string): Promise<Homework[]> {
  const result: Homework[] = [];

  if (session) {
    const homeworks = await assignmentsFromWeek(session, 1, 4);
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