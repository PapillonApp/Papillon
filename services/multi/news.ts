import { Multi } from "esup-multi.js";
import { t } from "i18next";

import { AttachmentType } from "../shared/attachment";
import { News } from "../shared/news";

export async function fetchMultiNews(
  session: Multi,
  accountId: string
): Promise<News[]> {
  const news = await session.getActualities();
  return news.map(item => ({
    id: item.title,
    title: item.title,
    createdAt: new Date(item.pubDate),
    acknowledged: true,
    content: item.content,
    author: t("Profile_News_Author_Unknown"),
    category: "Actualités",
    attachments: [
      {
        type: AttachmentType.LINK,
        name: item.link ?? "",
        url: item.link ?? "",
        createdByAccount: accountId,
      },
    ].filter(attachment => attachment.name && attachment.url),
    ref: item,
    createdByAccount: accountId,
  }));
}
