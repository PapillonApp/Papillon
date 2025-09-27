import { Model, Q } from "@nozbe/watermelondb";

import { Grade as SharedGrade, Period as SharedPeriod, PeriodGrades as SharedPeriodGrades } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";
import { error, warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapPeriodGradesToShared,mapPeriodToShared } from "./mappers/grade";
import { Grade, Period, PeriodGrades } from "./models/Grades";
import { safeWrite } from "./utils/safeTransaction";

export async function addPeriodsToDatabase(periods: SharedPeriod[]) {
  const db = getDatabaseInstance();

  await safeWrite(db, async () => {
    for (const item of periods) {
      const id = generateId(item.name + item.createdByAccount);

      const existing = await db.get('periods')
        .query(Q.where("periodId", id))
        .fetch();

      if (existing.length === 0) {
        await db.get('periods').create((record: Model) => {
          const period = record as Period;
          Object.assign(period, {
            periodId: id,
            name: item.name,
            createdByAccount: item.createdByAccount,
            start: item.start.getTime(),
            end: item.end.getTime(),
          });
        });
      }
    }
  }, 10000, 'addPeriodsToDatabase');
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
    const id = generateId(item.createdByAccount + item.description + item.givenAt)

    const existing = await db.get('grades').query(Q.where('gradeId', id)).fetch();

    if(existing.length === 0) {
      await safeWrite(db, async () => {
        await db.get('grades').create((record: Model) => {
          const grade = record as Grade
          Object.assign(grade, {
            gradeId: id,
            createdByAccount: item.createdByAccount,
            subjectName: item.subjectName,
            subjectId: generateId(subject),
            description: item.description,
            givenAt: item.givenAt.getTime(),
            subjectFile: JSON.stringify(item.subjectFile),
            correctionFile: JSON.stringify(item.correctionFile),
            bonus: item.bonus,
            optional: item.optional,
            outOf: JSON.stringify(item.outOf),
            coefficient: item.coefficient,
            studentScore: JSON.stringify(item.studentScore),
            averageScore: JSON.stringify(item.averageScore),
            minScore: JSON.stringify(item.minScore),
            maxScore: JSON.stringify(item.maxScore)
          })
        })
      }, 10000, 'addGradesToDatabase')
    }
  }
}

export async function addPeriodGradesToDatabase(item: SharedPeriodGrades, period: string) {
  const db = getDatabaseInstance();
  const id = generateId(period + item.createdByAccount);

  const existing = await db.get('periodgrades').query(
    Q.where("id", id)
  ).fetch();

  await safeWrite(db, async () => {
    if (existing.length > 0) {
      await existing[0].update((record: Model) => {
        const periodGrade = record as PeriodGrades;
        Object.assign(periodGrade, {
          createdByAccount: item.createdByAccount,
          studentOverallRaw: JSON.stringify(item.studentOverall),
          classAverageRaw: JSON.stringify(item.classAverage)
        });
      });
    } else {
      await db.get('periodgrades').create((record: Model) => {
        const periodGrade = record as PeriodGrades;
        Object.assign(periodGrade, {
          id: id,
          createdByAccount: item.createdByAccount,
          studentOverallRaw: JSON.stringify(item.studentOverall),
          classAverageRaw: JSON.stringify(item.classAverage)
        });
      });
    }
  }, 10000, 'addPeriodGradesToDatabase');
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
