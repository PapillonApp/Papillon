import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { Information } from "@/services/shared/Information";
import { SkolengoAccount } from "@/stores/account/types";
import { SchoolInfo } from "scolengo-api/types/models/School";
import { decodeSkoAttachment } from "./attachment";
import { htmlToText } from "html-to-text";
import { _skoUcFist, userToName } from "./utils";

const decodeNews = (n: SchoolInfo): Information => ({
  id: n.id,
  title: n.title,
  date: new Date(n.publicationDateTime),
  attachments: n.illustration ? [decodeSkoAttachment(n.illustration)] : [],
  content: htmlToText(n.content || ""),
  author: n.author?.person && userToName(n.author.person) || n?.author?.technicalUser?.label || "Inconnu",
  category: _skoUcFist(n.school?.name || n.level || "Autre"),
  // skolengo dont provide this information
  acknowledged: true,
  read: true,
  ref: undefined
});

export const getNews = async (account: SkolengoAccount): Promise<Information[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const news = await account.instance.getSchoolInfos();
  return news.map(decodeNews);
};
