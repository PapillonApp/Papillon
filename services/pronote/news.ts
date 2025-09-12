import { news as PawnoteNews, NewsInformation, newsInformationAcknowledge, SessionHandle } from "pawnote";

import { News } from "@/services/shared/news";
import { error } from "@/utils/logger/logger";

/**
 * Fetches news from PRONOTE.
 * @param {SessionHandle} session - The session handle for the PRONOTE account.
 * @param {string} accountId - The ID of the account requesting the homeworks.
 * @returns {Promise<News[]>} A promise that resolves to an array of News objects.
 */
export async function fetchPronoteNews(session: SessionHandle, accountId: string): Promise<News[]> {
  const result: News[] = [];

  const response = await PawnoteNews(session) as unknown as { items: NewsInformation[] };
  const news = response.items;
  for (const item of news) {
    result.push({
      id: item.id,
      title: item.title,
      createdAt: item.creationDate,
      acknowledged: item.read,
      attachments: (item.attachments ?? []).map((attachment) => ({
        type: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        createdByAccount: accountId
      })),
      content: item.content,
      author: item.author,
      category: item.category.name,
      ref: item,
      createdByAccount: accountId,
    });
  }
  return result;
}

export async function setPronoteNewsAsAcknowledged(
  session: SessionHandle,
  news: News
): Promise<News> {
  if (news.ref) {
    await newsInformationAcknowledge(session, news.ref as NewsInformation);
    return {
	  ...news,
	  acknowledged: true,
    };
  }

  error("Reference for news item is missing.", "setPronoteNewsAsAcknowledged");
}