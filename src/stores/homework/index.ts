import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { HomeworkStore } from "@/stores/homework/types";
import { log } from "@/utils/logger/logger";

export const useHomeworkStore = create<HomeworkStore>()(
  persist(
    (set) => ({
      homeworks: {},
      updateHomeworks: (epochWeekNumber, homeworks) => {
        log(`Updating homeworks for week ${epochWeekNumber}`, "homework:updateHomeworks");

        set((state) => {
          return {
            homeworks: {
              ...state.homeworks,
              [epochWeekNumber]: homeworks
            }
          };
        });

        log(`Updated homeworks for week ${epochWeekNumber}`, "homework:updateHomeworks");
      }
    }),
    {
      name: "<default>-homework-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
