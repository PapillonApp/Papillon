
import { Client } from "@blockshub/blocksdirecte";
import { addDays, format } from "date-fns";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { warn } from "@/utils/logger/logger";

import { Homework } from "../shared/homework";

type EDHomework = {
  idDevoir?: number;
  contenu?: string;
  effectue?: boolean;
};

type EDHomeworkSubject = {
  matiere?: string;
  entityLibelle?: string;
  interrogation?: boolean;
  aFaire?: EDHomework;
};

export async function fetchEDHomeworks(
  session: Client,
  accountId: string,
  weekNumber: number
): Promise<Homework[]> {
  const { start } = getDateRangeOfWeek(weekNumber);
  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const response: Homework[] = [];
  let lastError: unknown;

  for (const date of weekdays) {
    try {
      const payload = await session.homework.getHomeworksForDate(formatDate(date));
      const subjects = getHomeworkSubjects(payload);

      for (const subject of subjects) {
        const homework = subject.aFaire;
        if (!homework) {
          continue;
        }

        response.push({
          attachments: [],
          content: homework.contenu ?? "",
          isDone: homework.effectue ?? false,
          dueDate: date,
          id: String(homework.idDevoir),
          subject: subject.matiere && subject.matiere.length > 0
            ? subject.matiere
            : (subject.entityLibelle ?? ""),
          evaluation: subject.interrogation ?? false,
          custom: false,
          createdByAccount: accountId
        });
      }
    } catch (error) {
      lastError = error;
      warn(`ED homework fetch failed for ${formatDate(date)}: ${String(error)}`, "fetchEDHomeworks");
    }
  }

  if (response.length === 0 && lastError) {
    throw lastError;
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

function getHomeworkSubjects(payload: unknown): EDHomeworkSubject[] {
  if (Array.isArray(payload)) {
    return payload as EDHomeworkSubject[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const matieres = (payload as { matieres?: unknown }).matieres;
  if (Array.isArray(matieres)) {
    return matieres as EDHomeworkSubject[];
  }

  if (matieres && typeof matieres === "object") {
    return Object.values(matieres as Record<string, unknown>) as EDHomeworkSubject[];
  }

  const values = Object.values(payload as Record<string, unknown>);
  if (values.some(item => item && typeof item === "object" && ("aFaire" in item || "matiere" in item))) {
    return values.filter(item => item && typeof item === "object") as EDHomeworkSubject[];
  }

  return [];
}
