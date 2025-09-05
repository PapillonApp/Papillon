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
  const [news, setNews] = useState<SharedNews[]>([]);

  useEffect(() => {

    const query = database.get<News>('news').query();

    const sub = query.observe().subscribe(news =>
      setNews(
        news.map(mapNewsToShared).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      )
    );

    return () => sub.unsubscribe();
  }, [refresh, database]);

  return news;
}

export async function addNewsToDatabase(news: SharedNews[]) {
  const db = getDatabaseInstance();

  await db.write(async () => {
    for (const item of news) {
      const id = generateId(item.author + item.title + item.createdByAccount);

      const existingRecords = await db.get('news')
        .query(Q.where("newsId", id))
        .fetch();

      if (existingRecords.length === 0) {
        await db.get('news').create((record: Model) => {
          const newsModel = record as News;
          newsModel.newsId = id;
          newsModel.title = item.title ?? "";
          newsModel.createdAt = item.createdAt.getTime();
          newsModel.acknowledged = item.acknowledged;
          newsModel.attachments = JSON.stringify(item.attachments ?? []);
          newsModel.content = item.content ?? "";
          newsModel.author = item.author ?? "";
          newsModel.category = item.category ?? "";
          newsModel.createdByAccount = item.createdByAccount ?? "";
        });
      } else {
        const recordToUpdate = existingRecords[0];
        await recordToUpdate.update((record: Model) => {
          const newsModel = record as News;
          newsModel.title = item.title ?? newsModel.title;
          newsModel.createdAt = item.createdAt.getTime();
          newsModel.acknowledged = item.acknowledged;
          newsModel.attachments = JSON.stringify(item.attachments ?? []);
          newsModel.content = item.content ?? newsModel.content;
          newsModel.author = item.author ?? newsModel.author;
          newsModel.category = item.category ?? newsModel.category;
          newsModel.createdByAccount = item.createdByAccount ?? newsModel.createdByAccount;
        });
      }
    }
  });
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