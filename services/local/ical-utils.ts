const SCHOOL_LIST = [
  {
    domain: "planning.univ-rennes1.fr",
    name: "UNIVRENNES1"
  }
];

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

export function detectProvider(prodId?: string, url?: string): { isADE: boolean; isHyperplanning: boolean; provider: string, isSchool: boolean, schoolName?: string } {
  const provider = prodId || url || 'unknown';
  const isADE = Boolean(prodId?.toUpperCase().includes('ADE'));
  const isHyperplanning = Boolean(prodId?.toUpperCase().includes('HYPERPLANNING'));

  const school = SCHOOL_LIST.find((school) => url?.includes(school.domain));
  const isSchool = Boolean(school);

  return { isADE, isHyperplanning, provider, isSchool, schoolName: school?.name };
}

export function isADEProvider(provider?: string): boolean {
  return Boolean(provider?.toUpperCase().includes('ADE'));
}

export function isHyperplanningProvider(provider?: string): boolean {
  return Boolean(provider?.toUpperCase().includes('HYPERPLANNING'));
}