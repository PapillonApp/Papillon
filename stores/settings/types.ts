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

export interface Path {
  directory: string;
  name: string;
}

export interface Wallpaper {
  id: string;
  url?: string;
  path?: Path;
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
  disabledTabs?: string[];
}
