import { getManager, subscribeManagerUpdate } from "@/services/shared";
import Typography from "@/ui/components/Typography"
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { Dimensions, View } from "react-native"
import { Grade as SharedGrade, Period, Subject as SharedSubject } from "@/services/shared/grade";

import PapillonMedian from "@/utils/grades/algorithms/median";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import { t } from "i18next";

import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "@react-navigation/native";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import { Animation } from "@/ui/utils/Animation";
import { FadeIn, FadeOut } from "react-native-reanimated";
import { set } from "date-fns";

const GradesWidget = ({ accent = "#29947A", header = false }: { accent?: string, header?: boolean }) => {
  const manager = getManager();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [newSubjects, setSubjects] = useState<Array<SharedSubject>>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | undefined>();
  const [serviceAverage, setServiceAverage] = useState<number | undefined>(undefined);

  const [currentAlgorithm, setCurrentAlgorithm] = useState("subject");

  const avgAlgorithms = [
    {
      label: t("Grades_Avg_All_Title"),
      short: t("Grades_Avg_All_Short"),
      subtitle: t("Grades_Method_AllGrades"),
      value: "subject",
      algorithm: (grades: SharedGrade[]) => PapillonSubjectAvg(grades)
    },
    {
      label: t("Grades_Avg_Subject_Title"),
      short: t("Grades_Avg_Subject_Short"),
      subtitle: t("Grades_Method_Weighted"),
      value: "weighted",
      algorithm: (grades: SharedGrade[]) => PapillonWeightedAvg(grades)
    },
    {
      label: t("Grades_Avg_Median_Title"),
      short: t("Grades_Avg_Median_Short"),
      subtitle: t("Grades_Method_AllGrades"),
      value: "median",
      algorithm: (grades: SharedGrade[]) => PapillonMedian(grades)
    },
  ]

  const getAverageHistory = useCallback((grades: SharedGrade[]) => {
    // Filter out grades without valid scores and dates
    const validGrades = grades.filter(grade =>
      grade.studentScore?.value !== undefined &&
      grade.givenAt &&
      !isNaN(grade.studentScore.value)
    );

    // Sort grades by date in ascending order
    const sortedGrades = validGrades.sort((a, b) => a.givenAt.getTime() - b.givenAt.getTime());

    // Initialize an array to store the average history
    const averageHistory: { value: number; }[] = [];

    // Iterate through the sorted grades and calculate the average progressively
    sortedGrades.forEach((currentGrade, index) => {
      const gradesUpToCurrent = sortedGrades.slice(0, index + 1);

      // use currentAlgorithm to determine the average calculation method
      const algorithm = avgAlgorithms.find(a => a.value === currentAlgorithm);
      const currentAverage = algorithm ? algorithm.algorithm(gradesUpToCurrent) : 0;

      if (!isNaN(currentAverage)) {
        averageHistory.push({
          value: currentAverage,
        });
      }
    });

    return averageHistory;
  }, [currentAlgorithm]);

  const currentAverageHistory = useMemo(() => {
    const grades = newSubjects.flatMap(subject => subject.grades).filter(grade =>
      grade.studentScore?.value !== undefined &&
      grade.givenAt &&
      !isNaN(grade.studentScore.value)
    );
    return getAverageHistory(grades);
  }, [newSubjects, currentAlgorithm, getAverageHistory]);

  const fetchPeriods = async (managerToUse = manager) => {
    if (currentPeriod) {
      return;
    }

    if (!managerToUse) {
      return;
    }

    const result = await managerToUse.getGradesPeriods()
    setPeriods(result);

    const currentPeriodFound = getCurrentPeriod(result)
    setCurrentPeriod(currentPeriodFound)
  };

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchPeriods(updatedManager);
    });

    return () => unsubscribe();
  }, []);

  const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
    if (period && managerToUse) {
      const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);
      setSubjects(grades.subjects);
      if (grades.studentOverall.value) {
        setServiceAverage(grades.studentOverall.value)
      }
    }
  };

  useEffect(() => {
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const graphWidth = Dimensions.get("window").width + (16 * 2);

  const initialAverage = useMemo(() => {
    if (serviceAverage) {
      return serviceAverage;
    }
    return currentAverageHistory[currentAverageHistory.length - 1]?.value;
  }, [currentAverageHistory, serviceAverage]);

  useEffect(() => {
    setShownAverage(initialAverage);
  }, [initialAverage]);

  const [shownAverage, setShownAverage] = useState<number | undefined>(initialAverage);
  const [selectionDate, setSelectionDate] = useState<Date | undefined>(undefined);


  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          marginLeft: -16,
        }}
      >
        <LineChart
          data={currentAverageHistory}
          color={accent}
          thickness={6}
          initialSpacing={0}
          hideAxesAndRules
          hideRules
          hideYAxisText
          animateOnDataChange
          curved
          spacing={(graphWidth / currentAverageHistory.length)}
          disableScroll
          width={graphWidth}
          height={100}
          hideDataPoints
        />

        <View
          style={{
            padding: 28,
            marginTop: (-28 * 2) + (header ? -16 : 0),
            paddingLeft: 36
          }}
        >
          <Stack direction="horizontal" gap={0} inline vAlign={header ? "center" : "start"} hAlign="end" style={{ width: "100%", marginBottom: -2 }}>
            <Dynamic animated>
              <AnimatedNumber variant="h1" color={accent}>
                {shownAverage >= 0 ? (shownAverage ?? 0).toFixed(2) : "--.--"}
              </AnimatedNumber>
            </Dynamic>
            <Dynamic animated>
              <Typography variant="body1" color="secondary" style={{ marginBottom: 2 }}>
                /20
              </Typography>
            </Dynamic>
          </Stack>
          <Dynamic animated entering={Animation(FadeIn, "default").duration(100)} exiting={Animation(FadeOut, "default").duration(100)} key={"currentAlgorithm:" + currentAlgorithm} style={{ width: "100%" }}>
            <Typography variant="title" color={accent} align={header ? "center" : "left"} style={{ width: "100%" }}>
              {avgAlgorithms.find(a => a.value === currentAlgorithm)?.label || "Aucune moyenne"}
            </Typography>
          </Dynamic>
          <Dynamic animated entering={Animation(FadeIn, "default").duration(100)} exiting={Animation(FadeOut, "default").duration(100)} key={"selectionDate:" + selectionDate + ":" + currentAlgorithm} style={{ width: "100%" }}>
            <Typography variant="body1" color="secondary" align={header ? "center" : "left"} inline style={{ marginTop: 3, width: "100%" }}>
              {selectionDate ?
                "au " + new Date(selectionDate).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                : avgAlgorithms.find(a => a.value === currentAlgorithm)?.subtitle || "Aucune moyenne"}
            </Typography>
          </Dynamic>
        </View>
      </View>
    </View>
  )
}

export default memo(GradesWidget);