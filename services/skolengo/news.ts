import { Skolengo } from "skolengojs";
import { News } from "../shared/news";
import { AttachmentType } from "../shared/attachment";

export async function fetchSkolengoNews(session: Skolengo, accountId: string): Promise<News[]> {
	const news = await session.GetNews()
	return news.map(item => ({
		id: item.id,
		title: item.title,
		createdAt: item.publicationDateTime,
		acknowledged: true,
		content: item.content,
		author: item.author.name,
		category: "Actualités",
		attachments: [{
			type: AttachmentType.FILE,
			name: item.illustration.fileName ?? "",
			url: item.illustration.url,
			createdByAccount: accountId
		},
		{
			type: AttachmentType.LINK,
			name: item.linkedWebSiteUrl ?? "",
			url: item.linkedWebSiteUrl ?? "",
			createdByAccount: accountId
		}].filter(attachment => attachment.name && attachment.url),
		ref: item,
		createdByAccount: accountId
	}));
}