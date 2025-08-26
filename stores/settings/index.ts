import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createMMKVStorage } from "../global";
import { SettingsStorage, SettingsState, Personalization } from "./types";

const defaultPersonalization: Personalization = {
  array: [],
  profilePictureB64: undefined,
  colorSelected: "#29947A",
  magicEnabled: false,
  hideNameOnHomeScreen: false,
};

export const useSettingsStore = create<SettingsStorage>()(
  persist(
    (set, get) => ({
      personalization: defaultPersonalization,

      mutateProperty: <T extends keyof SettingsState>(
        section: T,
        updates: Partial<SettingsState[T]>
      ) => {
        set(state => ({
          ...state,
          [section]: {
            ...state[section],
            ...updates,
          },
        }));
      },
    }),
    {
      name: "settings-storage",
      storage: createMMKVStorage("settings"),
      version: 1,
    }
  )
);
