import { updateNewsInCache } from "@/services/news";
import { Information } from "@/services/shared/Information";
import { useCurrentAccount } from "@/stores/account";
import { useNewsStore } from "@/stores/news";
import { papillonNotify } from "../Notifications";
import uuid from "@/utils/uuid-v4";
import parse_news_resume from "@/utils/format/format_pronote_news";
import { PrimaryAccount } from "@/stores/account/types";

// Function to compare the differences between two arrays of objects and check if the news are readed
const getDifferences = (oldArray: Information[], newArray: Information[]): Information[] => {
  const differences = newArray.filter((newElement) => {
    const oldElement = oldArray.find((element) => element.id === newElement.id);
    if (!oldElement) return true;
    return newElement.read !== oldElement.read;
  });
  return differences;
};

/**
 * Fetch the news for the account
 * @param account The account to fetch the news
 * @returns The updated news
 */
const fetchNews = async (account: PrimaryAccount): Promise<Information[]> => {
  // Account informations
  const notificationsTypesPermissions = account.personalization.notifications;

  // Informations
  const currentNews = await useNewsStore.getState().informations; // Get the news before the update
  await updateNewsInCache(account); // Update the news
  const updatedNews = await useNewsStore.getState().informations; // Get the news after the update

  const differences = getDifferences(currentNews, updatedNews);

  // Notify the user if there are new informations and if the notifications are enabled
  if (notificationsTypesPermissions?.enabled && notificationsTypesPermissions?.news) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        papillonNotify({
          id: `${account.localID}-${differences[0].id}-news`,
          title: `[${account.name}] Nouvelle information`,
          subtitle: differences[0].title,
          body: differences[0].content ? parse_news_resume(differences[0].content) : "Aucun resumé disponible.",
          ios: {
            categoryId: account.localID,
          }
        });
        break;
      default:
        papillonNotify({
          id: `${account.localID}-${uuid()}-news`,
          title: `[${account.name}] Nouvelles informations`,
          body: `Vous avez ${differences.length} nouvelles informations.`,
          ios: {
            categoryId: account.localID,
          }
        });
        break;
    }
  }

  return updatedNews.map((news) => {
    return {
      localID: account.localID,
      ...news,
      content: news.content ? parse_news_resume(news.content) : ""
    };
  });
};

export { fetchNews };
