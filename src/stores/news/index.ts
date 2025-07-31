import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { NewsStore } from "@/stores/news/types";
import { log } from "@/utils/logger/logger";

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      informations: [],
      updateInformations: (informations) => {
        log("updating store...", "news:updateInformations");
        set(() => ({ informations }));
        log("updated store.", "news:updateInformations");
      }
    }),
    {
      name: "<default>-news-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
