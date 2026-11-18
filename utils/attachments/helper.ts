const VALID_BASE64_IMAGE_REGEX =
  /^(?:data:image\/[a-zA-Z0-9.+-]+;base64,)?(?:\/9j\/|iVBOR|R0lGOD|UklGR|PHN2Zy|Qk0)/;

export const isValidBase64Image = (value?: string): boolean =>
  Boolean(value && VALID_BASE64_IMAGE_REGEX.test(value));

export const stripBase64ImagePrefix = (value: string): string =>
  value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/i, "");

export const URLToBase64 = async (url: string): Promise<string> => {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/i);
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1].toLowerCase();
    return mime.startsWith("image/") ? dataUrlMatch[2].trim() : "";
  }

  const response = await fetch(trimmed, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11",
    },
  });

  if (!response.ok) {
    return "";
  }

  const contentType = response.headers.get("content-type")?.toLowerCase();
  if (contentType && !contentType.startsWith("image/")) {
    return "";
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
  return btoa(binary);
};
