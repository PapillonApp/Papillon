import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

import { useDatabase } from './DatabaseProvider';
import Event from './models/Event';

export function useEventById(id: string | number | undefined) {
  const database = useDatabase();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!id) {
      setEvent(null);
      return;
    }
    const query = database.get<Event>('events').query(Q.where('id', id));
    const subscription = query.observe().subscribe(events => {
      setEvent(events[0] || null);
    });
    return () => subscription.unsubscribe();
  }, [id, database]);

  return event;
}
