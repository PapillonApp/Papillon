import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from './DatabaseProvider';
import Event from './models/Event';

export function useEventsForDay(date: Date, refresh = 0) {
  const database = useDatabase();
  const [eventsWithSubjects, setEventsWithSubjects] = useState<any[]>([]);

  useEffect(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    console.log('Querying events between', startOfDay.getTime(), 'and', endOfDay.getTime());

    const query = database.get<Event>('events').query(
      Q.where('start', Q.between(startOfDay.getTime(), endOfDay.getTime()))
    );
    const subscription = query.observe().subscribe(async (events) => {
      const eventsWithSubjects = await Promise.all(
        events.map(async (event) => {
          const subject = await event.subject.fetch();
          // Use event.start from the Event instance, not from _raw
          return { ...event._raw, start: event.start, end: event.end, subject: subject ? subject._raw : null };
        })
      );
      setEventsWithSubjects(eventsWithSubjects.sort((a, b) => a.start - b.start));
    });
    return () => subscription.unsubscribe();
  }, [date, database, refresh]);

  return eventsWithSubjects;
}
