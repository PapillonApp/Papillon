import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Colors } from "@/utils/colors";
import { MAGIC_URL } from "@/utils/endpoints";

import { createMMKVStorage } from "../global";
import { Personalization,SettingsState, SettingsStorage } from "./types";

const defaultPersonalization: Personalization = {
  colorSelected: Colors.PINK,
  theme: "auto",
  magicEnabled: true,
  hideNameOnHomeScreen: false,
  showAlertAtLogin: false,
  showDevMode: false,
  magicModelURL: MAGIC_URL,
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
