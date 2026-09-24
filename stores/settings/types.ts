import { Colors } from "@/utils/colors";
import { AppFontFamily } from "@/utils/theme/fonts";

export interface SettingsStorage {
  personalization: Personalization;
  reset: () => void;
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
  fontFamily?: AppFontFamily;
  gradesDisplayScale?: "20" | "10" | "5" | "percentage";
  colorSelected?: Colors;
  theme?: "light" | "dark" | "auto";
  useMaterialYou?: boolean;
  iOSBottomAccessoryEnabled?: boolean;
  showTabBarLabels?: boolean;
  magicEnabled?: boolean;
  hideNameOnHomeScreen?: boolean;
  showAlertAtLogin?: boolean;
  showDevMode?: boolean;
  mockDataEnabled?: boolean;
  magicModelURL?: string;
  language?: string | null;
  wallpaper?: Wallpaper;
  disabledTabs?: string[];
  disabledTabsByAccount?: Record<string, string[]>;
  gradesSortMethod?: string;
  gradesPeriodName?: string;
  installedVersion?: string;
  releaseNotesSeenForVersion?: string;
  welcomeModalSeen?: boolean;
  desktopTabBarPosition?: "bottom" | "top" | "left" | "right";
  customHomeworkSubjects?: string[];
  customHomeworks?: CustomHomeworkStorage[];
  notificationPreferences?: NotificationPreferences;
  notificationSeenGradeIds?: string[];
  notificationSeenNewsIds?: string[];
  pendingNotificationSchedules?: PendingSystemNotification[];
}

export interface CustomHomeworkStorage {
  id: string;
  subject: string;
  content: string;
  dueDate: string;
  isDone: boolean;
  createdByAccount: string;
  reminderAt?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  courses: boolean;
  homework: boolean;
  grades: boolean;
  news: boolean;
  dailyTime: string;
}

export interface PendingSystemNotification {
  id: string;
  category: "courses" | "homework" | "grades" | "news";
  title: string;
  body: string;
  at: string;
}
