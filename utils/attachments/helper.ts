const DEFAULT_IMAGE_DOWNLOAD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11",
};

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        resolve("");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function URLToDataUri(
  url: string,
  headers: Record<string, string> = DEFAULT_IMAGE_DOWNLOAD_HEADERS
): Promise<string> {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to download remote image (${response.status}).`);
  }

  return blobToDataUri(await response.blob());
}

export const URLToBase64 = async (
  url: string,
  headers: Record<string, string> = DEFAULT_IMAGE_DOWNLOAD_HEADERS
): Promise<string> => {
  const dataUri = await URLToDataUri(url, headers);
  return dataUri.split(",")[1] ?? "";
};
