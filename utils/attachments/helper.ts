export const URLToBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );