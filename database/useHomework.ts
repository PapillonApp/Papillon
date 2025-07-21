import { useEffect, useState } from "react";
import { Model, Q } from "@nozbe/watermelondb";
import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import Homework from './models/Homework';
import { Homework as SharedHomework } from "@/services/shared/homework";
import { parseJson } from "ajv/lib/runtime/parseJson";
import { Attachment } from "@/services/shared/attachment";
import { warn } from "@/utils/logger/logger";

function mapHomeworkToShared(homework: Homework): SharedHomework {
  return {
    id: homework.id,
    subject: homework.subject,
    content: homework.content,
    dueDate: new Date(homework.dueDate),
    isDone: homework.isDone,
    returnFormat: homework.returnFormat,
    attachments: parseJsonArray(homework.attachments) as Attachment[],
    evaluation: homework.evaluation,
    custom: homework.custom,
    createdByAccount: homework.createdByAccount,
  };
}

export function useHomeworkForWeek(weekNumber: number, refresh = 0) {
  const database = useDatabase();
  const [homeworks, setHomeworks] = useState<SharedHomework[]>([]);

  useEffect(() => {
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const query = database.get<Homework>('homework').query(
      Q.where('dueDate', Q.between(start.getTime(), end.getTime()))
    );

    const sub = query.observe().subscribe(homeworks =>
      setHomeworks(
        homeworks.map(mapHomeworkToShared).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      )
    );

    return () => sub.unsubscribe();
  }, [weekNumber, refresh, database]);

  return homeworks;
}

export async function getHomeworksFromCache(weekNumber: number): Promise<SharedHomework[]> {
  try {
    const database = getDatabaseInstance();
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const homeworks = await database
      .get<Homework>('homework')
      .query(Q.where('dueDate', Q.between(start.getTime(), end.getTime())))
      .fetch();

    return homeworks
      .map(mapHomeworkToShared)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

export async function useAddHomeworkToDatabase(homeworks: SharedHomework[]) {
  const db = getDatabaseInstance();

  for (const hw of homeworks) {
    const existing = await db.get('homework').query(
      Q.where('homeworkId', hw.id)
    ).fetch();

    if (existing.length > 0) continue;

    await db.write(async () => {
      await db.get('homework').create((record: Model) => {
        const homework = record as Homework;
        Object.assign(homework, {
          homeworkId: hw.id,
          subjectId: hw.subject,
          content: hw.content,
          dueDate: hw.dueDate.getTime(),
          isDone: hw.isDone,
          returnFormat: hw.returnFormat,
          attachments: JSON.stringify(hw.attachments),
          evaluation: hw.evaluation,
          custom: hw.custom,
          createdByAccount: hw.createdByAccount,
        });
      });
    });
  }
}

export function getDateRangeOfWeek(weekNumber: number, year = new Date().getFullYear()) {
  const janFirst = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  const weekStart = new Date(janFirst.setDate(janFirst.getDate() + daysOffset));
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day <= 4 ? 1 : 8);
  const start = new Date(weekStart.setDate(diff));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function parseJsonArray(s: string, pos = 0): unknown[] {
  const result = parseJson(s, pos);
  return Array.isArray(result) ? result : [];
}
