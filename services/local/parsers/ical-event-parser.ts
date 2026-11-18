import ICAL from 'ical.js';

import { generateId } from '@/utils/generateId';

import type { ICalEvent } from '../ical';

const MAX_ITERATIONS = 2000;

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

function mapSingleEvent(event: ICAL.Event, uid: string): ICalEvent {
  return {
    uid,
    summary: event.summary,
    description: event.description,
    dtstart: event.startDate?.toJSDate(),
    dtend: event.endDate?.toJSDate(),
    location: event.location,
    allday: event.startDate?.isDate || false,
    organizer: event.organizer?.toString()
  };
}

export function parseICalEvents(
  comp: ICAL.Component,
  rangeStart?: Date,
  rangeEnd?: Date
): ICalEvent[] {
  for (const vtz of comp.getAllSubcomponents('vtimezone')) {
    if (vtz.getFirstPropertyValue('tzid')) {
      ICAL.TimezoneService.register(vtz);
    }
  }

  const events: ICalEvent[] = [];
  const vevents = comp.getAllSubcomponents('vevent');
  const masterEvents: ICAL.Event[] = [];
  const masterByUid = new Map<string, ICAL.Event>();
  const exceptionEvents: ICAL.Event[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent, { exceptions: [] });
    if (event.isRecurrenceException()) {
      exceptionEvents.push(event);
    } else {
      masterEvents.push(event);
      if (event.uid) {
        masterByUid.set(event.uid, event);
      }
    }
  }

  const orphanExceptions: ICAL.Event[] = [];
  for (const exceptionEvent of exceptionEvents) {
    const masterEvent = exceptionEvent.uid
      ? masterByUid.get(exceptionEvent.uid)
      : undefined;
    if (masterEvent) {
      masterEvent.relateException(exceptionEvent);
    } else {
      orphanExceptions.push(exceptionEvent);
    }
  }

  for (const event of [...masterEvents, ...orphanExceptions]) {
    const baseUid =
      event.uid ||
      generateId((event.summary ?? '') + (event.startDate?.toString() ?? ''));

    if (event.isRecurring() && rangeStart && rangeEnd && event.startDate) {
      const iterator = event.iterator();
      let next: ICAL.Time | null;
      let iterations = 0;

      while ((next = iterator.next()) && iterations < MAX_ITERATIONS) {
        iterations += 1;
        if (next.toJSDate() > rangeEnd) {
          break;
        }

        const details = event.getOccurrenceDetails(next);
        const startDate = details.startDate?.toJSDate();
        const endDate = details.endDate?.toJSDate();
        const effectiveEnd = endDate ?? startDate;

        if (!startDate) {
          continue;
        }
        if (effectiveEnd && effectiveEnd < rangeStart) {
          continue;
        }
        if (startDate > rangeEnd) {
          continue;
        }

        const item = details.item ?? event;
        events.push({
          uid: `${baseUid}::${startDate.getTime()}`,
          summary: item.summary,
          description: item.description,
          dtstart: startDate,
          dtend: endDate,
          location: item.location,
          allday: details.startDate?.isDate || false,
          organizer: item.organizer?.toString()
        });
      }
    } else {
      events.push(mapSingleEvent(event, baseUid));
    }
  }

  return events;
}

export function parseICalString(
  icalString: string,
  rangeStart?: Date,
  rangeEnd?: Date
): { events: ICalEvent[]; metadata: ParsedCalendarMetadata } {
  const jcalData = ICAL.parse(icalString);
  const comp = new ICAL.Component(jcalData);

  return {
    events: parseICalEvents(comp, rangeStart, rangeEnd),
    metadata: parseCalendarMetadata(comp)
  };
}