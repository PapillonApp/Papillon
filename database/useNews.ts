import { Model, Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { Attachment } from "@/services/shared/attachment";
import { News as SharedNews } from "@/services/shared/news";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import News from "./models/News";
import { parseJsonArray } from "./useHomework";

export function useNews(refresh = 0) {
  const database = useDatabase();
  const [homeworks, setHomeworks] = useState<SharedNews[]>([]);

  useEffect(() => {

    const query = database.get<News>('homework').query();

    const sub = query.observe().subscribe(news =>
      setHomeworks(
        news.map(mapNewsToShared).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      )
    );

    return () => sub.unsubscribe();
  }, [refresh, database]);

  return homeworks;
}

export async function addNewsToDatabase(news: SharedNews[]) {
  const db = getDatabaseInstance();
  for (const nw of news) {
    const id = generateId(nw.createdAt + nw.content + nw.author + nw.createdByAccount)
    const existing = await db.get('news').query(
      Q.where("newsId", id)
    )

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('news').create((record: Model) => {
        const news = record as News;
        Object.assign(news, {
          newsId: id,
          title: nw.title ?? "",
          createdAt: nw.createdAt.getTime(),
          acknowledged: nw.acknowledged,
          attachments: JSON.stringify(nw.attachments),
          content: nw.content,
          author: nw.author,
          category: nw.category
        })
      })
    })
  }
}

export async function getNewsFromCache(): Promise<SharedNews[]> {
  try {
    const database = getDatabaseInstance();

    const news = await database
      .get<News>('news')
      .query()
      .fetch();

    return news
      .map(mapNewsToShared)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

function mapNewsToShared(news: News): SharedNews {
  return {
    id: news.id,
    title: news.title,
    createdAt: new Date(news.createdAt),
    acknowledged: news.acknowledged,
    attachments: parseJsonArray(news.attachments) as Attachment[],
    content: news.content,
    author: news.author,
    category: news.category,
    createdByAccount: news.createdByAccount,
    fromCache: true
  };
}