import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { getManager, subscribeManagerUpdate } from "@/services/shared";
import {
  Grade as SharedGrade,
  GradeDisplaySettings,
  Period,
  Subject as SharedSubject,
} from "@/services/shared/grade";
import { isNumericGradeScore } from "@/utils/grades/score";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { error } from "@/utils/logger/logger";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
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
    display?: GradeDisplaySettings;
    inFlight?: Promise<{
      subjects: SharedSubject[];
      serviceAverage?: number;
      display?: GradeDisplaySettings;
    }>;
  }
>();

type GradesWidgetProps = {
  accent?: string;
  header?: boolean;
  algorithm?: "subject" | "weighted" | "median";
  period?: Period;
};

const GradesWidget = ({ period }: GradesWidgetProps) => {
  const { t } = useTranslation();
  const manager = getManager();

  const [subjects, setSubjects] = useState<SharedSubject[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | undefined>(period);
  const [serviceAverage, setServiceAverage] = useState<number | undefined>(undefined);
  const [display, setDisplay] = useState<GradeDisplaySettings | undefined>(undefined);
  const [loadingPeriods, setLoadingPeriods] = useState(!period);
  const [loadingGrades, setLoadingGrades] = useState(Boolean(period));

  const grades = useMemo(
    () =>
      subjects
        .flatMap((subject) => subject.grades ?? [])
        .filter(
          (grade): grade is SharedGrade =>
            Boolean(grade) &&
            grade.studentScore?.value !== undefined &&
            Boolean(grade.givenAt) &&
            !isNaN(grade.studentScore.value) &&
            !grade.studentScore.disabled,
        ),
    [subjects],
  );

  const fetchPeriods = useCallback(
    async (managerToUse = manager) => {
      if (period) {
        setLoadingPeriods(false);
        setLoadingGrades(true);
        setCurrentPeriod(period);
        return;
      }
      if (!managerToUse) {
        return;
      }

      setLoadingPeriods(true);
      const accountId = managerToUse.getAccount().id;
      const cache = periodsCache.get(accountId);

      if (cache && Date.now() - cache.fetchedAt < PERIODS_TTL_MS) {
        if (cache.value) {
          setLoadingGrades(true);
          setCurrentPeriod(cache.value);
        } else {
          setCurrentPeriod(undefined);
          setLoadingGrades(false);
        }
        setLoadingPeriods(false);
        return;
      }

      if (cache?.inFlight) {
        try {
          const cachedPeriod = await cache.inFlight;
          if (cachedPeriod) {
            setLoadingGrades(true);
            setCurrentPeriod(cachedPeriod);
          } else {
            setCurrentPeriod(undefined);
            setLoadingGrades(false);
          }
        } finally {
          setLoadingPeriods(false);
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
          setLoadingGrades(true);
          setCurrentPeriod(nextPeriod);
        } else {
          setCurrentPeriod(undefined);
          setLoadingGrades(false);
        }
      } catch (err) {
        periodsCache.delete(accountId);
        setLoadingGrades(false);
        error(`Failed to fetch periods: ${err}`);
      } finally {
        setLoadingPeriods(false);
      }
    },
    [period, manager],
  );

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      void fetchPeriods(updatedManager);
    });
    return () => unsubscribe();
  }, [fetchPeriods]);

  const fetchGradesForPeriod = useCallback(
    async (periodToFetch: Period | undefined, managerToUse = manager) => {
      if (!periodToFetch || !managerToUse) {
        setSubjects([]);
        setServiceAverage(undefined);
        setDisplay(undefined);
        setLoadingGrades(false);
        return;
      }

      setLoadingGrades(true);
      const periodKey = `${periodToFetch.createdByAccount}:${periodToFetch.name}`;
      const cache = gradesCache.get(periodKey);

      if (cache && Date.now() - cache.fetchedAt < GRADES_TTL_MS) {
        setSubjects(cache.subjects);
        setServiceAverage(cache.serviceAverage);
        setDisplay(cache.display);
        setLoadingGrades(false);
        return;
      }

      if (cache?.inFlight) {
        try {
          const cachedGrades = await cache.inFlight;
          setSubjects(cachedGrades.subjects);
          setServiceAverage(cachedGrades.serviceAverage);
          setDisplay(cachedGrades.display);
        } finally {
          setLoadingGrades(false);
        }
        return;
      }

      const inFlight = (async () => {
        const result = await managerToUse.getGradesForPeriod(
          periodToFetch,
          periodToFetch.createdByAccount,
        );
        return {
          subjects: result.subjects,
          serviceAverage: isNumericGradeScore(result.studentOverall)
            ? result.studentOverall.value
            : undefined,
          display: result.display,
        };
      })();

      gradesCache.set(periodKey, {
        fetchedAt: cache?.fetchedAt ?? 0,
        subjects: cache?.subjects ?? [],
        serviceAverage: cache?.serviceAverage,
        display: cache?.display,
        inFlight,
      });

      try {
        const nextGrades = await inFlight;
        gradesCache.set(periodKey, {
          fetchedAt: Date.now(),
          subjects: nextGrades.subjects,
          serviceAverage: nextGrades.serviceAverage,
          display: nextGrades.display,
        });
        setSubjects(nextGrades.subjects);
        setServiceAverage(nextGrades.serviceAverage);
        setDisplay(nextGrades.display);
      } catch (err) {
        gradesCache.delete(periodKey);
        error(`Failed to fetch grades: ${err}`);
      } finally {
        setLoadingGrades(false);
      }
    },
    [manager],
  );

  useEffect(() => {
    void fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod, fetchGradesForPeriod]);

  useEffect(() => {
    if (period) {
      setLoadingPeriods(false);
      setLoadingGrades(true);
      setCurrentPeriod(period);
    }
  }, [period]);

  if (loadingPeriods || loadingGrades || grades.length === 0) {
    return (
      <Stack
        inline
        flex
        hAlign="center"
        vAlign="center"
        padding={[22, 16]}
        gap={2}
        style={{ paddingTop: 12, marginBottom: 3 }}
      >
        <Typography align="center" variant="title" color="text">
          {t("Grades_Empty_Title")}
        </Typography>
        <Typography align="center" variant="body1" color="secondary">
          {t("Grades_Empty_Description")}
        </Typography>
      </Stack>
    );
  }

  return (
    <View style={{ width: "100%" }}>
      <Averages grades={grades} realAverage={serviceAverage} scale={display?.scale ?? 20} inline />
    </View>
  );
};

export default GradesWidget;
