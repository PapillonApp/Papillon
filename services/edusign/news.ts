import { LinksignClient } from "@studentsphere/linksign";
import { News } from "@/services/shared/news";
import { AttachmentType } from "@/services/shared/attachment";
import { error } from "@/utils/logger/logger";

export async function fetchEdusignNews(
  client: LinksignClient,
  accountId: string
): Promise<News[]> {
  try {
    let profile: any;
    try {
      profile = await client.getProfile();
    } catch (e: any) {
      console.error("Edusign News: getProfile failed:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
      throw e;
    }

    const schoolId = profile.SCHOOL_ID || profile.SCHOOL?.ID;
    console.log("Edusign News: schoolId", schoolId);

    if (!schoolId) {
      console.warn("Edusign News: No schoolId found in profile", profile);
      return [];
    }

    let channels: any;
    try {
      channels = await client.getPrivateNewsFeedChannels(schoolId);
    } catch (e: any) {
      console.error("Edusign News: getPrivateNewsFeedChannels failed:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
      throw e;
    }

    console.log("Edusign News: fetched channels", channels?.length);
    if (!channels || channels.length === 0) {
      return [];
    }

    let postsResponse: any;
    try {
      postsResponse = await client.getPrivateNewsFeedPosts(schoolId, {
        channels: channels.map((c: any) => c.id)
      });
    } catch (e: any) {
      console.error("Edusign News: getPrivateNewsFeedPosts failed:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
      throw e;
    }

    console.log("Edusign News: fetched posts", postsResponse?.data?.length);
    const posts = postsResponse.data;

    const result: News[] = posts.map((post: any) => {
      const channel = channels.find((c: any) => c.id === post.channelId);

      let contentString = "";
      if (typeof post.content === 'string') {
        contentString = post.content;
      } else if (post.content) {
        contentString = post.content['fr'] || post.content['en'] || post.content['es'] || JSON.stringify(post.content) || '';
      }

      return {
        id: post.id,
        title: post.title,
        createdAt: new Date(post.createdAt),
        acknowledged: true,
        attachments: post.imageCoverUrl ? [{
          type: AttachmentType.LINK,
          name: "Cover",
          url: post.imageCoverUrl,
          createdByAccount: accountId
        }] : [],
        content: contentString,
        author: channel?.title || "Edusign",
        category: channel?.title || "Actualités",
        ref: post as any,
        createdByAccount: accountId
      };
    });

    return result;
  } catch (err) {
    console.error("Edusign News API error:", err);
    error("Failed to fetch Edusign news", "Edusign.fetchEdusignNews");
    throw err;
  }
}
