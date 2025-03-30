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
        log(`updating homeworks for week ${epochWeekNumber}`, "homework:updateHomeworks");

        set((state) => {
          return {
            homeworks: {
              ...state.homeworks,
              [epochWeekNumber]: homeworks
            }
          };
        });

        log(`updated homeworks for week ${epochWeekNumber}`, "homework:updateHomeworks");
      },

      addHomework: (epochWeekNumber, homework) => {
        set((state) => ({
          homeworks: {
            ...state.homeworks,
            [epochWeekNumber]: [
              ...(state.homeworks[epochWeekNumber] || []),
              homework,
            ],
          },
        }));
      },

      updateHomework: (epochWeekNumber, homeworkID, updatedHomework) => {
        set((state) => ({
          homeworks: {
            ...state.homeworks,
            [epochWeekNumber]: state.homeworks[epochWeekNumber]?.map(
              (homework) =>
                homework.id === homeworkID ? updatedHomework : homework
            ),
          },
        }));
      },

      removeHomework: (epochWeekNumber, homeworkID) => {
        set((state) => ({
          homeworks: {
            ...state.homeworks,
            [epochWeekNumber]: state.homeworks[epochWeekNumber]?.filter(
              (homework) => homework.id !== homeworkID
            ),
          },
        }));
      },

      existsHomework: (epochWeekNumber, homeworkID) => {
        const state = useHomeworkStore.getState() as HomeworkStore;
        return state.homeworks[epochWeekNumber]?.some(
          (homework) => homework.id === homeworkID
        );
      },
    }),
    {
      name: "<default>-homework-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
