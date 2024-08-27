import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

export const useFlagsStore = create<{
  set (flag: string): void;
  remove (flag: string): void;
  defined (flag: string): boolean;
  flags: Array<string>;
}>()(
  persist(
    (set) => ({
      flags: [],

      set (flag) {
        set((state) => ({
          // make sure we don't add the same flag twice
          flags: [...new Set([...state.flags, flag])]
        }));
      },

      remove (flag) {
        set((state) => ({
          flags: state.flags.filter((f) => f !== flag)
        }));
      },

      defined (flag) {
        return this.flags.includes(flag);
      }
    }),
    {
      name: "flags-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
