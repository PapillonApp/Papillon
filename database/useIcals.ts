import { useCallback,useEffect, useState } from 'react';

import { useDatabase } from './DatabaseProvider';
import Ical from './models/Ical';
import { safeWrite } from "./utils/safeTransaction";

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
  return useCallback(async (title: string, url: string) => {
    await safeWrite(database, async () => {
      await database.get('icals').create((ical: any) => {
        ical.title = title;
        ical.url = url;
        ical.lastUpdated = Date.now();
      });
    }, 10000, 'useAddIcal');
  }, [database]);
}

export function useRemoveIcal() {
  const database = useDatabase();
  return useCallback(async (id: string) => {
    await safeWrite(database, async () => {
      const ical = await database.get('icals').find(id);
      await ical.destroyPermanently();
    }, 10000, 'useRemoveIcal');
  }, [database]);
}
