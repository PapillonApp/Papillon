import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { Course, CourseDay, CourseType } from "@/services/shared/timetable";

export interface CahierRecentItem {
  title: string;
  href?: string;
  text: string;
  date?: string;
}
export interface CahierAgendaEvent {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  text: string;
}

export function normalizeCahierDePrepaUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Cahier de Prépa instance URL must use HTTP(S).");
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return url.toString();
}

export function mapRecentItem(
  item: CahierRecentItem,
  accountId: string,
  index: number
): News {
  const sourceId = item.href ?? `${item.title}:${index}`;
  const parsedDate = item.date ? new Date(item.date) : undefined;
  return {
    id: `cahier-de-prepa:${sourceId}`,
    title: item.title || undefined,
    createdAt:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : new Date(0),
    acknowledged: false,
    attachments: [],
    content: item.text,
    author: "Cahier de Prépa",
    category: "Cahier de Prépa",
    createdByAccount: accountId,
    ref: item.href,
  };
}

export function mapRecentItemToHomework(
  item: CahierRecentItem,
  accountId: string,
  index: number
): Homework | undefined {
  const dateText = `${item.title} ${item.text}`;
  const explicitDate = dateText.match(/(?:pour le|à rendre le|le)\s+(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?/i);
  const date = explicitDate
    ? parseDay(
        `${explicitDate[1]}/${explicitDate[2]}/${
          explicitDate[3] ?? new Date().getFullYear()
        }`
      )
    : item.date
      ? parseDay(item.date)
      : undefined;

  if (!date) {
    return undefined;
  }

  return {
    id: `cahier-de-prepa:homework:${item.href ?? `${item.title}:${index}`}`,
    subject: item.title || "Cahier de Prépa",
    content: item.text,
    dueDate: date,
    isDone: false,
    attachments: [],
    evaluation: false,
    custom: false,
    createdByAccount: accountId,
  };
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function mapRecentItemsToHomeworks(
  items: CahierRecentItem[],
  accountId: string,
  weekNumber: number
): Homework[] {
  return items
    .map((item, index) => mapRecentItemToHomework(item, accountId, index))
    .filter(
      (homework): homework is Homework =>
        homework !== undefined && getWeekNumber(homework.dueDate) === weekNumber
    );
}
function parseDay(value: string): Date | undefined {
  const french = value.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (french) {
    const year = Number(french[3].length === 2 ? `20${french[3]}` : french[3]);
    const date = new Date(year, Number(french[2]) - 1, Number(french[1]));
    return date.getFullYear() === year &&
      date.getMonth() === Number(french[2]) - 1 &&
      date.getDate() === Number(french[1])
      ? date
      : undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseTimedEvent(
  event: CahierAgendaEvent,
  accountId: string,
  index: number
): Course | undefined {
  if (!event.date || !event.time) {
    return undefined;
  }
  const day = parseDay(event.date);
  const times = event.time.match(
    /(\d{1,2})\s*[:h](\d{2})[^\d]+(\d{1,2})\s*[:h](\d{2})/i
  );
  if (!day || !times) {
    return undefined;
  }
  const from = new Date(day);
  from.setHours(Number(times[1]), Number(times[2]), 0, 0);
  const to = new Date(day);
  to.setHours(Number(times[3]), Number(times[4]), 0, 0);
  if (to <= from) {
    return undefined;
  }
  return {
    id: `cahier-de-prepa:${event.title}:${event.date}:${event.time}:${index}`,
    subject: event.title,
    type: CourseType.ACTIVITY,
    from,
    to,
    room: event.location,
    additionalInfo: event.text,
    createdByAccount: accountId,
  };
}

export function mapAgenda(
  events: CahierAgendaEvent[],
  accountId: string
): CourseDay[] {
  const courses = events
    .map((event, index) => parseTimedEvent(event, accountId, index))
    .filter((course): course is Course => course !== undefined);
  const days = new Map<string, CourseDay>();
  for (const course of courses) {
    const key = course.from.toISOString().slice(0, 10);
    const day = days.get(key) ?? {
      date: new Date(
        course.from.getFullYear(),
        course.from.getMonth(),
        course.from.getDate()
      ),
      courses: [],
    };
    day.courses.push(course);
    days.set(key, day);
  }
  return [...days.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}
