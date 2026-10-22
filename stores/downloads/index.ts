import { Directory, DownloadTask, File, FileMode, Paths } from "expo-file-system";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Attachment, AttachmentType } from "@/services/shared/attachment";
import { generateId } from "@/utils/generateId";
import { cleanSubjectName } from "@/utils/subjects/utils";
import uuid from "@/utils/uuid/uuid";

import { createMMKVStorage } from "../global";

export interface DownloadedFile {
  /** Persistent ID, see getAttachmentId. */
  id: string;
  /** URL it was last fetched from. Services rotate these, never use it to look a file up. */
  url: string;
  name: string;
  /** File name inside the attachments directory. */
  fileName: string;
  size: number;
  downloadedAt: number;
  /** Where the file was found, used to sort downloads into folders. */
  source?: "homework" | "news";
  /** Homework subject, as given by the school service. */
  subject?: string;
  /** Route ID of the homework or news the file belongs to. */
  parentId?: string;
}

export type DownloadOrigin = Pick<DownloadedFile, "source" | "subject" | "parentId">;

/**
 * Stable ID for an attachment. Service URLs carry session tokens and change on
 * every login, so files are identified by where they live (the homework or
 * news, whose route ID is already a hash of stable fields) plus their name.
 */
export const getAttachmentId = (attachment: Pick<Attachment, "name" | "url">, origin: DownloadOrigin) =>
  generateId(`${origin.source ?? ""}:${origin.parentId ?? ""}:${attachment.name || attachment.url}`);

/** Folder a download lives in: one per homework subject, one for news, one for the rest. */
export const getFolderKey = (file: DownloadOrigin) =>
  file.source === "homework" && file.subject ? `subject:${cleanSubjectName(file.subject)}` : file.source === "news" ? "news" : "other";

const DIRECTORY = new Directory(Paths.document, "attachments");

interface DownloadsStorage {
  /** Downloaded files, keyed by persistent ID. */
  files: Record<string, DownloadedFile>;
  /** Saves attachments as soon as their task or news is opened. */
  autoDownload: boolean;
  /** Live downloads: 0..1, or -1 when the server gives no size. Not persisted. */
  progress: Record<string, number>;
  /** IDs whose last download failed. Not persisted. */
  failed: Record<string, true>;

  setAutoDownload: (value: boolean) => void;
}

export const useDownloadsStore = create<DownloadsStorage>()(
  persist(
    set => ({
      files: {},
      autoDownload: false,
      progress: {},
      failed: {},
      setAutoDownload: autoDownload => set({ autoDownload }),
    }),
    {
      name: "downloads-storage",
      storage: createMMKVStorage("downloads"),
      version: 1,
      partialize: state => ({ files: state.files, autoDownload: state.autoDownload }) as DownloadsStorage,
    }
  )
);

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "heic"];
const active = new Map<string, { task: DownloadTask; promise: Promise<DownloadedFile | null> }>();

export const getExtension = ({ name, url }: Pick<Attachment, "name" | "url">) => {
  const fromName = name.includes(".") ? name.split(".").pop() : undefined;
  return (fromName ?? url.split(/[?#]/)[0].split("/").pop()?.split(".").slice(1).pop() ?? "").toLowerCase();
};

export const getAttachmentKind = (attachment: Pick<Attachment, "name" | "url" | "type">): "pdf" | "image" | null => {
  if (attachment.type === AttachmentType.LINK) return null;
  const ext = getExtension(attachment);
  if (ext === "pdf") return "pdf";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  return null;
};

export const getDownloadedFile = (entry: DownloadedFile) => new File(DIRECTORY, entry.fileName);

const patch = (key: "progress" | "failed", id: string, value: number | true | undefined) =>
  useDownloadsStore.setState(state => {
    const next = { ...state[key] } as Record<string, number | true>;
    if (value === undefined) delete next[id];
    else next[id] = value;
    return { [key]: next };
  });

export function downloadAttachment(attachment: Attachment, origin: DownloadOrigin): Promise<DownloadedFile | null> {
  const { url } = attachment;
  const id = getAttachmentId(attachment, origin);
  const existing = useDownloadsStore.getState().files[id];
  if (existing && getDownloadedFile(existing).exists) return Promise.resolve(existing);
  const running = active.get(id);
  if (running) return running.promise;

  if (!DIRECTORY.exists) DIRECTORY.create({ intermediates: true });
  const ext = getExtension(attachment);
  const fileName = `${uuid()}${ext ? `.${ext}` : ""}`;
  const destination = new File(DIRECTORY, fileName);

  patch("failed", id, undefined);
  patch("progress", id, 0);

  let lastReported = 0;
  const task = new DownloadTask(url, destination, {
    sessionType: "foreground",
    onProgress: ({ bytesWritten, totalBytes }) => {
      const value = totalBytes > 0 ? bytesWritten / totalBytes : -1;
      // Progress fires per chunk; only touch the store on visible changes.
      if (value === -1 ? lastReported !== -1 : value - lastReported >= 0.01) {
        lastReported = value;
        patch("progress", id, value);
      }
    },
  });

  const promise = (async () => {
    try {
      const file = await task.downloadAsync();
      if (!file) return null;

      // Expired school sessions answer with an HTML error page instead of the file.
      const handle = file.open(FileMode.ReadOnly);
      const firstByte = handle.readBytesSync(1)[0];
      handle.close();
      if (!file.size || firstByte === 0x3c /* "<" */) throw new Error("Invalid file");

      const entry: DownloadedFile = {
        id,
        url,
        name: attachment.name || fileName,
        fileName,
        size: file.size,
        downloadedAt: Date.now(),
        ...origin,
      };
      useDownloadsStore.setState(state => ({ files: { ...state.files, [id]: entry } }));
      return entry;
    } catch (error) {
      if (destination.exists) destination.delete();
      if (task.state !== "cancelled") {
        patch("failed", id, true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      throw error;
    } finally {
      active.delete(id);
      patch("progress", id, undefined);
    }
  })();

  active.set(id, { task, promise });
  return promise;
}

export const cancelDownload = (id: string) => active.get(id)?.task.cancel();

export async function openDownloadedFile(entry: DownloadedFile) {
  const file = getDownloadedFile(entry);
  if (!file.exists) {
    deleteDownload(entry.id);
    return false;
  }

  const kind = getAttachmentKind({ ...entry, type: AttachmentType.FILE });
  // iOS: Quick Look is the in-app viewer (zoom, pages, share, markup).
  // Android has no built-in PDF renderer, so PDFs go to the system viewer.
  if (Platform.OS === "android" && kind === "image") {
    router.push({ pathname: "/(modals)/attachment", params: { id: entry.id } });
  } else {
    await file.preview({ title: entry.name, mimeType: kind === "pdf" ? "application/pdf" : undefined });
  }
  return true;
}

/** Opens an attachment, downloading it first when it can be kept offline. */
export async function openAttachment(attachment: Attachment, origin: DownloadOrigin, retried = false): Promise<unknown> {
  if (!getAttachmentKind(attachment)) {
    return WebBrowser.openBrowserAsync(attachment.url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    });
  }

  const wasDownloaded = !!useDownloadsStore.getState().files[getAttachmentId(attachment, origin)];
  const entry = await downloadAttachment(attachment, origin).catch(() => null);
  if (!entry) return;
  if (!wasDownloaded) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  // The file can vanish under us (OS cleanup, restore from backup): fetch it again once.
  if (!(await openDownloadedFile(entry)) && !retried) return openAttachment(attachment, origin, true);
}

/** Called when a task or news is opened; downloads its files if the user opted in. */
export function prefetchAttachments(attachments: Attachment[], origin: DownloadOrigin) {
  if (!useDownloadsStore.getState().autoDownload) return;
  for (const attachment of attachments) {
    if (getAttachmentKind(attachment)) downloadAttachment(attachment, origin).catch(() => { });
  }
}

export function deleteDownload(id: string) {
  const entry = useDownloadsStore.getState().files[id];
  if (entry) {
    const file = getDownloadedFile(entry);
    if (file.exists) file.delete();
  }
  useDownloadsStore.setState(state => {
    const files = { ...state.files };
    delete files[id];
    return { files };
  });
}

export function deleteFolder(key: string) {
  for (const file of Object.values(useDownloadsStore.getState().files)) {
    if (getFolderKey(file) === key) deleteDownload(file.id);
  }
}

export function clearDownloads() {
  for (const { task } of active.values()) task.cancel();
  if (DIRECTORY.exists) DIRECTORY.delete();
  useDownloadsStore.setState({ files: {} });
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};
