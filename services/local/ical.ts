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
  isADE: boolean;
  provider?: string;
}

interface ParsedDescription {
  type: string | null;      // DS, QCM, etc.
  group: string | null;    // TDA, etc.
  groups?: string[];
  teacher: string | null; // VINCE LINSIE, etc.
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
    const prodId = comp.getFirstPropertyValue('prodid')?.toString();
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
      calendarName: (comp.getFirstPropertyValue('x-wr-calname') || comp.getFirstPropertyValue('name'))?.toString(),
      isADE: Boolean(prodId?.toUpperCase().includes('ADE')),
      provider: prodId || 'unknown'
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

export function convertICalEventToSharedCourse(event: ICalEvent, icalId: string, icalTitle: string, isADE: boolean, intelligentParsing: boolean = false): SharedCourse {
  const parsed = isADE && intelligentParsing ? parseDescription(event.description || '') : null;
  const {type, teacher, group, groups} = parsed ?? {type: 'Activité', teacher: 'Inconnu', group: 'Inconnu'};
  return {
    id: event.uid,
    subject: event.summary || 'Événement',
    type: CourseType.ACTIVITY,
    from: event.dtstart || new Date(),
    to: event.dtend || (event.dtstart ? new Date(event.dtstart.getTime() + 60 * 60 * 1000) : new Date()),
    additionalInfo: type ?? event.description,
    room: event.location,
    teacher: teacher ?? event.organizer ?? 'Inconnu',
    group: groups?.join(',') ?? group ?? 'Inconnu',
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

      // Update provider info if missing
      if (!(ical as any).provider && parsedData.provider) {
        await database.write(async () => {
          await ical.update((ical: any) => {
            ical.provider = parsedData.provider;
          });
        });
      }

      const weekEvents = parsedData.events.filter(event => {
        if (!event.dtstart) return false;

        const eventStart = new Date(event.dtstart);
        return eventStart >= weekStart && eventStart <= weekEnd;
      });

      const convertedEvents = weekEvents.map(event =>
        convertICalEventToSharedCourse(event, ical.id, ical.title, parsedData.isADE, (ical as any).intelligentParsing || false)
      );

      allEvents.push(...convertedEvents);
    } catch (error) {
      console.error(`Error processing iCal ${ical.title}:`, error);
    }
  }

  return allEvents;
}

function parseDescription(description: string): ParsedDescription | null {
  const lines = description.replace(/^DESCRIPTION:\s*/, '').replace(/\([^)]*\)/g, '').split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  if (lines.length === 0) {
    return null;
  }

  const extractValue = (line: string | undefined): string | null => {
    if (!line) return null;
    const trimmed = line.trim();
    return trimmed === '' ? null : trimmed;
  };

  const isGroupPattern = (line: string): boolean => {
    const trimmed = line.trim().toUpperCase();
    return (
      /^(TP|TD|CM|COURS|GROUPE)\s*\d*[A-Z]*$/i.test(trimmed) ||
      /^GROUPE\s+[A-Z0-9]+$/i.test(trimmed) ||
      /^[A-Z]{2,3}\d*$/i.test(trimmed) ||
      /^[A-Z]\d*$/i.test(trimmed)
    );
  };

  const isTeacherName = (line: string): boolean => {
    const trimmed = line.trim().toUpperCase();
    return /^[A-Z]+(?:-[A-Z]+)?(?:\s+[A-Z]+(?:-[A-Z]+)?)+$/.test(trimmed);
  };

  const allLinesAreGroups = lines.length > 1 && lines.every(isGroupPattern);
  if (allLinesAreGroups) {
    return {
      type: null,
      group: null,
      groups: lines,
      teacher: null,
    };
  }

  switch (lines.length) {
    case 1:
      return {
        type: null,
        group: extractValue(lines[0]),
        teacher: null,
      };

    case 2:
      const firstLine = lines[0];
      const secondLine = lines[1];

      if (isTeacherName(secondLine)) {
        return {
          type: null,
          group: extractValue(firstLine),
          teacher: extractValue(secondLine),
        };
      }

      return {
        type: extractValue(firstLine),
        group: extractValue(secondLine),
        teacher: null,
      };

    case 3:
      return {
        type: extractValue(lines[0]),
        group: extractValue(lines[1]),
        teacher: extractValue(lines[2]),
      };

    default:
      return {
        type: extractValue(lines[0]),
        group: extractValue(lines[1]),
        teacher: extractValue(lines[2]),
      };
  }
}