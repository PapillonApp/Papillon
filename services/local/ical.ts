import ICAL from 'ical.js'
import { Course as SharedCourse, CourseType } from '@/services/shared/timetable';
import { generateId } from '@/utils/generateId';
import { getDatabaseInstance } from '@/database/DatabaseProvider';
import Ical from '@/database/models/Ical';

export interface ICalEvent {
  uid: string;
  summary?: string;
  description?: string;
  dtstart?: Date;
  dtend?: Date;
  location?: string;
  allday?: boolean;
  organizer?: string;
}

export interface ParsedICalData {
  events: ICalEvent[];
  calendarName?: string;
}

const icalCache = new Map<string, { data: ParsedICalData; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000;

export async function fetchAndParseICal(url: string): Promise<ParsedICalData> {
  const cached = icalCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const icalString = await response.text();
    const jcalData = ICAL.parse(icalString);
    const comp = new ICAL.Component(jcalData);
    
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

    const parsedData: ParsedICalData = {
      events,
      calendarName: (comp.getFirstPropertyValue('x-wr-calname') || comp.getFirstPropertyValue('name'))?.toString()
    };

    icalCache.set(url, {
      data: parsedData,
      timestamp: Date.now()
    });

    return parsedData;
  } catch (error) {
    console.error('Error fetching or parsing iCal:', error);
    throw error;
  }
}

export function convertICalEventToSharedCourse(event: ICalEvent, icalId: string, icalTitle: string): SharedCourse {
  return {
    id: event.uid,
    subject: event.summary || 'Événement',
    type: CourseType.ACTIVITY,
    from: event.dtstart || new Date(),
    to: event.dtend || (event.dtstart ? new Date(event.dtstart.getTime() + 60 * 60 * 1000) : new Date()),
    additionalInfo: event.description,
    room: event.location,
    teacher: event.organizer ?? 'Inconnu',
    group: 'Inconnu',
    backgroundColor: '#4CAF50',
    status: undefined,
    customStatus: `${icalTitle}`,
    url: '',
    createdByAccount: `ical_${icalId}`
  };
}

export async function getICalEventsForWeek(weekStart: Date, weekEnd: Date): Promise<SharedCourse[]> {
  const database = getDatabaseInstance();
  const icals = await database.get<Ical>('icals').query().fetch();
  const allEvents: SharedCourse[] = [];

  for (const ical of icals) {
    try {
      const parsedData = await fetchAndParseICal(ical.url);
      
      const weekEvents = parsedData.events.filter(event => {
        if (!event.dtstart) return false;
        
        const eventStart = new Date(event.dtstart);
        return eventStart >= weekStart && eventStart <= weekEnd;
      });

      const convertedEvents = weekEvents.map(event =>
        convertICalEventToSharedCourse(event, ical.id, ical.title)
      );

      allEvents.push(...convertedEvents);
    } catch (error) {
      console.error(`Error processing iCal ${ical.title}:`, error);
    }
  }

  return allEvents;
}