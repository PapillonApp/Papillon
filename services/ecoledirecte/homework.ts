
import { Client } from "@blockshub/blocksdirecte";
import { Buffer } from "buffer";
import { addDays, format } from "date-fns";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { generateId } from "@/utils/generateId";

import { Homework } from "../shared/homework";

function hasDisallowedControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (
      (code <= 0x08 ||
        code === 0x0b ||
        code === 0x0c ||
        (code >= 0x0e && code <= 0x1f) ||
        code === 0x7f ||
        code === 0xfffd)
    ) {
      return true;
    }
  }
  return false;
}

function decodeHomeworkContent(content: string): string {
  if (!content) {
    return "";
  }

  const trimmed = content.trim();
  const hasBase64Prefix = /^data:[^;]+;base64,/i.test(trimmed);
  const sanitized = trimmed
    .replace(/^data:[^;]+;base64,/i, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  if (!sanitized || sanitized.length < 8 || sanitized.length % 4 === 1) {
    return content;
  }

  if (!hasBase64Prefix && /\s/.test(trimmed)) {
    return content;
  }

  const normalized = sanitized.padEnd(
    sanitized.length + ((4 - (sanitized.length % 4)) % 4),
    "="
  );

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    return content;
  }

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf-8");
    if (hasDisallowedControlChars(decoded)) {
      return content;
    }
    if (Buffer.from(decoded, "utf-8").toString("base64") !== normalized) {
      return content;
    }
    const hasHtmlTag = /<[a-z][\s\S]*>/i.test(decoded);
    if (hasHtmlTag || (sanitized.length >= 16 && /\s/.test(decoded))) {
      return decoded;
    }
    return content;
  } catch {
    return content;
  }
}

export async function fetchEDHomeworks(
  session: Client,
  accountId: string,
  weekNumber: number
): Promise<Homework[]> {
  const weekdays = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];
  for (const date of weekdays) {
    const formattedDate = formatDate(date);

    const { matieres } = await session.homework.getHomeworksForDate(formattedDate);

    for (const subject of matieres) {
      if (!subject.aFaire) {
        continue;
      }

      const homework = subject.aFaire;
      const subjectName =
        subject.matiere && subject.matiere.length > 0
          ? subject.matiere
          : subject.entityLibelle;
      const content = decodeHomeworkContent(homework.contenu ?? "");
      const rawId =
        homework.idDevoir ?? (subject as { id?: number | string }).id;
      const fallbackId = generateId(
        `${formattedDate}-${subject.codeMatiere || subjectName}-${content}`
      );
      const id =
        rawId !== undefined &&
        rawId !== null &&
        String(rawId).trim().length > 0
          ? String(rawId)
          : fallbackId;

      response.push({
        attachments: [],
        content,
        isDone: homework.effectue ?? false,
        dueDate: date,
        id,
        subject: subjectName,
        evaluation: false,
        custom: false,
        createdByAccount: accountId,
      });
    }
  }

  return response;
}

export async function setEDHomeworkAsDone(session: Client, homework: Homework, state?: boolean): Promise<Homework> {
  const finalState = state ?? !homework.isDone
  const homeworkId = Number(homework.id)
  
  if (finalState) {
    await session.homework.markHomeworkAsDone(homeworkId)
  } else {
    await session.homework.markHomeworkAsUndone(homeworkId)
  }
  return {
    ...homework,
    isDone: finalState
  }
}

export const weekNumberToDaysList = (weekNumber: number, year?: number): Date[] => {
  const { start } = getDateRangeOfWeek(weekNumber, year);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};