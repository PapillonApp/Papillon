import { Model, Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { Period as SharedPeriod } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import Period from "./models/Grades";

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
    const id = generateId(item.name + item.id + item.start + item.end + item.createdByAccount)
    const existing = await db.get('news').query(
      Q.where("newsId", id)
    )

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('news').create((record: Model) => {
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
      .get<Period>('news')
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