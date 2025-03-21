import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { TimetableStore } from "@/stores/timetable/types";
import { log } from "@/utils/logger/logger";

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set) => ({
      timetables: {},
      updateClasses: (weekNumber, classes) => {
        log(`Updating classes for week ${weekNumber}`, "timetable:updateClasses");

        set((state) => {
          return {
            timetables: {
              ...state.timetables,
              [weekNumber]: classes
            }
          };
        });

        log(`Updated classes for week ${weekNumber}`, "timetable:updateClasses");
      },
      injectClasses: (data: any) => {
        log("Replacing classes", "timetable:replaceClasses");

        set((state) => {
          return {
            timetables: data,
          };
        });

        log(`Replaced classes for week ${data.weekNumber}`, "timetable:replaceClasses");
      },
      removeClasses: (weekNumber) => {
        log(`Removing classes for week ${weekNumber}`, "timetable:removeClasses");

        set((state) => {
          const timetables = { ...state.timetables };
          delete timetables[weekNumber];
          return {
            timetables
          };
        });

        log(`Removed classes for week ${weekNumber}`, "timetable:removeClasses");
      },
      removeClassesFromSource: (source) => {
        log(`Removing classes from source ${source}`, "timetable:removeClassesFromSource");

        set((state) => {
          const timetables = { ...state.timetables };
          for (const weekNumber in timetables) {
            timetables[weekNumber] = timetables[weekNumber].filter((c) => c.source !== source);
          }
          return {
            timetables
          };
        });

        log(`Removed classes from source ${source}`, "timetable:removeClassesFromSource");
      }
    }),
    {
      name: "<default>-timetable-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
