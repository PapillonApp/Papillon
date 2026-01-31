import { WebUntis } from "webuntis";

import { News } from "@/services/shared/news";

export async function fetchWebUntisNews(session: WebUntis, accountId: string): Promise<News[]> {
  const result: News[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newsWidget = await session.getNewsWidget(today);
  const messagesOfDay = newsWidget.messagesOfDay;

  for (const message of messagesOfDay) {
    result.push({
      id: message.id.toString(),
      title: message.subject,
      createdAt: today,
      acknowledged: false,
      attachments: (message.attachments ?? []).map((attachment) => ({
        type: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        createdByAccount: accountId
      })),
      content: message.text,
      author: "",
      category: "",
      createdByAccount: accountId,
    });
  }

  return result;
}