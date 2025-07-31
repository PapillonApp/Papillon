import type { EcoleDirecteAccount } from "@/stores/account/types";
import type { Information } from "../shared/Information";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import ecoledirecte from "pawdirecte";

const parseInformation = (i: ecoledirecte.HomepageTimelineItem): Information => ({
  id: i.id,
  title: "",
  date: i.creationDate,
  acknowledged: false,
  attachments: [],
  content: i.content,
  author: i.authorName,
  category: "",
  read: false,
  ref: undefined
});

export const getNews = async (account: EcoleDirecteAccount): Promise<Information[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const news = await ecoledirecte.studentHomepageTimeline(account.authentication.session, account.authentication.account);
  return news.map(parseInformation);
};
