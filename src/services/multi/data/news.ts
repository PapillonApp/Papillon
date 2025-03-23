import { MultiAccount } from "@/stores/account/types";
import { Information } from "../../shared/Information";
import { AttachmentType } from "@/services/shared/Attachment";
import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { ActualitiesResponse } from "esup-multi.js";

const parseInformation = (i: ActualitiesResponse): Information => ({
  id: i.pubDate,
  title: i.title,
  date: new Date(i.pubDate),
  acknowledged: false,
  attachments: [{ "name": i.title,"type":"link" as AttachmentType, "url": i.link }],
  content: i.content,
  author: "Actualités",
  category: "Actualités",
  read: false,
  ref: i,
});

export const getNews = async (account: MultiAccount): Promise<Information[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("Multi");

  const news = await account.instance.getActualities();
  return news.map(parseInformation);
};
