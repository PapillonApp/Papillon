import { ICalEvent } from './ical';

export function filterEventsByDateRange(
  events: ICalEvent[],
  startDate: Date,
  endDate: Date
): ICalEvent[] {
  return events.filter(event => {
    if (!event.dtstart) {
      return false;
    }

    const eventStart = new Date(event.dtstart);
    return eventStart >= startDate && eventStart <= endDate;
  });
}

export function filterEventsByWeek(events: ICalEvent[], weekStart: Date, weekEnd: Date): ICalEvent[] {
  return filterEventsByDateRange(events, weekStart, weekEnd);
}