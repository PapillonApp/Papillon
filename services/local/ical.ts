import { Course as SharedCourse } from '@/services/shared/timetable';

import { convertICalEventToSharedCourse, convertMultipleEvents } from './event-converter';
import { filterEventsByWeek } from './event-filter';
import { getAllIcals, updateProviderIfUnknown } from './ical-database';
import { detectProvider } from './ical-utils';
import { parseICalString } from './parsers/ical-event-parser';

const ICAL_CACHE_TTL_MS = 5 * 60 * 1000;
const rawICalCache = new Map<string, { text: string; fetchedAt: number }>();
const inFlightICalRequests = new Map<string, Promise<string>>();

async function fetchRawICal(url: string): Promise<string> {
  const cached = rawICalCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < ICAL_CACHE_TTL_MS) {
    return cached.text;
  }

  const inFlight = inFlightICalRequests.get(url);
  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    rawICalCache.set(url, { text, fetchedAt: Date.now() });
    return text;
  })().finally(() => {
    inFlightICalRequests.delete(url);
  });

  inFlightICalRequests.set(url, request);
  return request;
}

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

export async function fetchAndParseICal(
  url: string,
  rangeStart?: Date,
  rangeEnd?: Date
): Promise<ParsedICalData> {
  try {
    const icalString = await fetchRawICal(url);
    const { events, metadata } = parseICalString(icalString, rangeStart, rangeEnd);
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

async function processIcalData(
  ical: any,
  rangeStart?: Date,
  rangeEnd?: Date
): Promise<{ parsedData: ParsedICalData; shouldUpdateIcal: boolean }> {
  const parsedData = await fetchAndParseICal(ical.url, rangeStart, rangeEnd);
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
      const { parsedData } = await processIcalData(ical, weekStart, weekEnd);
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
  const separatorIndex = id.lastIndexOf('::');
  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;

  if (separatorIndex !== -1) {
    const occMs = Number(id.slice(separatorIndex + 2));
    if (Number.isFinite(occMs)) {
      rangeStart = new Date(occMs - 1000);
      rangeEnd = new Date(occMs + 1000);
    }
  }

  for (const ical of icals) {
    try {
      const { parsedData } = await processIcalData(ical, rangeStart, rangeEnd);
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
