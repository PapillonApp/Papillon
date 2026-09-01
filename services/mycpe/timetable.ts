import {
  Course,
  CourseDay,
  CourseStatus,
  CourseType,
} from "@/services/shared/timetable";

import { MyCpeApiClient } from "./api";
import { MyCpePlanningEvent } from "./models";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const text = value.trim();
  return text || undefined;
};

const parseDate = (value: unknown): Date | undefined => {
  const text = cleanText(value);
  if (!text) {
    return undefined;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeStatus = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function mapMyCpeCourseStatus(
  status: string | undefined
): CourseStatus | undefined {
  if (!status) {
    return undefined;
  }

  const normalized = normalizeStatus(status);
  if (/annul|cancel|supprim/.test(normalized)) {
    return CourseStatus.CANCELED;
  }
  if (/modif|deplac|report|change/.test(normalized)) {
    return CourseStatus.EDITED;
  }
  if (/distanc|visio|remote|online/.test(normalized)) {
    return CourseStatus.ONLINE;
  }
  return undefined;
}

export function getMyCpeWeekRange(referenceDate: Date): {
  start: Date;
  end: Date;
} {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("La date de référence My CPE est invalide.");
  }

  const start = new Date(referenceDate);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function mapMyCpeTimetable(
  events: MyCpePlanningEvent[],
  accountId: string,
  weekStart: Date
): CourseDay[] {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(-1);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, courses: [] as Course[] };
  });
  const dayByDate = new Map(days.map(day => [formatDate(day.date), day]));

  events.forEach((event, index) => {
    if (event["is_break"] === true || event["is_empty"] === true) {
      return;
    }

    const from = parseDate(event["date_debut"]);
    const to = parseDate(event["date_fin"]);
    if (
      !from ||
      !to ||
      to.getTime() <= from.getTime() ||
      from.getTime() < start.getTime() ||
      from.getTime() > end.getTime()
    ) {
      return;
    }

    const day = dayByDate.get(formatDate(from));
    if (!day) {
      return;
    }

    const activityType = cleanText(event["type_activite"]);
    const description = cleanText(event.description);
    const additionalInfo = [activityType, description]
      .filter(
        (value, valueIndex, values): value is string =>
          Boolean(value) && values.indexOf(value) === valueIndex
      )
      .join(" · ");
    const subject = cleanText(event.matiere) ?? activityType ?? "Cours";
    const rawStatus = cleanText(event["statut_intervention"]);

    day.courses.push({
      id:
        event.id === undefined || event.id === null
          ? `mycpe-course-${from.getTime()}-${index}`
          : String(event.id),
      subject,
      type: CourseType.LESSON,
      from,
      to,
      additionalInfo: additionalInfo || undefined,
      room: cleanText(event.ressource) ?? cleanText(event.salle),
      teacher: cleanText(event.intervenants),
      status: mapMyCpeCourseStatus(rawStatus),
      customStatus: rawStatus,
      createdByAccount: accountId,
    });
  });

  days.forEach(day =>
    day.courses.sort(
      (first, second) => first.from.getTime() - second.from.getTime()
    )
  );
  return days;
}

export async function fetchMyCpeTimetable(
  client: MyCpeApiClient,
  accountId: string,
  _weekNumber: number,
  referenceDate: Date
): Promise<CourseDay[]> {
  const { start, end } = getMyCpeWeekRange(referenceDate);
  const events = await client.getPlanning(formatDate(start), formatDate(end));
  return mapMyCpeTimetable(events, accountId, start);
}
