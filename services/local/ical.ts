import { Course as SharedCourse } from '@/services/shared/timetable';

import { convertMultipleEvents } from './event-converter';
import { convertICalEventToSharedCourse } from './event-converter';
import { filterEventsByWeek } from './event-filter';
import { getAllIcals, updateProviderIfUnknown } from './ical-database';
import { detectProvider } from './ical-utils';
import { parseICalString } from './parsers/ical-event-parser';

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
  isHyperplanning: boolean;
  provider?: string;
  url?: string;
  isSchool?: boolean;
  schoolName?: string;
}

export async function fetchAndParseICal(url: string): Promise<ParsedICalData> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const icalString = await response.text();
    const { events, metadata } = parseICalString(icalString);
    const { isADE, isHyperplanning, provider, isSchool, schoolName } = detectProvider(metadata.prodId, url);
    return {
      events,
      calendarName: metadata.calendarName,
      isADE,
      isHyperplanning,
      provider,
      url,
      isSchool,
      schoolName
    };
  } catch (error) {
    console.error('Error fetching or parsing iCal:', error);
    throw error;
  }
}

async function processIcalData(ical: any): Promise<{ parsedData: ParsedICalData; shouldUpdateIcal: boolean }> {
  const parsedData = await fetchAndParseICal(ical.url);
  let shouldUpdateIcal = false;

  if (!ical.provider || ical.provider === 'unknown') {
    await updateProviderIfUnknown(ical, parsedData.provider || 'unknown');
    shouldUpdateIcal = true;
  }

  return { parsedData, shouldUpdateIcal };
}

export async function getICalEventsForWeek(weekStart: Date, weekEnd: Date): Promise<SharedCourse[]> {
  const icals = await getAllIcals();
  const allEvents: SharedCourse[] = [];

  for (const ical of icals) {
    try {
      const { parsedData } = await processIcalData(ical);
      const weekEvents = filterEventsByWeek(parsedData.events, weekStart, weekEnd);
      const convertedEvents = convertMultipleEvents(weekEvents, {
        icalId: ical.id,
        icalTitle: ical.title,
        isADE: parsedData.isADE,
        isHyperplanning: parsedData.isHyperplanning,
        intelligentParsing: (ical as any).intelligentParsing || false,
        isSchool: parsedData.isSchool ?? false,
        schoolName: parsedData.schoolName
      });

      allEvents.push(...convertedEvents);
    } catch (error) {
      console.error(`Error processing iCal ${ical.title}:`, error);
    }
  }

  return allEvents;
}

export async function getICalCourseById(id: string): Promise<SharedCourse | undefined> {
  const icals = await getAllIcals();

  for (const ical of icals) {
    try {
      const { parsedData } = await processIcalData(ical);
      const event = parsedData.events.find(candidate => candidate.uid === id);
      if (event) {
        return convertICalEventToSharedCourse(event, {
          icalId: ical.id,
          icalTitle: ical.title,
          isADE: parsedData.isADE,
          isHyperplanning: parsedData.isHyperplanning,
          intelligentParsing: (ical as any).intelligentParsing || false,
          isSchool: parsedData.isSchool ?? false,
          schoolName: parsedData.schoolName,
        });
      }
    } catch (error) {
      console.error(`Error processing iCal ${ical.title}:`, error);
    }
  }

  return undefined;
}
