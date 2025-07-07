import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from './DatabaseProvider';
import Event from './models/Event';

export function useEventsForDay(date: Date, refresh = 0) {
  const database = useDatabase();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    console.log('Querying events between', startOfDay.getTime(), 'and', endOfDay.getTime());

    const query = database.get<Event>('events').query(
      Q.where('start', Q.between(startOfDay.getTime(), endOfDay.getTime()))
    );
    const subscription = query.observe().subscribe(setEvents);
    // Optionally, log for debugging
    // query.fetch().then(allEvents => console.log('All events in DB (from hook):', allEvents.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end }))));
    return () => subscription.unsubscribe();
  }, [date, database, refresh]);

  // Sort events by start time before returning
  return events.slice().sort((a, b) => a.start - b.start);
}
