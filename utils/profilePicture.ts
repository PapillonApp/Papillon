const HTML_DOCUMENT_BASE64_PREFIX = "PCFET0NUWVBFIGh0bWw+";
const DEFAULT_PROFILE_PICTURE_MIME_TYPE = "image/png";

export function getAccountProfilePictureUri(profilePicture?: string | null): string | undefined {
  const normalizedProfilePicture = profilePicture?.trim();

  if (!normalizedProfilePicture || normalizedProfilePicture.startsWith(HTML_DOCUMENT_BASE64_PREFIX)) {
    return undefined;
  }

  if (normalizedProfilePicture.startsWith("data:")) {
    return normalizedProfilePicture;
  }

  if (/^https?:\/\//i.test(normalizedProfilePicture)) {
    return normalizedProfilePicture;
  }

  if (normalizedProfilePicture.startsWith("//")) {
    return `https:${normalizedProfilePicture}`;
  }

  // Backward compatibility with the historical "raw base64 only" format.
  return `data:${DEFAULT_PROFILE_PICTURE_MIME_TYPE};base64,${normalizedProfilePicture}`;
}

export function createProfilePictureDataUri(base64: string, mimeType?: string | null): string {
  const normalizedBase64 = base64.trim();
  if (!normalizedBase64) {
    return "";
  }

  if (normalizedBase64.startsWith("data:")) {
    return normalizedBase64;
  }

  const normalizedMimeType = typeof mimeType === "string" && /^image\//i.test(mimeType)
    ? mimeType
    : DEFAULT_PROFILE_PICTURE_MIME_TYPE;

  return `data:${normalizedMimeType};base64,${normalizedBase64}`;
}

export function normalizeExternalProfilePictureUrl(url?: string | null): string | undefined {
  const normalizedUrl = url?.trim();
  if (!normalizedUrl) {
    return undefined;
  }

  if (normalizedUrl.startsWith("//")) {
    return `https:${normalizedUrl}`;
  }

  return normalizedUrl;
}
