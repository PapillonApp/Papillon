export const URLToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11",
    },
  });
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
  return btoa(binary);
};
