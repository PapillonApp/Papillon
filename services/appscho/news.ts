import { getNewsFeed, User, NewsFeed, INSTANCES } from "appscho";
import { News } from "@/services/shared/news";
import { AttachmentType } from "@/services/shared/attachment";

export async function fetchAppschoNews(_session: User, accountId: string, instanceId: string): Promise<News[]> {
  const newsItems = await getNewsFeed(instanceId) as NewsFeed[];
  
  return newsItems.map(item => {
    const attachments = [];
    
    if (item.picture) {
      attachments.push({
        type: AttachmentType.FILE,
        name: "Image",
        url: item.picture,
        createdByAccount: accountId,
      });
    }

    if (item.url) {
      attachments.push({
        type: AttachmentType.LINK,
        name: "Lien vers l'article",
        url: item.url,
        createdByAccount: accountId,
      });
    }
    return {
      id: item.url,
      title: item.title,
      createdAt: new Date(item.start.replace(" +0000", "").replace(" ", "T") + "Z"),
      acknowledged: false,
      attachments: attachments.filter(attachment => attachment.url),
      content: item.content,
      author: INSTANCES.find(inst => inst.id === instanceId)?.name ?? "Auteur inconnu",
      category: item.type,
      createdByAccount: accountId,
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}