import ICAL from 'ical.js';
import { generateId } from '@/utils/generateId';
import { ICalEvent } from '../ical';

export interface ParsedCalendarMetadata {
  prodId?: string;
  calendarName?: string;
}

export function parseCalendarMetadata(comp: ICAL.Component): ParsedCalendarMetadata {
  return {
    prodId: comp.getFirstPropertyValue('prodid')?.toString(),
    calendarName: (comp.getFirstPropertyValue('x-wr-calname') || comp.getFirstPropertyValue('name'))?.toString()
  };
}

export function parseICalEvents(comp: ICAL.Component): ICalEvent[] {
  const events: ICalEvent[] = [];
  const vevents = comp.getAllSubcomponents('vevent');

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    events.push({
      uid: event.uid || generateId(event.summary + event.startDate?.toString()),
      summary: event.summary,
      description: event.description,
      dtstart: event.startDate?.toJSDate(),
      dtend: event.endDate?.toJSDate(),
      location: event.location,
      allday: event.startDate?.isDate || false,
      organizer: event.organizer?.toString()
    });
  }

  return events;
}

export function parseICalString(icalString: string): { events: ICalEvent[]; metadata: ParsedCalendarMetadata } {
  const jcalData = ICAL.parse(icalString);
  const comp = new ICAL.Component(jcalData);

  return {
    events: parseICalEvents(comp),
    metadata: parseCalendarMetadata(comp)
  };
}