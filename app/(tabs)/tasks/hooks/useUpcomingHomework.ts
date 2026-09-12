import { useEffect, useMemo, useState } from "react";

import { useDatabase } from "@/database/DatabaseProvider";
import { useHomeworkForWeeks } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";
import { useAccountStore } from "@/stores/account";

import { getCurrentWeekIndex } from "../utils/weekGrid";

const DEFAULT_WEEK_COUNT = 3;

// A sync writes homework row by row; coalescing keeps that from re-reading
// every week of cache once per write.
const REFRESH_COALESCE_MS = 120;

export type UpcomingHomework = {
  /** Undone homework due from today onwards, earliest first. */
  upcoming: Homework[];
  weekDone: number;
  weekTotal: number;
};

/**
 * Homework read straight from the database — what is still due, plus how far
 * through the current week the user is. Unlike the tasks screen hook it never
 * fetches, so it is safe to mount outside of the tasks tab.
 */
export const useUpcomingHomework = (weekCount = DEFAULT_WEEK_COUNT): UpcomingHomework => {
  const database = useDatabase();
  const [refresh, setRefresh] = useState(0);
  // `getCurrentWeekIndex`, not `getWeekNumberFromDate`: the latter counts weeks
  // from Sunday and so names the next one on a Sunday. This is the numbering the
  // tasks screen, its pager and the homework cache all share.
  const [currentWeek] = useState(() => getCurrentWeekIndex());

  const weeks = useMemo(
    () => Array.from({ length: weekCount }, (_, index) => currentWeek + index),
    [currentWeek, weekCount]
  );

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);
  const services = useMemo(
    () => account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );

  const homeworkByWeek = useHomeworkForWeeks(weeks, refresh);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const subscription = database
      .get("homework")
      .query()
      .observeWithColumns(["isDone", "dueDate"])
      .subscribe(() => {
        if (timer) {
          return;
        }

        timer = setTimeout(() => {
          timer = null;
          setRefresh((previous) => previous + 1);
        }, REFRESH_COALESCE_MS);
      });

    return () => {
      subscription.unsubscribe();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [database]);

  return useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // The cache can hold the same homework more than once — concurrent week
    // fetches race in `addHomeworkToDatabase`, which checks for an existing row
    // outside the write it then performs. The tasks screen drops the repeats in
    // `buildHomeworkSections`; counting them here is what made the widget
    // disagree with the screen.
    const mine = (list: Homework[]) => {
      const seen = new Set<string>();
      return list.filter((homework) => {
        if (!services.includes(homework.createdByAccount)) {
          return false;
        }
        if (!homework.id) {
          return true;
        }
        if (seen.has(homework.id)) {
          return false;
        }
        seen.add(homework.id);
        return true;
      });
    };

    const thisWeek = mine(homeworkByWeek[currentWeek] ?? []);

    return {
      upcoming: Object.values(homeworkByWeek)
        .flatMap(mine)
        .filter(
          (homework) =>
            !homework.isDone && homework.dueDate.getTime() >= startOfToday.getTime()
        )
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
      weekDone: thisWeek.filter((homework) => homework.isDone).length,
      weekTotal: thisWeek.length
    };
  }, [homeworkByWeek, services, currentWeek]);
};
