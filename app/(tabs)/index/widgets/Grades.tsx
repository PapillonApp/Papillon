import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Period, Subject as SharedSubject } from "@/services/shared/grade";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { error } from "@/utils/logger/logger";
import Averages from "../../grades/atoms/Averages";

const PERIODS_TTL_MS = 5 * 60 * 1000;
const GRADES_TTL_MS = 5 * 60 * 1000;

const periodsCache = new Map<
  string,
  {
    fetchedAt: number;
    value?: Period;
    inFlight?: Promise<Period | undefined>;
  }
>();

const gradesCache = new Map<
  string,
  {
    fetchedAt: number;
    subjects: SharedSubject[];
    serviceAverage?: number;
    inFlight?: Promise<{
      subjects: SharedSubject[];
      serviceAverage?: number;
    }>;
  }
>();

type GradesWidgetProps = {
  accent?: string;
  header?: boolean;
  algorithm?: "subject" | "weighted" | "median";
  period?: Period;
  onEmptyStateChange?: (isEmpty: boolean) => void;
};

const GradesWidget = ({ period, onEmptyStateChange }: GradesWidgetProps) => {
  try {
    const manager = getManager();

    const [subjects, setSubjects] = useState<SharedSubject[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<Period | undefined>(period);
    const [serviceAverage, setServiceAverage] = useState<number | undefined>(undefined);

    const grades = useMemo(
      () =>
        subjects
          .flatMap((subject) => subject.grades)
          .filter(
            (grade) =>
              grade.studentScore?.value !== undefined &&
              grade.givenAt &&
              !isNaN(grade.studentScore.value) &&
              !grade.studentScore.disabled,
          ),
      [subjects],
    );

    useEffect(() => {
      onEmptyStateChange?.(grades.length === 0);
    }, [grades.length, onEmptyStateChange]);

    const fetchPeriods = useCallback(
      async (managerToUse = manager) => {
        if (period) {
          setCurrentPeriod(period);
          return;
        }
        if (!managerToUse) {
          return;
        }

        const accountId = managerToUse.getAccount().id;
        const cache = periodsCache.get(accountId);

        if (cache && Date.now() - cache.fetchedAt < PERIODS_TTL_MS) {
          if (cache.value) {
            setCurrentPeriod(cache.value);
          }
          return;
        }

        if (cache?.inFlight) {
          const cachedPeriod = await cache.inFlight;
          if (cachedPeriod) {
            setCurrentPeriod(cachedPeriod);
          }
          return;
        }

        const inFlight = (async () => {
          const result = await managerToUse.getGradesPeriods();
          return getCurrentPeriod(result);
        })();

        periodsCache.set(accountId, {
          fetchedAt: cache?.fetchedAt ?? 0,
          value: cache?.value,
          inFlight,
        });

        try {
          const nextPeriod = await inFlight;
          periodsCache.set(accountId, {
            fetchedAt: Date.now(),
            value: nextPeriod,
          });
          if (nextPeriod) {
            setCurrentPeriod(nextPeriod);
          }
        } catch (err) {
          periodsCache.delete(accountId);
          error(`Failed to fetch periods: ${err}`);
        }
      },
      [period, manager],
    );

    useEffect(() => {
      const unsubscribe = subscribeManagerUpdate((updatedManager) => {
        fetchPeriods(updatedManager);
      });
      return () => unsubscribe();
    }, [fetchPeriods]);

    const fetchGradesForPeriod = useCallback(
      async (periodToFetch: Period | undefined, managerToUse = manager) => {
        if (!periodToFetch || !managerToUse) {
          return;
        }

        const periodKey = `${periodToFetch.createdByAccount}:${periodToFetch.name}`;
        const cache = gradesCache.get(periodKey);

        if (cache && Date.now() - cache.fetchedAt < GRADES_TTL_MS) {
          setSubjects(cache.subjects);
          setServiceAverage(cache.serviceAverage);
          return;
        }

        if (cache?.inFlight) {
          const cachedGrades = await cache.inFlight;
          setSubjects(cachedGrades.subjects);
          setServiceAverage(cachedGrades.serviceAverage);
          return;
        }

        const inFlight = (async () => {
          const result = await managerToUse.getGradesForPeriod(
            periodToFetch,
            periodToFetch.createdByAccount,
          );
          return {
            subjects: result.subjects,
            serviceAverage: result.studentOverall.value || undefined,
          };
        })();

        gradesCache.set(periodKey, {
          fetchedAt: cache?.fetchedAt ?? 0,
          subjects: cache?.subjects ?? [],
          serviceAverage: cache?.serviceAverage,
          inFlight,
        });

        try {
          const nextGrades = await inFlight;
          gradesCache.set(periodKey, {
            fetchedAt: Date.now(),
            subjects: nextGrades.subjects,
            serviceAverage: nextGrades.serviceAverage,
          });
          setSubjects(nextGrades.subjects);
          setServiceAverage(nextGrades.serviceAverage);
        } catch (err) {
          gradesCache.delete(periodKey);
          error(`Failed to fetch grades: ${err}`);
        }
      },
      [manager],
    );

    useEffect(() => {
      fetchGradesForPeriod(currentPeriod);
    }, [currentPeriod, fetchGradesForPeriod]);

    useEffect(() => {
      if (period) {
        setCurrentPeriod(period);
      }
    }, [period]);

    if (grades.length === 0) {
      return null;
    }

    return (
      <View style={{ width: "100%" }}>
        <Averages grades={grades} realAverage={serviceAverage} inline />
      </View>
    );
  } catch (err) {
    error(`Error in GradesWidget: ${err}`);
    return null;
  }
};

export default GradesWidget;
