import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AccountManager } from "@/services/shared";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Grade, GradeScore, Period, PeriodGrades, Subject } from "@/services/shared/grade";
import type { Kid } from "@/services/shared/kid";
import { ScoreProperty } from "@/utils/grades/algorithms/helpers";
import PapillonMedian from "@/utils/grades/algorithms/median";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonGradesAveragesOverTime from "@/utils/grades/algorithms/time";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import { warn } from "@/utils/logger/logger";

/** Average calculation methods available to build a "how did it evolve" history. */
export type AverageMethodKey = "subject" | "weighted" | "median";

const AVERAGE_ALGORITHMS: Record<AverageMethodKey, (grades: Grade[], key?: ScoreProperty) => number> = {
  // Average of each subject's average — the closest to what's shown on a report card.
  subject: PapillonSubjectAvg,
  // Every grade weighted by its coefficient, subjects ignored.
  weighted: PapillonWeightedAvg,
  // Median of every normalized (/20) grade.
  median: grades => PapillonMedian(grades),
};

const ALL_METHODS: AverageMethodKey[] = ["subject", "weighted", "median"];

export interface AverageHistoryPoint {
  date: Date;
  average: number;
}

export interface PeriodAverages {
  /** The student's overall average for the period, as given by the service. */
  student: GradeScore | null;
  /** The class' overall average for the period, as given by the service. */
  class: GradeScore | null;
  /** The lowest of all subjects' "class minimum" average. */
  min: GradeScore | null;
  /** The highest of all subjects' "class maximum" average. */
  max: GradeScore | null;
}

export interface UseGradesDataOptions {
  /** The kid to fetch grades for, on multi-kid accounts. */
  kid?: Kid;
  /** Which average calculation methods to compute a history for. Defaults to all of them. */
  methods?: AverageMethodKey[];
}

export interface UseGradesDataResult {
  /** Subjects for the period, each with its grades and averages already attached. */
  subjects: Subject[];
  /** Every grade of the period, flattened across subjects, most recent first. */
  grades: Grade[];
  averages: PeriodAverages;
  isAverageServiceProvided: boolean;
  rank: GradeScore | null;
  features: Record<string, any> | undefined;
  /** Average history for the student, one entry per requested calculation method. */
  history: Partial<Record<AverageMethodKey, AverageHistoryPoint[]>>;
  getSubjectById: (id: string) => Subject | undefined;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const isUsableScore = (score?: GradeScore | null): score is GradeScore =>
  !!score && !score.disabled && typeof score.value === "number" && !Number.isNaN(score.value);

const sortGradesByDateDesc = (grades: Grade[]): Grade[] =>
  [...grades].sort((a, b) => (b.givenAt?.getTime() ?? 0) - (a.givenAt?.getTime() ?? 0));

/**
 * Fetches and exposes everything needed to show a period's grades: subjects (with
 * their grades and averages), period-level averages, and average history per
 * calculation method. Results are cached per period and stale responses (e.g. from
 * quickly switching periods) are discarded.
 *
 * Pair with `usePeriodsData()` to get the period to pass in.
 */
export function useGradesData(
  period: Period | undefined,
  options: UseGradesDataOptions = {}
): UseGradesDataResult {
  const { kid } = options;
  const methods = options.methods ?? ALL_METHODS;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rank, setRank] = useState<GradeScore | null>(null);
  const [features, setFeatures] = useState<Record<string, any> | undefined>(undefined);
  const [serviceAverages, setServiceAverages] = useState<{ student: GradeScore | null; class: GradeScore | null }>({
    student: null,
    class: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Avoids re-fetching a period that's already been loaded once.
  const cacheRef = useRef<Map<string, PeriodGrades>>(new Map());
  // Discards responses from a period we've since navigated away from.
  const requestIdRef = useRef(0);

  const applyResult = useCallback((result: PeriodGrades | undefined) => {
    const rankScore = result?.rank;
    const studentScore = result?.studentOverall;
    const classScore = result?.classAverage;

    setSubjects(
      (result?.subjects ?? []).map(subject => ({
        ...subject,
        grades: sortGradesByDateDesc(subject.grades ?? []),
      }))
    );
    setRank(isUsableScore(rankScore) ? rankScore : null);
    setFeatures(result?.features);
    setServiceAverages({
      student: isUsableScore(studentScore) ? studentScore : null,
      class: isUsableScore(classScore) ? classScore : null,
    });
  }, []);

  const fetchGrades = useCallback(
    async (managerToUse: AccountManager, targetPeriod: Period, isRefresh = false) => {
      const cacheKey = `${targetPeriod.id ?? targetPeriod.name}:${kid?.id ?? ""}`;
      const requestId = ++requestIdRef.current;

      if (!isRefresh && cacheRef.current.has(cacheKey)) {
        applyResult(cacheRef.current.get(cacheKey));
        setLoading(false);
        setError(null);
        return;
      }

      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      setError(null);

      try {
        const result = await managerToUse.getGradesForPeriod(
          targetPeriod,
          targetPeriod.createdByAccount,
          kid
        );

        if (requestId !== requestIdRef.current) { return; } // A newer request has taken over.

        cacheRef.current.set(cacheKey, result);
        applyResult(result);
      } catch (e) {
        if (requestId !== requestIdRef.current) { return; }
        warn(String(e), "useGradesData");
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [applyResult, kid]
  );

  useEffect(() => {
    if (!period) {
      requestIdRef.current++;
      applyResult(undefined);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeManagerUpdate(manager => {
      fetchGrades(manager, period);
    });

    return unsubscribe;
  }, [period, fetchGrades, applyResult]);

  const refresh = useCallback(async () => {
    const manager = getManager();
    if (!manager || !period) { return; }
    await fetchGrades(manager, period, true);
  }, [fetchGrades, period]);

  const grades = useMemo(() => sortGradesByDateDesc(subjects.flatMap(s => s.grades ?? [])), [subjects]);

  const getSubjectById = useCallback(
    (id: string) => subjects.find(subject => subject.id === id),
    [subjects]
  );

  const averages = useMemo<PeriodAverages>(() => {
    const minimums = subjects.map(s => s.minimum).filter(isUsableScore);
    const maximums = subjects.map(s => s.maximum).filter(isUsableScore);

    const min = minimums.length > 0
      ? minimums.reduce((lowest, score) => (score.value < lowest.value ? score : lowest))
      : null;
    const max = maximums.length > 0
      ? maximums.reduce((highest, score) => (score.value > highest.value ? score : highest))
      : null;

    return {
      student: serviceAverages.student,
      class: serviceAverages.class,
      min,
      max
    };
  }, [subjects, serviceAverages]);

  const history = useMemo(() => {
    const result: Partial<Record<AverageMethodKey, AverageHistoryPoint[]>> = {};
    if (grades.length === 0) { return result; }

    for (const method of methods) {
      const algorithm = AVERAGE_ALGORITHMS[method];
      if (!algorithm) { continue; }

      try {
        // The algorithm sorts its input in place, so hand it a copy.
        const points = PapillonGradesAveragesOverTime(algorithm, [...grades], "studentScore");

        // For the "subject" method, append the service's own overall average as the
        // most recent point — it's the one actually shown on the report card.
        if (method === "subject" && serviceAverages.student) {
          points.push({ average: serviceAverages.student.value, date: new Date() });
        }

        result[method] = points;
      } catch (e) {
        warn(String(e), "useGradesData:history");
        result[method] = [];
      }
    }

    return result;
  }, [grades, methods, serviceAverages.student]);

  return {
    subjects,
    grades,
    averages,
    isAverageServiceProvided: serviceAverages.student !== null || serviceAverages.class !== null,
    rank,
    features,
    history,
    getSubjectById,
    loading,
    refreshing,
    error,
    refresh,
  };
}
