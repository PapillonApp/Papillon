import { getDatabaseInstance } from '@/database/DatabaseProvider';
import Ical from '@/database/models/Ical';
import { enhanceADEUrl } from './parsers/ade-parser';
import { isADEProvider } from './ical-utils';

export async function getAllIcals(): Promise<Ical[]> {
  const database = getDatabaseInstance();
  return await database.get<Ical>('icals').query().fetch();
}

export async function updateIcalUrl(ical: Ical, newUrl: string): Promise<void> {
  const database = getDatabaseInstance();
  await database.write(async () => {
    await ical.update((ical: any) => {
      ical.url = newUrl;
    });
  });
}

export async function updateIcalProvider(ical: Ical, provider: string): Promise<void> {
  const database = getDatabaseInstance();
  await database.write(async () => {
    await ical.update((ical: any) => {
      ical.provider = provider;
    });
  });
}

export async function enhanceIcalIfNeeded(ical: Ical): Promise<void> {
  if (isADEProvider(ical.provider) && !ical.url.includes('firstDate') && !ical.url.includes('lastDate')) {
    const enhancedUrl = enhanceADEUrl(ical.url);
    await updateIcalUrl(ical, enhancedUrl);
  }
}

export async function updateProviderIfUnknown(ical: Ical, detectedProvider: string): Promise<void> {
  if (!ical.provider || ical.provider === 'unknown') {
    await updateIcalProvider(ical, detectedProvider);
  }
}