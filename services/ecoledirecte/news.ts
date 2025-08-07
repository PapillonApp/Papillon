import { Account, Session, studentHomepageTimeline } from "pawdirecte";

import { News } from "../shared/news";

export async function fetchEDNews(session: Session, account: Account, accountId: string): Promise<News[]> {
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
}