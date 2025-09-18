export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

export function detectProvider(prodId?: string): { isADE: boolean; isHyperplanning: boolean; provider: string } {
  const provider = prodId || 'unknown';
  const isADE = Boolean(prodId?.toUpperCase().includes('ADE'));
  const isHyperplanning = Boolean(prodId?.toUpperCase().includes('HYPERPLANNING'));

  return { isADE, isHyperplanning, provider };
}

export function isADEProvider(provider?: string): boolean {
  return Boolean(provider?.toUpperCase().includes('ADE'));
}

export function isHyperplanningProvider(provider?: string): boolean {
  return Boolean(provider?.toUpperCase().includes('HYPERPLANNING'));
}