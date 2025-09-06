import { Account, Session, studentHomepageTimeline } from "pawdirecte";

import { warn } from "@/utils/logger/logger";

import { News } from "../shared/news";

export async function fetchEDNews(session: Session, account: Account, accountId: string): Promise<News[]> {
  try {
    const news = await studentHomepageTimeline(session, account)
    return news.map(item => ({
      id: item.id,
      createdAt: item.creationDate,
      createdByAccount: accountId,
      acknowledged: true,
      attachments: [],
      content: item.content,
      author: item.authorName,
      category: "Actualités"
    }))
  } catch (error) {
    warn(String(error))
    return []
  }
}