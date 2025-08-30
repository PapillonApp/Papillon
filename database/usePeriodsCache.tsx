import { useEffect, useMemo, useState } from "react"
import { Grade, Period } from "./models/Grades"
import { getDatabaseInstance, useDatabase } from "./DatabaseProvider";
import { useAccountStore } from "@/stores/account";
import { Q } from "@nozbe/watermelondb";

export function usePeriods() {
  const database = useDatabase()
  const [periods, setPeriods] = useState<any[]>([])

  const store = useAccountStore.getState();

  useEffect(() => {
    const collection = database.get<Period>("periods")

    // Load existing rows from cache
    setPeriods(Array.from(collection._cache.map.values()).map((model) => model._raw).filter((row) => row.createdByAccount === store.lastUsedAccount))

    // Observe future updates
    const subscription = collection
      .query(
        Q.where("createdByAccount", store.lastUsedAccount)
      )
      .observe()
      .subscribe((rows) => {
        setPeriods(
          rows.map((row) => ({
            ...row._raw,
            start: new Date(row.start),
            end: new Date(row.end),
          }))
        );
      });

    // update all periods to change start to new Date(start)
    setPeriods((prevPeriods) =>
      prevPeriods.map((period) => ({
        ...period,
        start: new Date(period.start),
        end: new Date(period.end),
      }))
    );

    return () => subscription.unsubscribe()
  }, [database])

  return periods;
}