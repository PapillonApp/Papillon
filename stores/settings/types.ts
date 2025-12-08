import { Colors } from "@/utils/colors";

export interface SettingsStorage {
  personalization: Personalization;
  mutateProperty: <T extends keyof SettingsState>(
    section: T,
    updates: Partial<SettingsState[T]>
  ) => void;
}

export interface SettingsState {
  personalization: Personalization;
}

export interface Wallpaper {
  id: string;
  url: string;
  thumbnail?: string;
  credit?: string;
}

export interface Personalization {
  colorSelected?: Colors;
  theme?: "light" | "dark" | "auto";
  magicEnabled?: boolean;
  hideNameOnHomeScreen?: boolean;
  showAlertAtLogin?: boolean;
  showDevMode?: boolean;
  magicModelURL?: string;
  language?: string | null;
  wallpaper?: Wallpaper;
}
