import { Model, Q } from "@nozbe/watermelondb";
import { createMMKV } from "react-native-mmkv";

import { Grade as SharedGrade, Period as SharedPeriod, PeriodGrades as SharedPeriodGrades } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";
import { error, warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapPeriodToShared } from "./mappers/grade";
import { Grade, Period } from "./models/Grades";
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

    if (existing.length === 0) {
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

// ponytail: the whole PeriodGrades as JSON in MMKV. The periodgrades/subjects
// tables were never filled with subjects or grades, so they could not serve as a cache.
const periodGradesCache = createMMKV({ id: "period-grades-cache" });

export function cachePeriodGrades(item: SharedPeriodGrades, key: string) {
  periodGradesCache.set(key, JSON.stringify(item));
}

export function getCachedPeriodGrades(key: string): SharedPeriodGrades | null {
  const raw = periodGradesCache.getString(key);
  if (!raw) { return null; }

  try {
    return JSON.parse(raw, (k, v) => (k === "givenAt" && typeof v === "string" ? new Date(v) : v));
  } catch {
    periodGradesCache.remove(key);
    return null;
  }
}