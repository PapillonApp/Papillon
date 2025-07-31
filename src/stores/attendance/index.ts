import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import type { AttendanceStore } from "./types";

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set) => ({
      defaultPeriod: "",
      periods: [],

      attendances: {},

      updatePeriods (periods, defaultPeriodName) {
        set({
          defaultPeriod: defaultPeriodName,
          periods,
        });
      },

      updateAttendance (periodName, attendance) {
        set((state) => {
          return {
            attendances: {
              ...state.attendances,
              [periodName]: attendance
            }
          };
        });
      },
    }),
    {
      name: "<default>-attendance-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
