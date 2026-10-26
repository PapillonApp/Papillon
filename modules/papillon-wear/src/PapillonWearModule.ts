import { EventSubscription, requireOptionalNativeModule } from "expo";

export interface WearCourseItem {
  id: string;
  subject: string;
  emoji: string;
  color: string;
  room: string | null;
  teacher: string | null;
  from: number;
  to: number;
  statusLabel: string | null;
  isCanceled: boolean;
}

export interface WearGradeItem {
  id: string;
  subject: string;
  emoji: string;
  color: string;
  description: string;
  score: string;
  outOf: string;
  coefficient: number;
  givenAt: number;
  isBonus: boolean;
}

export interface WearSubjectAverage {
  id: string;
  subject: string;
  emoji: string;
  color: string;
  studentAverage: string;
  classAverage: string | null;
  outOf: string;
}

export interface WearGradesSummary {
  periodName: string;
  overallAverage: string | null;
  classAverage: string | null;
  scale: string;
  recentGrades: WearGradeItem[];
  subjects: WearSubjectAverage[];
}

export interface WearHomeworkItem {
  id: string;
  subject: string;
  emoji: string;
  color: string;
  content: string;
  dueDate: number;
  isDone: boolean;
  isEvaluation: boolean;
}

export interface WearCanteenCard {
  id: string;
  serviceName: string;
  label: string;
  amountFormatted: string;
  lunchRemaining: number | null;
  qrData: string | null;
  codeType: "QR" | "CODE39";
  accentColor: string;
}

export interface WearSyncPayload {
  version: number;
  updatedAt: number;
  accountName: string;
  className: string | null;
  schoolName: string | null;
  accentColor: string;
  timetable: WearCourseItem[];
  grades: WearGradesSummary;
  homework: WearHomeworkItem[];
  cards: WearCanteenCard[];
}

export interface WearNode {
  id: string;
  displayName: string;
  isNearby: boolean;
}

export interface WatchToggleHomeworkEvent {
  homeworkId: string;
  isDone: boolean;
}

interface PapillonWearNativeModule {
  isSupported: boolean;
  syncWatchData: (payloadJson: string) => Promise<boolean>;
  getConnectedWatches: () => Promise<WearNode[]>;
  pingWatches: () => Promise<number>;
  addListener?: (
    eventName: string,
    listener: (event: Record<string, unknown>) => void
  ) => EventSubscription;
}

const NativeModule =
  requireOptionalNativeModule<PapillonWearNativeModule>("PapillonWear");

/** Whether the native Wear OS bridge is available on this device (Android). */
export const wearIsSupported = NativeModule?.isSupported ?? false;

/**
 * Publishes the latest timetable, grades, homework and canteen cards to all
 * paired Wear OS watches via the Wearable Data Layer API.
 */
export async function syncWatchData(
  payload: WearSyncPayload
): Promise<boolean> {
  if (!NativeModule) {
    return false;
  }
  return (await NativeModule.syncWatchData(JSON.stringify(payload))) ?? false;
}

/**
 * Lists currently connected Wear OS watches paired with the handheld device.
 */
export async function getConnectedWatches(): Promise<WearNode[]> {
  if (!NativeModule) {
    return [];
  }
  return (await NativeModule.getConnectedWatches()) ?? [];
}

/**
 * Sends a quick ping message to connected Wear OS watches and returns how many
 * nodes acknowledged the message.
 */
export async function pingWatches(): Promise<number> {
  if (!NativeModule) {
    return 0;
  }
  return (await NativeModule.pingWatches()) ?? 0;
}

/**
 * Subscribes to live sync requests initiated from the Wear OS watch app.
 */
export function addWatchSyncRequestListener(
  listener: () => void
): EventSubscription {
  if (!NativeModule?.addListener) {
    return { remove: () => undefined };
  }
  return NativeModule.addListener("onWatchSyncRequested", () => {
    listener();
  });
}

/**
 * Subscribes to homework completion toggles sent from the Wear OS watch app.
 */
export function addWatchToggleHomeworkListener(
  listener: (event: WatchToggleHomeworkEvent) => void
): EventSubscription {
  if (!NativeModule?.addListener) {
    return { remove: () => undefined };
  }
  return NativeModule.addListener("onWatchToggleHomework", rawEvent => {
    const homeworkId =
      typeof rawEvent.homeworkId === "string" ? rawEvent.homeworkId : "";
    const isDone = Boolean(rawEvent.isDone);
    if (homeworkId) {
      listener({ homeworkId, isDone });
    }
  });
}
