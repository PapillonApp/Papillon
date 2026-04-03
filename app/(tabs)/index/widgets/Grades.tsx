import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Period, Subject as SharedSubject } from "@/services/shared/grade";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { error } from "@/utils/logger/logger";
import Averages from "../../grades/atoms/Averages";

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
        if (currentPeriod || !managerToUse) {
          return;
        }

        try {
          const result = await managerToUse.getGradesPeriods();
          setCurrentPeriod(getCurrentPeriod(result));
        } catch (err) {
          error(`Failed to fetch periods: ${err}`);
        }
      },
      [period, currentPeriod, manager],
    );

    useEffect(() => {
      const unsubscribe = subscribeManagerUpdate((updatedManager) => {
        fetchPeriods(updatedManager);
      });

      fetchPeriods();
      return () => unsubscribe();
    }, [fetchPeriods]);

    const fetchGradesForPeriod = useCallback(
      async (periodToFetch: Period | undefined, managerToUse = manager) => {
        if (!periodToFetch || !managerToUse || grades.length > 0) {
          return;
        }

        try {
          const result = await managerToUse.getGradesForPeriod(
            periodToFetch,
            periodToFetch.createdByAccount,
          );
          setSubjects(result.subjects);
          setServiceAverage(result.studentOverall.value || undefined);
        } catch (err) {
          error(`Failed to fetch grades: ${err}`);
        }
      },
      [manager, grades.length],
    );

    useEffect(() => {
      if (grades.length > 0) {
        return;
      }
      fetchGradesForPeriod(currentPeriod);
    }, [currentPeriod, fetchGradesForPeriod, grades.length]);

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
