import { Course as SharedCourse, CourseType } from '@/services/shared/timetable';
import { ICalEvent } from './ical';
import { parseADEDescription } from './parsers/ade-parser';
import { parseHyperplanningDescription, isHyperplanningDescription } from './parsers/hyperplanning-parser';

interface ConversionContext {
  icalId: string;
  icalTitle: string;
  isADE: boolean;
  isHyperplanning: boolean;
  intelligentParsing: boolean;
}

interface ParsedEventData {
  type: string;
  teacher: string;
  group: string;
}

const DEFAULT_EVENT_DATA: ParsedEventData = {
  type: 'Activité',
  teacher: 'Inconnu',
  group: 'Inconnu'
};

function parseEventData(event: ICalEvent, isADE: boolean, isHyperplanning: boolean, intelligentParsing: boolean): ParsedEventData {
  if (!intelligentParsing) {
    return DEFAULT_EVENT_DATA;
  }

  if (isHyperplanning || isHyperplanningDescription(event.description || '')) {
    const parsed = parseHyperplanningDescription(event.description || '');
    if (parsed) {
      return {
        type: parsed.type || DEFAULT_EVENT_DATA.type,
        teacher: parsed.teacher || event.organizer || DEFAULT_EVENT_DATA.teacher,
        group: parsed.group || DEFAULT_EVENT_DATA.group
      };
    }
  }

  if (isADE) {
    const parsed = parseADEDescription(event.description || '');
    if (parsed) {
      return {
        type: parsed.type || DEFAULT_EVENT_DATA.type,
        teacher: parsed.teacher || event.organizer || DEFAULT_EVENT_DATA.teacher,
        group: parsed.groups?.join(',') || parsed.group || DEFAULT_EVENT_DATA.group
      };
    }
  }

  return DEFAULT_EVENT_DATA;
}

function calculateEventEndTime(event: ICalEvent): Date {
  if (event.dtend) {
    return event.dtend;
  }

  const startTime = event.dtstart || new Date();
  return new Date(startTime.getTime() + 60 * 60 * 1000);
}

export function convertICalEventToSharedCourse(
  event: ICalEvent,
  context: ConversionContext
): SharedCourse {
  const { type, teacher, group } = parseEventData(
    event,
    context.isADE,
    context.isHyperplanning,
    context.intelligentParsing
  );

  return {
    id: event.uid,
    subject: event.summary || 'Événement',
    type: CourseType.ACTIVITY,
    from: event.dtstart || new Date(),
    to: calculateEventEndTime(event),
    additionalInfo: type !== DEFAULT_EVENT_DATA.type ? type : event.description,
    room: event.location,
    teacher,
    group,
    backgroundColor: '#4CAF50',
    status: undefined,
    customStatus: context.icalTitle,
    url: '',
    createdByAccount: `ical_${context.icalId}`
  };
}

export function convertMultipleEvents(
  events: ICalEvent[],
  context: ConversionContext
): SharedCourse[] {
  return events.map(event => convertICalEventToSharedCourse(event, context));
}