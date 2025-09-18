import { useCallback,useEffect, useState } from 'react';

import { useDatabase } from './DatabaseProvider';
import Ical from './models/Ical';

export function useIcals(refresh = 0) {
  const database = useDatabase();
  const [icals, setIcals] = useState<Ical[]>([]);

  useEffect(() => {
    const query = database.get<Ical>('icals').query();
    const subscription = query.observe().subscribe(setIcals);
    return () => subscription.unsubscribe();
  }, [database, refresh]);

  return icals;
}

export function useAddIcal() {
  const database = useDatabase();
  return useCallback(async (title: string, url: string, intelligentParsing: boolean = false, provider: string = 'unknown') => {
    await database.write(async () => {
      await database.get('icals').create((ical: any) => {
        ical.title = title;
        ical.url = url;
        ical.lastUpdated = Date.now();
        ical.intelligentParsing = intelligentParsing;
        ical.provider = provider;
      });
    });
  }, [database]);
}

export function useRemoveIcal() {
  const database = useDatabase();
  return useCallback(async (id: string) => {
    await database.write(async () => {
      const ical = await database.get('icals').find(id);
      await ical.destroyPermanently();
    });
  }, [database]);
}

export function useUpdateIcalParsing() {
  const database = useDatabase();
  return useCallback(async (id: string, intelligentParsing: boolean) => {
    await database.write(async () => {
      const ical = await database.get('icals').find(id);
      await ical.update((ical: any) => {
        ical.intelligentParsing = intelligentParsing;
      });
    });
  }, [database]);
}
