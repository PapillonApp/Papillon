export const URLToBase64 = (url: string): Promise<string> =>
  fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PRONOTE Mobile APP Version/2.0.11",
    },
  })
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              const base64 = reader.result.split(",")[1];
              resolve(base64);
            } else {
              resolve("");
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
