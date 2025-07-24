import { Model, Q } from "@nozbe/watermelondb";
import { parseJson } from "ajv/lib/runtime/parseJson";
import { useEffect, useState } from "react";

import { Attachment } from "@/services/shared/attachment";
import { Grade as SharedGrade, Period as SharedPeriod, PeriodGrades as SharedPeriodGrades } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";
import { error, warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import { Grade, Period, PeriodGrades } from "./models/Grades";
import { mapSubjectToShared } from "./useSubject";

export function usePeriods(refresh = 0) {
  const database = useDatabase();
  const [periods, setPeriods] = useState<SharedPeriod[]>([]);

  useEffect(() => {

    const query = database.get<Period>('periods').query();

    const sub = query.observe().subscribe(news =>
      setPeriods(
        news.map(mapPeriodToShared).sort((a, b) => a.end.getTime() - b.end.getTime())
      )
    );

    return () => sub.unsubscribe();
  }, [refresh, database]);

  return periods;
}

export async function addPeriodsToDatabase(periods: SharedPeriod[]) {
  const db = getDatabaseInstance();
  for (const item of periods) {
    const id = generateId(item.name + item.createdByAccount)
    const existing = await db.get('periods').query(
      Q.where("id", id)
    )

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('periods').create((record: Model) => {
        const period = record as Period;
        Object.assign(period, {
          id: id,
          name: item.name,
          createByAccount: item.createdByAccount,
          start: item.start.getTime(),
          end: item.end.getTime()
        })
      })
    })
  }
}

export async function getPeriodsFromCache(): Promise<SharedPeriod[]> {
  try {
    const database = getDatabaseInstance();

    const period = await database
      .get<Period>('periods')
      .query()
      .fetch();

    return period
      .map(mapPeriodToShared)
      .sort((a, b) => a.end.getTime() - b.end.getTime());
  } catch (e) {
    warn(String(e));
    return [];
  }
}

export async function addGradesToDatabase(grades: SharedGrade[], subject: string) {
  const db = getDatabaseInstance();
  for (const item of grades) {
    const id = generateId(item.createdByAccount + item.description + item.givenAt + item.studentScore.value)
    const existing = await db.get('grades').query(
      Q.where("id", id)
    )

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('grades').create((record: Model) => {
        const grade = record as Grade
        Object.assign(grade, {
          id: id,
          createdByAccount: item.createdByAccount,
          subjectId: generateId(subject),
          description: item.description,
          givenAt: item.givenAt.getTime(),
          subjectFiles: JSON.stringify(item.subjectFile),
          correctionFile: JSON.stringify(item.correctionFile),
          bonus: item.bonus,
          optional: item.optional,
          outOf: item.outOf,
          coefficient: item.coefficient,
          studentScore: item.studentScore,
          averageScore: item.averageScore,
          minScore: item.minScore,
          maxScore: item.maxScore
        })
      })
    })
  }
}

export async function addPeriodGradesToDatabase(item: SharedPeriodGrades, period: string) {
  const db = getDatabaseInstance();
  const id = generateId(period + item.createdByAccount);

  const existing = await db.get('periodgrades').query(
    Q.where("id", id)
  ).fetch();

  await db.write(async () => {
    if (existing.length > 0) {
      await existing[0].update((record: Model) => {
        const periodGrade = record as PeriodGrades;
        Object.assign(periodGrade, {
          createdByAccount: item.createdByAccount,
          studentOverall: item.studentOverall,
          classAverage: item.classAverage
        });
      });
    } else {
      await db.get('periodgrades').create((record: Model) => {
        const periodGrade = record as PeriodGrades;
        Object.assign(periodGrade, {
          id: id,
          createdByAccount: item.createdByAccount,
          studentOverall: item.studentOverall,
          classAverage: item.classAverage
        });
      });
    }
  });
}

function mapPeriodToShared(period: Period): SharedPeriod {
  return {
    name: period.name,
    id: period.id,
    start: new Date(period.start),
    end: new Date(period.end),
    createdByAccount: period.createdByAccount,
    fromCache: true
  }
}

export function mapGradeToShared(grade: Grade): SharedGrade {
  return {
    id: grade.id,
    subjectId: grade.subjectId ?? "",
    description: grade.description,
    givenAt: new Date(grade.givenAt),
    subjectFile: parseJson(grade.subjectFile ?? "", 0) as Attachment,
    correctionFile: parseJson(grade.correctionFile ?? "", 0) as Attachment,
    bonus: grade.bonus,
    optional: grade.optional,
    outOf: grade.outOf,
    coefficient: grade.coefficient,
    studentScore: grade.studentScore,
    averageScore: grade.averageScore,
    minScore: grade.minScore,
    maxScore: grade.maxScore,
    fromCache: true,
    createdByAccount: grade.createdByAccount
  }
}

export async function getGradePeriodsFromCache(period: string): Promise<SharedPeriodGrades> {
  try {
    const database = getDatabaseInstance();
    const id = generateId(period)
    const periodgrades = await database
      .get<PeriodGrades>('periodgrades')
      .query(Q.where('id', id))
      .fetch();

    return mapPeriodGradesToShared(periodgrades[0])
  } catch (e) {
    error(String(e));
  }
}

function mapPeriodGradesToShared(data: PeriodGrades): SharedPeriodGrades {
  return {
    studentOverall: data.studentOverall,
    classAverage: data.classAverage,
    subjects: data.subjects.map(mapSubjectToShared),
    createdByAccount: data.createdByAccount
  }
}