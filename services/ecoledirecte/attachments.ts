import { Client } from "@blockshub/blocksdirecte";
import { Directory, File, Paths } from "expo-file-system";
import { Linking, Platform } from "react-native";

import { getManager } from "@/services/shared";
import { Attachment, AttachmentMetadata, AttachmentType } from "@/services/shared/attachment";
import { generateId } from "@/utils/generateId";

const ED_ATTACHMENT_PROVIDER = "ecoledirecte";
const ED_ATTACHMENT_DEFAULT_FILE_TYPE = "CLOUD";
const ED_ATTACHMENT_CACHE_VERSION = "v4";
const ED_ATTACHMENTS_DIRECTORY = new Directory(Paths.cache, "attachments", "ecoledirecte");
const ANDROID_GRANT_READ_URI_PERMISSION = 1;
const ANDROID_ATTACHMENT_NATIVE_MODULE_REBUILD_ERROR = "Android attachment opening requires rebuilding the app after adding expo-intent-launcher.";

interface EDCloudFileLike {
  id: number | string;
  libelle?: string;
  type?: string;
}

interface EDBinaryResponse {
  data: ArrayBuffer;
  contentType?: string;
  contentDisposition?: string;
  fileName?: string;
}

type EDBinaryDownloader = Client["downloader"] & {
  getDownloadBinary?: (
    fileId: string | number,
    fileType: string,
    bodyParams?: AttachmentMetadata["downloadParams"]
  ) => Promise<EDBinaryResponse>;
};

type IntentLauncherModule = {
  startActivityAsync: (
    activityAction: string,
    params?: {
      data?: string;
      flags?: number;
      type?: string;
    }
  ) => Promise<unknown>;
};

let intentLauncherModulePromise: Promise<IntentLauncherModule | null> | null = null;

export function createEDAttachment(
  session: Client,
  accountId: string,
  reference: string | null | undefined,
  role: NonNullable<AttachmentMetadata["role"]>,
  fallbackName?: string,
  options?: {
    fileType?: string;
    downloadParams?: AttachmentMetadata["downloadParams"];
  }
): Attachment | undefined {
  const normalizedReference = normalizeReference(reference);
  if (!normalizedReference) {
    return undefined;
  }

  const fileType = options?.fileType ?? ED_ATTACHMENT_DEFAULT_FILE_TYPE;
  const downloadParams = options?.downloadParams;

  return {
    type: AttachmentType.FILE,
    name: getAttachmentName(normalizedReference, fallbackName),
    url: session.downloader.getDownloadURL(normalizedReference, fileType),
    metadata: {
      provider: ED_ATTACHMENT_PROVIDER,
      role,
      reference: normalizedReference,
      fileType,
      downloadParams,
    },
    createdByAccount: accountId,
  };
}

export function createEDCloudFileAttachment(
  session: Client,
  accountId: string,
  file: EDCloudFileLike | null | undefined,
  role: NonNullable<AttachmentMetadata["role"]>
): Attachment | undefined {
  if (!file) {
    return undefined;
  }

  return createEDAttachment(session, accountId, String(file.id), role, file.libelle, {
    fileType: normalizeReference(file.type) || ED_ATTACHMENT_DEFAULT_FILE_TYPE,
  });
}

export function isEDAttachment(attachment?: Attachment): boolean {
  return attachment?.metadata?.provider === ED_ATTACHMENT_PROVIDER;
}

export async function openEDAttachment(attachment: Attachment): Promise<void> {
  const session = getEDSessionForAccount(attachment.createdByAccount);
  const reference = attachment.metadata?.reference ?? getReferenceFromUrl(attachment.url);
  const fileType = attachment.metadata?.fileType ?? ED_ATTACHMENT_DEFAULT_FILE_TYPE;
  const downloadParams = attachment.metadata?.downloadParams;

  if (!session || !reference) {
    throw new Error("Missing EcoleDirecte attachment credentials");
  }

  if (!ED_ATTACHMENTS_DIRECTORY.exists) {
    ED_ATTACHMENTS_DIRECTORY.create({ idempotent: true, intermediates: true });
  }

  let file = getExistingCachedEDAttachmentFile(reference)
    ?? new File(ED_ATTACHMENTS_DIRECTORY, getCachedFileName(reference, attachment.name));
  if (await shouldDownloadEDAttachmentFile(file, attachment.name)) {
    const downloader = session.downloader as EDBinaryDownloader;
    if (typeof downloader.getDownloadBinary !== "function") {
      throw new Error("EcoleDirecte attachment download requires the latest BlocksDirecte patch.");
    }

    const response = await downloader.getDownloadBinary(reference, fileType, downloadParams);
    const resolvedName = getResolvedAttachmentName(
      attachment.name,
      response.fileName,
      response.contentType
    );
    const downloadedFile = new File(
      ED_ATTACHMENTS_DIRECTORY,
      getCachedFileName(reference, resolvedName, response.contentType)
    );
    await writeEDAttachmentFile(downloadedFile, response);
    file = downloadedFile;
  }

  if (Platform.OS === "android") {
    const mimeType = getMimeType(file);
    const intentLauncher = await getIntentLauncherModule();
    if (!intentLauncher) {
      throw new Error(ANDROID_ATTACHMENT_NATIVE_MODULE_REBUILD_ERROR);
    }

    await intentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: file.contentUri,
      flags: ANDROID_GRANT_READ_URI_PERMISSION,
      type: mimeType,
    });
    return;
  }

  await Linking.openURL(file.uri);
}

async function writeEDAttachmentFile(
  file: File,
  response: EDBinaryResponse
): Promise<void> {
  const contentType = response.contentType?.toLowerCase() ?? "";
  const bytes = new Uint8Array(response.data);
  if (contentType.includes("application/json")) {
    const responseBody = new TextDecoder().decode(bytes);
    throw new Error(`EcoleDirecte attachment download returned JSON instead of a file: ${responseBody}`);
  }

  file.create({ overwrite: true });
  file.write(bytes);

  if (!(await isExpectedAttachmentFile(file, file.name))) {
    const debugSignature = getFileSignature(bytes);
    file.delete();
    throw new Error(`EcoleDirecte attachment download returned an invalid file payload (${debugSignature})`);
  }
}

function getAttachmentName(reference: string, fallbackName?: string): string {
  const extension = getFileExtension(reference);
  const normalizedFallback = normalizeReference(fallbackName)?.replace(/\.[^.]+$/, "");

  if (normalizedFallback) {
    return extension ? `${normalizedFallback}.${extension}` : normalizedFallback;
  }

  const fileName = getReferenceFileName(reference);
  return fileName || "document";
}

function getCachedFileName(
  reference: string,
  preferredName?: string,
  contentType?: string
): string {
  const resolvedName = getResolvedAttachmentName(preferredName, undefined, contentType);
  const extension = getFileExtension(resolvedName) || getFileExtension(reference) || "bin";
  const baseName = sanitizeFileName(resolvedName.replace(/\.[^.]+$/, "") || "document");
  return `${baseName}-${ED_ATTACHMENT_CACHE_VERSION}-${generateId(reference)}.${extension}`;
}

function getExistingCachedEDAttachmentFile(reference: string): File | undefined {
  const cacheKey = `-${ED_ATTACHMENT_CACHE_VERSION}-${generateId(reference)}.`;

  try {
    return ED_ATTACHMENTS_DIRECTORY
      .list()
      .find((entry): entry is File => entry instanceof File && entry.name.includes(cacheKey));
  } catch {
    return undefined;
  }
}

function getResolvedAttachmentName(
  preferredName?: string,
  fileName?: string,
  contentType?: string
): string {
  const normalizedName = normalizeReference(fileName) || normalizeReference(preferredName) || "document";
  if (getFileExtension(normalizedName)) {
    return normalizedName;
  }

  const contentTypeExtension = getExtensionFromContentType(contentType);
  return contentTypeExtension ? `${normalizedName}.${contentTypeExtension}` : normalizedName;
}

function getReferenceFileName(reference: string): string {
  const parts = reference.split(/[\\/]/);
  return parts[parts.length - 1] ?? reference;
}

function getReferenceFromUrl(url: string): string | undefined {
  try {
    return new URL(url).searchParams.get("fichierId") ?? undefined;
  } catch {
    return undefined;
  }
}

function getEDSessionForAccount(serviceAccountId: string): Client | undefined {
  const plugin = getManager().getServicePlugin(serviceAccountId);
  return plugin?.session as Client | undefined;
}

function getMimeType(file: File): string | undefined {
  if (file.type) {
    return file.type;
  }

  const extension = getFileExtension(file.name);
  switch (extension) {
  case "pdf":
    return "application/pdf";
  case "jpg":
  case "jpeg":
    return "image/jpeg";
  case "png":
    return "image/png";
  case "doc":
    return "application/msword";
  case "docx":
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  default:
    return undefined;
  }
}

function getExtensionFromContentType(contentType?: string): string {
  const normalizedContentType = contentType?.split(";")[0]?.trim().toLowerCase();
  switch (normalizedContentType) {
  case "application/pdf":
    return "pdf";
  case "image/jpeg":
    return "jpg";
  case "image/png":
    return "png";
  case "application/msword":
    return "doc";
  case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    return "docx";
  default:
    return "";
  }
}

function getFileExtension(value?: string): string {
  const normalized = normalizeReference(value);
  if (!normalized) {
    return "";
  }

  const fileName = getReferenceFileName(normalized);
  const parts = fileName.split(".");
  return parts.length > 1 ? sanitizeFileName(parts[parts.length - 1].toLowerCase()) : "";
}

function sanitizeFileName(value: string): string {
  const sanitized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || "document";
}

function normalizeReference(value?: string | null): string {
  return typeof value === "string"
    ? value.replace(/\u00A0/g, " ").trim()
    : "";
}

export function isEDAttachmentRebuildError(error: unknown): boolean {
  return error instanceof Error && error.message === ANDROID_ATTACHMENT_NATIVE_MODULE_REBUILD_ERROR;
}

async function shouldDownloadEDAttachmentFile(file: File, preferredName?: string): Promise<boolean> {
  if (!file.exists) {
    return true;
  }

  if (await isExpectedAttachmentFile(file, preferredName)) {
    return false;
  }

  file.delete();
  return true;
}

async function isExpectedAttachmentFile(file: File, preferredName?: string): Promise<boolean> {
  const extension = getFileExtension(preferredName || file.name);
  const bytes = await file.bytes();
  if (bytes.length === 0) {
    return false;
  }

  switch (extension) {
  case "pdf":
    return startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2D]);
  case "png":
    return startsWithBytes(bytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  case "jpg":
  case "jpeg":
    return startsWithBytes(bytes, [0xFF, 0xD8, 0xFF]);
  case "docx":
    return startsWithBytes(bytes, [0x50, 0x4B, 0x03, 0x04])
      || startsWithBytes(bytes, [0x50, 0x4B, 0x05, 0x06])
      || startsWithBytes(bytes, [0x50, 0x4B, 0x07, 0x08]);
  case "doc":
    return startsWithBytes(bytes, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
  default:
    return true;
  }
}

function startsWithBytes(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[index] === value);
}

function getFileSignature(bytes: Uint8Array): string {
  return Array.from(bytes.slice(0, 8))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join(" ");
}

async function getIntentLauncherModule(): Promise<IntentLauncherModule | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  if (!intentLauncherModulePromise) {
    intentLauncherModulePromise = import("expo-intent-launcher")
      .then((module) => {
        if (typeof module.startActivityAsync === "function") {
          return module as IntentLauncherModule;
        }

        if (typeof module.default?.startActivityAsync === "function") {
          return module.default as IntentLauncherModule;
        }

        return null;
      })
      .catch(() => null);
  }

  return intentLauncherModulePromise;
}
