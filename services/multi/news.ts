import { Skolengo } from "skolengojs";

import { AttachmentType } from "../shared/attachment";
import { Multi } from "esup-multi.js";
import { News } from "../shared/news";
import { t } from "i18next";

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
    author: t("Author_Unknown"),
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
