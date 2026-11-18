import type { SessionHandle } from "@blockshub/pawnote-lts";

import { isValidBase64Image, stripBase64ImagePrefix, URLToBase64 } from "@/utils/attachments/helper";

const profilePictureCache = new Map<string, string>();

const PHOTO_FIELDS = [
  "photoBase64",
  "base64",
  "contenu",
  "content",
  "data",
  "donnees",
  "V",
  "value",
  "photo",
] as const;

const NAME_FIELDS = ["nom", "name", "L", "libelle", "fichier", "url"] as const;

export const normalizePronoteInstanceUrl = (rawUrl?: string): string => {
  if (!rawUrl) {
    return "";
  }

  try {
    const parsed = new URL(rawUrl.trim());
    let pathname = parsed.pathname;
    const appelIndex = pathname.indexOf("/appelfonction");

    if (appelIndex !== -1) {
      pathname = pathname.slice(0, appelIndex);
    } else {
      const parts = pathname.split("/");
      const last = parts[parts.length - 1] ?? "";
      if (last.includes(".html") || last.includes(".json")) {
        parts.pop();
      }
      pathname = parts.join("/");
    }

    pathname = pathname.replace(/\/+$/, "");
    return `${parsed.protocol}//${parsed.host}${pathname}`.toLowerCase();
  } catch {
    return rawUrl.trim().replace(/\/+$/, "").toLowerCase();
  }
};

const toValidPictureBase64 = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!isValidBase64Image(trimmed)) {
    return null;
  }

  return stripBase64ImagePrefix(trimmed);
};

const hasPhotoLabel = (record: Record<string, unknown>): boolean =>
  NAME_FIELDS.some(field => {
    const val = record[field];
    return typeof val === "string" && val.toLowerCase().includes("photo");
  });

const extractPictureFromValue = (value: unknown, depth = 0): string | null => {
  if (depth > 4 || value === null || value === undefined) {
    return null;
  }

  const direct = toValidPictureBase64(value);
  if (direct) {
    return direct;
  }

  if (Array.isArray(value)) {
    const prioritized = [...value].sort((a, b) => {
      const aScore = a && typeof a === "object" && hasPhotoLabel(a as Record<string, unknown>) ? 0 : 1;
      const bScore = b && typeof b === "object" && hasPhotoLabel(b as Record<string, unknown>) ? 0 : 1;
      return aScore - bScore;
    });

    for (const entry of prioritized) {
      const extracted = extractPictureFromValue(entry, depth + 1);
      if (extracted) {
        return extracted;
      }
    }
    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const field of PHOTO_FIELDS) {
      const extracted = extractPictureFromValue(record[field], depth + 1);
      if (extracted) {
        return extracted;
      }
    }

    const entries = Object.entries(record).sort(([a], [b]) => {
      const aScore = a.toLowerCase().includes("photo") ? 0 : 1;
      const bScore = b.toLowerCase().includes("photo") ? 0 : 1;
      return aScore - bScore;
    });

    for (const [, entryValue] of entries) {
      const extracted = extractPictureFromValue(entryValue, depth + 1);
      if (extracted) {
        return extracted;
      }
    }
  }

  return null;
};

const findPhotoBase64Property = (value: unknown, depth = 0): string | null => {
  if (depth > 5 || !value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPhotoBase64Property(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const direct = toValidPictureBase64(record.photoBase64);
  if (direct) {
    return direct;
  }

  for (const child of Object.values(record)) {
    const found = findPhotoBase64Property(child, depth + 1);
    if (found) {
      return found;
    }
  }

  return null;
};

/**
 * Extracts and caches any profile picture embedded in an `appelfonction` JSON
 * response (`dataNonSec.fichiers`, `donneesNonSec.fichiers`, or `photoBase64`
 * on `ParametresUtilisateur`), keyed by normalized PRONOTE instance URL.
 */
export const cachePronoteProfilePictureFromResponse = (
  requestUrl: string,
  responseText: string,
  requestBody?: string
): void => {
  if (!requestUrl.includes("appelfonction") || !responseText.trimStart().startsWith("{")) {
    return;
  }

  try {
    const parsed = JSON.parse(responseText) as Record<string, unknown>;
    const instanceKey = normalizePronoteInstanceUrl(requestUrl);
    if (!instanceKey) {
      return;
    }

    const nonSec = (parsed.dataNonSec ?? parsed.donneesNonSec) as Record<string, unknown> | undefined;
    const fichiers = nonSec?.fichiers;
    const fromFichiers = fichiers !== undefined ? extractPictureFromValue(fichiers) : null;

    const isParametresUtilisateur =
      parsed.nom === "ParametresUtilisateur" ||
      (typeof requestBody === "string" && requestBody.includes("ParametresUtilisateur"));
    const fromPhotoBase64 = isParametresUtilisateur ? findPhotoBase64Property(parsed) : null;

    const candidate = fromPhotoBase64 ?? fromFichiers;
    if (candidate) {
      profilePictureCache.set(instanceKey, candidate);
    }
  } catch {
    // Ignore non-JSON or malformed responses
  }
};

export const getCachedPronoteProfilePicture = (instanceUrl?: string): string => {
  const key = normalizePronoteInstanceUrl(instanceUrl);
  return key ? (profilePictureCache.get(key) ?? "") : "";
};

/**
 * Resolves a PRONOTE user's profile picture as raw base64 by trying:
 * 1) `session.user.resources[0].profilePicture.url` via `URLToBase64`,
 * 2) `photoBase64` directly on the resource,
 * 3) the memory cache populated from `dataNonSec.fichiers`.
 */
export async function extractPronoteProfilePicture(
  session: SessionHandle,
  instanceUrl?: string
): Promise<string> {
  const firstResource = session.user?.resources?.[0] as
    | ({ profilePicture?: { url?: string } | null; photoBase64?: unknown } | undefined);

  const profilePictureUrl = firstResource?.profilePicture?.url;
  if (profilePictureUrl) {
    try {
      const fromUrl = await URLToBase64(profilePictureUrl);
      const valid = toValidPictureBase64(fromUrl);
      if (valid) {
        return valid;
      }
    } catch {
      // Fallback to photoBase64 or cached dataNonSec.fichiers
    }
  }

  const fromResourceBase64 = toValidPictureBase64(firstResource?.photoBase64);
  if (fromResourceBase64) {
    return fromResourceBase64;
  }

  return getCachedPronoteProfilePicture(instanceUrl ?? session.information?.url);
}
