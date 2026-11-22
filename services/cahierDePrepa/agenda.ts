import { addDays, startOfWeek } from "date-fns";
import { DomUtils, parseDocument } from "htmlparser2";

import { parseFrenchDate } from "@/services/shared/frenchDate";
import { type CourseDay, CourseType } from "@/services/shared/timetable";

const mondayOf = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });

export function cahierWeek(date: Date): string {
  const monday = mondayOf(date);
  const month = monday.getMonth();
  const first = new Date(monday.getFullYear(), month, 1);
  const offset = (first.getDay() + 6) % 7;
  const week = Math.ceil((monday.getDate() + offset) / 7);
  return (
    String(monday.getFullYear()).slice(-2) +
    String(month + 1).padStart(2, "0") +
    week
  );
}

export function mapWeeklyAgenda(
  html: string,
  date: Date,
  serviceId: string
): CourseDay[] {
  const document = parseDocument(html);
  const monday = mondayOf(date);
  const days: CourseDay[] = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(monday, i),
    courses: [],
  }));
  const articles = DomUtils.findAll(
    node => node.name === "article" && Boolean(node.attribs["data-id"]),
    document.children
  );
  if (
    !DomUtils.getElementById("calendrier", document.children) &&
    articles.length === 0
  ) {
    throw new Error("Cahier de Prépa did not return its agenda.");
  }

  for (const article of articles) {
    const dateNode = DomUtils.findOne(
      node => (node.attribs.class ?? "").split(/\s+/).includes("titreagenda"),
      article.children
    );
    const heading = DomUtils.findOne(
      node => node.name === "h4",
      article.children
    );
    const text = dateNode
      ? DomUtils.textContent(dateNode).replace(/\s+/g, " ").trim()
      : "";
    const match = text.match(
      /^Le \p{L}+ (\d{1,2}(?:er)? \p{L}+ \d{4}) (?:de|à) (\d{1,2})h(\d{2})?(?: à (\d{1,2})h(\d{2})?)?$/iu
    );
    const subject = heading
      ? DomUtils.textContent(heading)
          .trim()
          .replace(/^Cours en /i, "")
      : "";
    const day = match && parseFrenchDate(match[1]);
    const bucket =
      day && days.find(item => item.date.getTime() === day.getTime());
    if (!match || !day || !bucket || !subject) {
      continue;
    }
    const from = new Date(day);
    const to = new Date(day);
    const startHours = Number(match[2]);
    const endHours = Number(match[4] ?? match[2]);
    const startMinutes = Number(match[3] ?? 0);
    const endMinutes = Number(match[5] ?? (match[4] ? 0 : startMinutes));
    if (
      startHours > 23 ||
      endHours > 23 ||
      startMinutes > 59 ||
      endMinutes > 59
    ) {
      continue;
    }
    from.setHours(startHours, startMinutes);
    to.setHours(endHours, endMinutes);
    if (to < from) {
      continue;
    }
    const detail = DomUtils.findOne(
      node => node.name === "p",
      article.children
    );
    bucket.courses.push({
      id: `cahier-de-prepa:${article.attribs["data-id"]}`,
      subject,
      type: /^Cours en /i.test(DomUtils.textContent(heading!))
        ? CourseType.LESSON
        : CourseType.ACTIVITY,
      from,
      to,
      additionalInfo: detail ? DomUtils.textContent(detail).trim() : undefined,
      createdByAccount: serviceId,
    });
  }
  for (const day of days) {
    day.courses.sort((a, b) => a.from.getTime() - b.from.getTime());
  }
  return days;
}
