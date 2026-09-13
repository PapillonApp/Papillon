import { useCallback, useRef, useState } from "react";

import { useManagerSubscription } from "@/hooks/useManagerSubscription";
import type { AccountManager } from "@/services/shared";
import { getManager } from "@/services/shared";
import { Period } from "@/services/shared/grade";
import { Capabilities, ServiceFailure } from "@/services/shared/types";
import { useSettingsStore } from "@/stores/settings";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { warn } from "@/utils/logger/logger";

export interface UsePeriodsDataResult {
  /** All periods available for the account, "Trimestre"/"Semestre" first, chronological. */
  periods: Period[];
  /** The selected period. Defaults to whatever is "now", or the last period the user picked. */
  currentPeriod: Period | undefined;
  /** Select a period. Persisted so it's restored the next time this hook is used. */
  setCurrentPeriod: (period: Period) => void;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  failures: ServiceFailure[];
  refresh: () => Promise<void>;
}

/** "Trimestre"/"Semestre" periods first (chronologically), everything else (mock exams,
 * whole year, ...) pushed to the end. */
const sortPeriods = (periods: Period[]): Period[] =>
  [...periods].sort((a, b) => {
    const isAKey = a.name.startsWith("Semestre") || a.name.startsWith("Trimestre");
    const isBKey = b.name.startsWith("Semestre") || b.name.startsWith("Trimestre");

    if (isAKey && !isBKey) { return -1; }
    if (!isAKey && isBKey) { return 1; }

    return a.start.getTime() - b.start.getTime();
  });

/**
 * Fetches and exposes every grade period for the current account, along with a
 * currently-selected period (remembered across sessions).
 *
 * Pair with `useGradesData(currentPeriod)` to get the grades for that period.
 */
export function usePeriodsData(): UsePeriodsDataResult {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriodState] = useState<Period | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [failures, setFailures] = useState<ServiceFailure[]>([]);

  const savedPeriodName = useSettingsStore(state => state.personalization.gradesPeriodName);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);

  // Avoids re-applying the saved period every time the periods list is refreshed
  // once the user has actively picked one for this session.
  const hasUserSelection = useRef(false);

  const fetchPeriods = useCallback(async (managerToUse: AccountManager, isRefresh = false) => {
    if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
    setError(null);
    setFailures([]);

    try {
      const result = await managerToUse.getGradesPeriods();
      setFailures(managerToUse.getFailures(Capabilities.GRADES));
      const sorted = sortPeriods(result);
      setPeriods(sorted);

      setCurrentPeriodState(prev => {
        // Keep the current selection alive if it still exists in the new list.
        if (prev) {
          const stillThere = sorted.find(p => p.id === prev.id);
          if (stillThere) { return stillThere; }
        }

        if (!hasUserSelection.current && savedPeriodName) {
          const saved = sorted.find(p => p.name === savedPeriodName);
          if (saved) { return saved; }
        }

        return sorted.length > 0 ? getCurrentPeriod(sorted) : undefined;
      });
    } catch (e) {
      warn(String(e), "usePeriodsData");
      setFailures(managerToUse.getFailures(Capabilities.GRADES));
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [savedPeriodName]);

  const handleManager = useCallback((manager: AccountManager) => {
    fetchPeriods(manager);
  }, [fetchPeriods]);

  // Nothing else ever ends the load if no manager turns up, so the spinner
  // would stay on screen indefinitely.
  const handleManagerUnavailable = useCallback(() => {
    setLoading(false);
    setRefreshing(false);
    setError(new Error("Account manager unavailable"));
  }, []);

  useManagerSubscription(handleManager, handleManagerUnavailable);

  const setCurrentPeriod = useCallback((period: Period) => {
    hasUserSelection.current = true;
    setCurrentPeriodState(period);

    if (period.name && period.name !== savedPeriodName) {
      mutateSettings("personalization", { gradesPeriodName: period.name });
    }
  }, [mutateSettings, savedPeriodName]);

  const refresh = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      // A pull-to-refresh has to end in something the user can see.
      setRefreshing(false);
      setError(new Error("Account manager unavailable"));
      return;
    }
    await fetchPeriods(manager, true);
  }, [fetchPeriods]);

  return {
    periods,
    currentPeriod,
    setCurrentPeriod,
    loading,
    refreshing,
    error,
    failures,
    refresh,
  };
}
