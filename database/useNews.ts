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

    const sub = query.observe().subscribe(records =>
      setNews(
        deduplicateNewsRecords(records)
          .map(mapNewsToShared)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      )
    );

    return () => sub.unsubscribe();
  }, [refresh, database]);

  return news;
}

export async function addNewsToDatabase(news: SharedNews[]) {
  const db = getDatabaseInstance();

  const deduplicatedNews = deduplicateIncomingNews(news);

  if (deduplicatedNews.length === 0) {
    info("🍉 No news items to process");
    return;
  }

  await safeWrite(
    db,
    async () => {
      const collection = db.get<News>("news");
      const incomingIds = deduplicatedNews.map(({ id }) => id);

      const existingRecords = await collection
        .query(Q.where("newsId", Q.oneOf(incomingIds)))
        .fetch();

      const existingById = new Map<string, News[]>();
      for (const record of existingRecords) {
        const recordsForId = existingById.get(record.newsId) ?? [];
        recordsForId.push(record);
        existingById.set(record.newsId, recordsForId);
      }

      const operations: Array<Promise<unknown>> = [];

      for (const { id, item } of deduplicatedNews) {
        const recordsForId = existingById.get(id) ?? [];
        const [recordToKeep, ...duplicateRecords] = recordsForId;

        if (recordToKeep) {
          operations.push(
            recordToKeep.update((model: Model) => {
              const newsModel = model as News;
              updateNewsModelFields(newsModel, item);
            })
          );
        } else {
          operations.push(
            collection.create((record: Model) => {
              const newsModel = record as News;
              newsModel.newsId = id;
              updateNewsModelFields(newsModel, item);
            })
          );
        }

        for (const duplicateRecord of duplicateRecords) {
          operations.push(duplicateRecord.markAsDeleted());
        }
      }

      await Promise.all(operations);
    },
    10000,
    `add_news_${deduplicatedNews.length}_upsert`
  );
}


export async function getNewsFromCache(): Promise<SharedNews[]> {
  try {
    const database = getDatabaseInstance();

    const news = await database
      .get<News>('news')
      .query()
      .fetch();

    return deduplicateNewsRecords(news)
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

function updateNewsModelFields(newsModel: News, item: SharedNews) {
  newsModel.title = item.title ?? newsModel.title;
  newsModel.createdAt = item.createdAt.getTime();
  newsModel.acknowledged = item.acknowledged;
  newsModel.attachments = JSON.stringify(item.attachments ?? []);
  newsModel.content = item.content ?? newsModel.content;
  newsModel.author = item.author ?? newsModel.author;
  newsModel.category = item.category ?? newsModel.category;
  newsModel.createdByAccount = item.createdByAccount ?? newsModel.createdByAccount;
  newsModel.question = item.question ?? newsModel.question;
}

function deduplicateIncomingNews(news: SharedNews[]): Array<{ id: string; item: SharedNews }> {
  const deduplicatedById = new Map<string, SharedNews>();

  for (const item of news) {
    deduplicatedById.set(getNewsCacheId(item), item);
  }

  return Array.from(deduplicatedById.entries()).map(([id, item]) => ({ id, item }));
}

function deduplicateNewsRecords(records: News[]): News[] {
  const deduplicatedById = new Map<string, News>();

  for (const record of records) {
    if (!deduplicatedById.has(record.newsId)) {
      deduplicatedById.set(record.newsId, record);
    }
  }

  return Array.from(deduplicatedById.values());
}

function getNewsCacheId(item: SharedNews): string {
  return generateId(item.author + item.title + item.createdByAccount);
}
