import { Client } from "@blockshub/blocksdirecte";

import { warn } from "@/utils/logger/logger";

import { News } from "../shared/news";

export async function fetchEDNews(session: Client, accountId: string): Promise<News[]> {
  try {
    const news = (await session.timeline.getPublicTimeline()).postits
    return news.map(item => ({
      id: String(item.id),
      createdAt: new Date(item.dateCreation),
      createdByAccount: accountId,
      acknowledged: true,
      attachments: [],
      content: item.contenu,
      author: [item.auteur.prenom, item.auteur.nom].join(" "),
      category: "Actualités"
    }))
  } catch (error) {
    warn(String(error))
    return []
  }
}