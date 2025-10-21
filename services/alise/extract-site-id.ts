export function extractAliseSiteId(input: string): string {
  console.log("🔍 extractAliseSiteId appelé avec:", input, "Type:", typeof input);

  if (!input || typeof input !== 'string') {
    throw new Error("L'identifiant ou l'URL du site est requis");
  }

  const trimmedInput = input.trim();
  console.log("✂️ Après trim:", trimmedInput);

  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    try {
      const url = new URL(trimmedInput);
      const siteParam = url.searchParams.get('site');

      if (!siteParam) {
        throw new Error("Le paramètre 'site' n'a pas été trouvé dans l'URL");
      }

      return siteParam;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("URL invalide fournie");
      }
      throw error;
    }
  }

  if (trimmedInput.includes('site=')) {
    const match = trimmedInput.match(/site=([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error("Format 'site=' invalide");
  }

  if (/^[a-zA-Z0-9]+$/.test(trimmedInput)) {
    return trimmedInput;
  }

  throw new Error(
    "Format d'identifiant invalide. Fournissez soit l'URL complète, soit l'identifiant du site (ex: aes00307)"
  );
}