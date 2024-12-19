import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import {EvaluationStore} from "@/stores/evaluation/types";

export const useEvaluationStore = create<EvaluationStore>()(
  persist(
    (set) => ({
      defaultPeriod: "",
      periods: [],

      lastUpdated: 0,
      evaluations: {},

      updatePeriods (periods, defaultPeriodName) {
        set({
          defaultPeriod: defaultPeriodName,
          periods,
        });
      },

      updateEvaluations (periodName, evaluation) {
        set((state) => {
          return {
            lastUpdated: Date.now(),
            evaluations: {
              ...state.evaluations,
              [periodName]: evaluation
            },
          };
        });
      }
    }),
    {
      name: "<default>-evaluations-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
