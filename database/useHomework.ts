import { useCallback, useEffect, useState } from "react";
import { Model, Q } from "@nozbe/watermelondb";
import { useDatabase } from './DatabaseProvider';
import Homework from './models/Homework';
import { Homework as SharedHomework } from "@/services/shared/homework";
import { parseJson } from "ajv/lib/runtime/parseJson";
import { Attachment } from "@/services/shared/attachment";

export function useHomeworkForWeek(weekNumber: number, refresh = 0) {
  const database = useDatabase();
  const [homeworksWithSubjects, setHomeworksWithSubjects] = useState<SharedHomework[]>([]);

  useEffect(() => {
    const { start, end } = getDateRangeOfWeek(weekNumber);

    const query = database.get<Homework>('homework').query(
      Q.where('dueDate', Q.between(start.getTime(), end.getTime()))
    );

    const subscription = query.observe().subscribe((homeworks) => {
      const homeworksWithSubjects: SharedHomework[] = homeworks.map(homework => ({
        id: homework.id,
        subject: homework.subject,
        content: homework.content,
        dueDate: new Date(homework.dueDate),
        isDone: homework.isDone,
        returnFormat: homework.returnFormat,
        attachments: parseJsonArray(homework.attachments) as unknown as Attachment[],
        evaluation: homework.evaluation,
        custom: homework.custom,
        createdByAccount: homework.createdByAccount,
      }));
      setHomeworksWithSubjects(homeworksWithSubjects.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
    });

    return () => subscription.unsubscribe();
  }, [weekNumber, refresh, database]);

  return homeworksWithSubjects;
}

export function useAddHomeworkToDatabase() {
  const database = useDatabase();

  return useCallback(async (givenHomework: SharedHomework) => {
    await database.write(async () => {
      await database.get('homework').create((record: Model) => {
        const homework = record as Homework;

        homework.createdByAccount = givenHomework.createdByAccount;
        homework.homeworkId = givenHomework.id;
        homework.subjectId = givenHomework.subject;
        homework.content = givenHomework.content;
        homework.dueDate = givenHomework.dueDate.getTime();
        homework.isDone = givenHomework.isDone;
        homework.returnFormat = givenHomework.returnFormat;
        homework.attachments = JSON.stringify(givenHomework.attachments);
        homework.evaluation = givenHomework.evaluation;
        homework.custom = givenHomework.custom;
      });
    });
  }, [database]);
}

export function getDateRangeOfWeek(weekNumber: number, year: number = new Date().getFullYear()) {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dayOfWeek = simple.getDay();
  const ISOweekStart = new Date(simple);
  if (dayOfWeek <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  ISOweekStart.setHours(0, 0, 0, 0);
  ISOweekEnd.setHours(23, 59, 59, 999);
  return { start: ISOweekStart, end: ISOweekEnd };
}

export function parseJsonArray(s: string, pos: number = 0): unknown[] {
  const result = parseJson(s, pos)
  if (Array.isArray(result)) {
    return result
  }
  return []
}