import { updateNewsInCache } from "@/services/news";
import { Information } from "@/services/shared/Information";
import { useCurrentAccount } from "@/stores/account";
import { useNewsStore } from "@/stores/news";
import { papillonNotify } from "../Notifications";
import uuid from "@/utils/uuid-v4";
import parse_news_resume from "@/utils/format/format_pronote_news";

// Function to compare the differences between two arrays of objects
const getDifferences = (currentNews: Information[], updatedNews: Information[]): Information[] => {
  // Indentify the differences
  const differences = updatedNews.filter((updatedItem) => {
    const currentItem = currentNews.find((item) => item.id === updatedItem.id);
    return !currentItem || JSON.stringify(currentItem) !== JSON.stringify(updatedItem);
  });

  return differences;
};

const fetchNews = async (): Promise<Information[]> => {
  // Account informations
  const account = useCurrentAccount((store) => store.account!);
  const notificationsTypesPermissions = account.personalization.notifications;

  // Informations
  const currentNews = await useNewsStore((store) => store.informations); // Get the news before the update
  await updateNewsInCache(account); // Update the news
  const updatedNews = await useNewsStore((store) => store.informations); // Get the news after the update

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

  return updatedNews;
};

export { fetchNews };
