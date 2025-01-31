import { useNewsStore } from "@/stores/news";
import { updateNewsInCache } from "@/services/news";
import { PrimaryAccount } from "@/stores/account/types";

export const getNews = () => {
  return useNewsStore.getState().informations;
};

export const updateNewsState = async (account: PrimaryAccount) => {
  await updateNewsInCache(account);
};
