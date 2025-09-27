import { Model, Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { Attachment } from "@/services/shared/attachment";
import { News as SharedNews } from "@/services/shared/news";
import { generateId } from "@/utils/generateId";
import { info,warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import News from "./models/News";
import { parseJsonArray } from "./useHomework";
import { safeWrite } from "./utils/safeTransaction";

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

  const itemsToCreate: Array<{ id: string; item: SharedNews }> = [];
  const itemsToUpdate: Array<{ record: Model; item: SharedNews }> = [];

  for (const item of news) {
    const id = generateId(item.author + item.title + item.createdByAccount);

    const existingRecords = await db.get('news')
      .query(Q.where("newsId", id))
      .fetch();

    if (existingRecords.length === 0) {
      itemsToCreate.push({ id, item });
    } else {
      itemsToUpdate.push({ record: existingRecords[0], item });
    }
  }

  if (itemsToCreate.length > 0 || itemsToUpdate.length > 0) {
    await safeWrite(
      db,
      async () => {
        const createPromises = itemsToCreate.map(({ id, item }) =>
          db.get('news').create((record: Model) => {
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
          })
        );

        const updatePromises = itemsToUpdate.map(({ record, item }) =>
          record.update((model: Model) => {
            const newsModel = model as News;
            newsModel.title = item.title ?? newsModel.title;
            newsModel.createdAt = item.createdAt.getTime();
            newsModel.acknowledged = item.acknowledged;
            newsModel.attachments = JSON.stringify(item.attachments ?? []);
            newsModel.content = item.content ?? newsModel.content;
            newsModel.author = item.author ?? newsModel.author;
            newsModel.category = item.category ?? newsModel.category;
            newsModel.createdByAccount = item.createdByAccount ?? newsModel.createdByAccount;
          })
        );

        await Promise.all([...createPromises, ...updatePromises]);
      },
      10000,
      `add_news_${itemsToCreate.length}_create_${itemsToUpdate.length}_update`
    );
  } else {
    info(`🍉 No news items to process`);
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