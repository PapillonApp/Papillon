import {AppschoAccount} from "@/stores/account/types";
import { Information } from "../../shared/Information";
import { AttachmentType } from "@/services/shared/Attachment";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { getNewsFeed, NewsFeed} from "appscho";
import {parse} from "date-fns";

const parseInformation = (i: NewsFeed): Information => ({
  id: generateId(i),
  title: i.title,
  date: parse(i.start, "yyyy-MM-dd HH:mm:ss X", new Date()),
  picture: i.picture || undefined,
  acknowledged: false,
  attachments: [{"name": i.title,"type":"link" as AttachmentType, "url": i.url}],
  content: i.content,
  author: getType(i.type),
  category: getType(i.type),
  read: false,
  ref: i,
});

export const getNews = async (account: AppschoAccount): Promise<Information[]> => {
  if (!account.authentication) {
    throw new ErrorServiceUnauthenticated("Appscho");
  }

  const news = await getNewsFeed(account.authentication.instanceAppscho);
  return news.map(parseInformation);
};

const getType = (type: string): string => {
  const types: { [key: string]: string } = {
    event: "Évènements",
    news: "Actualités"
  };

  return types[type];
};

const generateId = (item: NewsFeed): string => {
  return btoa(`${item.content}|${item.type}`);
};