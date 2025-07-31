import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { GradesStore } from "./types";

export const useGradesStore = create<GradesStore>()(
  persist(
    (set) => ({
      defaultPeriod: "",
      periods: [],

      lastUpdated: 0,
      averages: {},
      grades: {},

      reels: {},

      updatePeriods (periods, defaultPeriodName) {
        set({
          defaultPeriod: defaultPeriodName,
          periods,
        });
      },

      updateGradesAndAverages (periodName, grades, averages) {
        set((state) => {
          return {
            lastUpdated: Date.now(),

            grades: {
              ...state.grades,
              [periodName]: grades
            },

            averages: {
              ...state.averages,
              [periodName]: averages
            }
          };
        });
      },
    }),
    {
      name: "<default>-grades-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
