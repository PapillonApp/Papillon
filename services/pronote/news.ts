import { news as PawnoteNews, NewsInformation, SessionHandle } from "pawnote";
import { News } from "@/services/shared/news";

/**
 * Fetches homework assignments from PRONOTE for the current week.
 * @param {SessionHandle} session - The session handle for the PRONOTE account.
 * @param {string} accountId - The ID of the account requesting the homeworks.
 * @returns {Promise<Homework[]>} A promise that resolves to an array of Homework objects.
 */
export async function fetchPronoteNews(session: SessionHandle, accountId: string): Promise<News[]> {
  const result: News[] = [];

  if (session) {
    const news = await PawnoteNews(session) as unknown as NewsInformation[];
    for (const item of news) {
      result.push({
        id: item.id,
        title: item.title,
        createdAt: item.creationDate,
        acknowledged: item.read,
        attachments: item.attachments.map((attachment) => ({
          type: attachment.kind,
          name: attachment.name,
          url: attachment.url,
          createdByAccount: accountId,
        })),
        content: item.content,
        author: item.author,
        category: item.category.name,
        createdByAccount: accountId,
      });
    }
  }

  return result;
}