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

export interface Personalization {
  array: any;
  profilePictureB64?: string;
  colorSelected?: string;
  magicEnabled?: boolean;
  hideNameOnHomeScreen?: boolean;
}
