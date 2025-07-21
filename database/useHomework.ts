import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from './DatabaseProvider';
import Homework from './models/Homework';
import { Homework as SharedHomework } from "@/services/shared/homework";
import { parseJson } from "ajv/lib/runtime/parseJson";
import { Attachment } from "@/services/shared/attachment";

export function useHomeworkForDay(date: Date, refresh = 0) {
  const database = useDatabase();
  const [homeworksWithSubjects, setHomeworksWithSubjects] = useState<SharedHomework[]>([]);

  useEffect(() => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = database.get<Homework>('homework').query(
      Q.where('dueDate', Q.between(startOfDay.getTime(), endOfDay.getTime()))
    );

    const subscription = query.observe().subscribe(async (homeworks) => {
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
  }, [date, refresh]);

  return homeworksWithSubjects;
}

export function parseJsonArray(s: string, pos: number = 0): unknown[] {
  const result = parseJson(s, pos)
  if (Array.isArray(result)) {
    return result
  }
  return []
}
