import { Model, Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { Attachment } from "@/services/shared/attachment";
import { Homework as SharedHomework } from "@/services/shared/homework";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import Homework from "./models/Homework";
import { safeWrite } from "./utils/safeTransaction";

function mapHomeworkToShared(homework: Homework): SharedHomework {
  return {
    id: homework.homeworkId,
    subject: homework.subject,
    content: homework.content,
    dueDate: new Date(homework.dueDate),
    isDone: homework.isDone,
    returnFormat: homework.returnFormat,
    attachments: parseJsonArray(homework.attachments) as Attachment[],
    evaluation: homework.evaluation,
    custom: homework.custom,
    createdByAccount: homework.createdByAccount,
    kidName: homework.kidName,
    fromCache: true,
  };
}

export function useHomeworkForWeek(weekNumber: number, refresh = 0) {
  const database = useDatabase();
  const [homeworks, setHomeworks] = useState<SharedHomework[]>([]);

  useEffect(() => {
    const fetchHomeworks = async () => {
      const homeworksFetched = await getHomeworksFromCache(weekNumber);
      setHomeworks(homeworksFetched);
    };
    fetchHomeworks();
  }, [weekNumber, refresh, database]);

  return homeworks;
}

export async function getHomeworksFromCache(
  weekNumber: number
): Promise<SharedHomework[]> {
  try {
    const database = getDatabaseInstance();
    const { start, end } = getDateRangeOfWeek(weekNumber);
    const homeworks = await database
      .get<Homework>("homework")
      .query(Q.where("dueDate", Q.between(start.getTime(), end.getTime())))
      .fetch();

    return homeworks
      .map(mapHomeworkToShared)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

export async function addHomeworkToDatabase(homeworks: SharedHomework[]) {
  const db = getDatabaseInstance();

  const weekNumber = getWeekNumberFromDate(homeworks[0].dueDate);
  const { start, end } = getDateRangeOfWeek(weekNumber);
  const dbHomeworks = await db.get<Homework>("homework")
    .query(Q.where("dueDate", Q.between(start.getTime(), end.getTime())))
    .fetch();

  const homeworkIds: string[] = [];
  for (const hw of homeworks) {
    const oldId = generateId(hw.subject + hw.content + hw.createdByAccount);
    const id = generateId(
      hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
    );

    homeworkIds.push(oldId, id);
  }

  const homeworksToDelete = dbHomeworks.filter(
    dbHomeworks => !homeworkIds.includes(dbHomeworks.homeworkId)
  );

  for (const homework of homeworksToDelete) {
    await homework.markAsDeleted();
  }

  for (const hw of homeworks) {
    const oldId = generateId(hw.subject + hw.content + hw.createdByAccount);
    const id = generateId(
      hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
    );

    const existing = await db
      .get("homework")
      .query(Q.where("homeworkId", id))
      .fetch();
    const oldExisting = await db
      .get("homework")
      .query(Q.where("homeworkId", oldId))
      .fetch();

    for (const oldRecord of oldExisting) {
      await oldRecord.markAsDeleted();
    }

    if (existing.length === 0) {
      await safeWrite(
        db,
        async () => {
          await db.get("homework").create((record: Model) => {
            const homework = record as Homework;
            Object.assign(homework, {
              homeworkId: id,
              subject: hw.subject,
              content: hw.content,
              dueDate: hw.dueDate.getTime(),
              isDone: hw.isDone,
              returnFormat: hw.returnFormat,
              attachments: JSON.stringify(hw.attachments),
              evaluation: hw.evaluation,
              custom: hw.custom,
              createdByAccount: hw.createdByAccount,
              kidName: hw.kidName,
              fromCache: true,
            });
          });
        },
        10000,
        "addHomeworkToDatabase"
      );
    } else {
      const recordToUpdate = existing[0];
      await safeWrite(
        db,
        async () => {
          await recordToUpdate.update((record: Model) => {
            const homework = record as Homework;
            Object.assign(homework, {
              subject: hw.subject,
              content: hw.content,
              dueDate: hw.dueDate.getTime(),
              isDone: hw.isDone,
              returnFormat: hw.returnFormat,
              attachments: JSON.stringify(hw.attachments),
              evaluation: hw.evaluation,
              custom: hw.custom,
              createdByAccount: hw.createdByAccount,
              kidName: hw.kidName,
              fromCache: true,
            });
          });
        },
        10000,
        "updateHomeworkToDatabase"
      );
    }
  }
}

export async function updateHomeworkIsDone(
  homeworkId: string,
  isDone: boolean
) {
  const db = getDatabaseInstance();

  const existing = await db
    .get("homework")
    .query(Q.where("homeworkId", homeworkId))
    .fetch();

  if (existing.length === 0) {
    warn(`Homework with ID ${homeworkId} not found`);
    return;
  }

  const recordToUpdate = existing[0];

  await safeWrite(
    db,
    async () => {
      await recordToUpdate.update((record: Model) => {
        const homework = record as Homework;
        homework.isDone = isDone;
      });
    },
    10000,
    "updateHomeworkIsDone"
  );
}

export function getDateRangeOfWeek(
  weekNumber: number,
  year = new Date().getFullYear()
) {
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

export function parseJsonArray(s: string): unknown[] {
  try {
    const result = JSON.parse(s);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export function getWeekNumberFromDate(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}
