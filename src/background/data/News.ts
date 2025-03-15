import { updateNewsState, getNews } from "../utils/news";
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import parse_news_resume from "@/utils/format/format_pronote_news";
import { Information } from "@/services/shared/Information";

const getDifferences = (
  currentNews: Information[],
  updatedNews: Information[]
): Information[] => {
  return updatedNews.filter(
    (updatedItem) =>
      !currentNews.some(
        (item) =>
          item.author === updatedItem.author &&
          item.content === updatedItem.content
      )
  );
};

const removeHtmlTags = (content: string): string => {
  return content
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing spaces
};

const fetchNews = async (): Promise<Information[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const currentNews = getNews();
  if (!notificationsTypesPermissions?.news) {
    return currentNews;
  }

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        title: account.name,
        body: "Récupération des dernières actualités...",
        android: {
          progress: {
            max: 100,
            current: (100 / 6) * 1,
            indeterminate: false,
          },
        },
      },
      "Status"
    );
  }

  await updateNewsState(account);
  const updatedNews = getNews();

  const differences = getDifferences(currentNews, updatedNews);

  switch (differences.length) {
    case 0:
      break;
    case 1:
      await papillonNotify(
        {
          id: `${account.name}-news`,
          title: `[${account.name}] Nouvelle actualité par ${differences[0].author}`,
          subtitle: differences[0].title,
          body:
              differences[0].content && !differences[0].content.includes("<img")
                ? `${removeHtmlTags(parse_news_resume(differences[0].content)).slice(
                  0,
                  100
                )}...`
                : "Aucun résumé disponible.",
          data: {
            accountID: account.localID,
            page: "News",
          }
        },
        "News"
      );
      break;
    default:
      const newsCounts: Record<string, number> = {};

      differences.forEach((the_news) => {
        newsCounts[the_news.author] = (newsCounts[the_news.author] || 0) + 1;
      });

      const newsPreview = Object.entries(newsCounts)
        .map(([subject, count]) =>
          count > 1 ? `${count}x ${subject}` : subject
        )
        .join(", ");

      await papillonNotify(
        {
          id: `${account.name}-news`,
          title: `[${account.name}] Nouvelles actualités`,
          body: `
            ${differences.length} nouvelles actualités par :<br />
            ${newsPreview}
            `,
          data: {
            accountID: account.localID,
            page: "News",
          }
        },
        "News"
      );
      break;
  }
  return updatedNews;
};

export { fetchNews };
