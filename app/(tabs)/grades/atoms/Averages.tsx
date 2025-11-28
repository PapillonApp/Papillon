import { Grade } from "@/services/shared/grade";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonGradesAveragesOverTime from "@/utils/grades/algorithms/time";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import { Papicons } from "@getpapillon/papicons";
import { MenuView } from "@react-native-menu/menu";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { LineGraph } from "react-native-graph";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { t } from "i18next";
import { useRouter } from "expo-router";

const algorithms = [
  {
    key: "subjects",
    label: t('Grades_Avg_Subject_Title'),
    description: t('Grades_Avg_Subject_Description'),
    algorithm: PapillonSubjectAvg,
    canInjectRealAverage: true,
    sfsymbol: "square.stack.3d.up.fill"
  },
  {
    key: "weighted",
    label: t('Grades_Avg_All_Pond'),
    description: t('Grades_Avg_All_Pond_Description'),
    algorithm: PapillonWeightedAvg,
    sfsymbol: "plus.forwardslash.minus"
  }
]

const Averages = ({ grades, realAverage, color, scale = 20 }: { grades: Grade[], realAverage?: number, color?: string, scale?: number }) => {
  try {
    const theme = useTheme();
    const accent = color || theme.colors.primary;
    const adjustedColor = adjust(accent, theme.dark ? 0.2 : -0.2);

    const [algorithm, setAlgorithm] = useState(algorithms[0]);

    const router = useRouter();

    const currentAverageHistory = useMemo(() => {
      if (!grades || grades.length === 0) return [];
      try {
        const history = PapillonGradesAveragesOverTime(algorithm.algorithm, grades, "studentScore");
        if (algorithm.canInjectRealAverage && realAverage) {
          history.push({
            average: realAverage,
            date: new Date(),
          });
        }
        return history;
      } catch (e) {
        console.error("Error calculating average history:", e);
        return [];
      }
    }, [grades, algorithm, realAverage]);

    const initialAverage = useMemo(() => {
      if (algorithm.canInjectRealAverage && realAverage) {
        return {
          average: realAverage,
          date: new Date(),
        };
      }

      if (!currentAverageHistory || currentAverageHistory.length === 0) return null;
      return currentAverageHistory[currentAverageHistory.length - 1];
    }, [currentAverageHistory, algorithm, realAverage]);

    const [shownAverage, setShownAverage] = useState(initialAverage ? initialAverage.average : 0);
    const [shownDate, setShownDate] = useState(initialAverage ? initialAverage.date : new Date());

    // Update state when initialAverage changes (e.g. when algorithm changes)
    React.useEffect(() => {
      if (initialAverage) {
        setShownAverage(initialAverage.average);
        setShownDate(initialAverage.date);
      } else {
        setShownAverage(0);
        setShownDate(new Date());
      }
    }, [initialAverage]);

    const [active, setActive] = useState(false);

    const handleGestureUpdate = useCallback((p: { value: number, date: Date }) => {
      setActive(true);
      setShownAverage(p.value);
      setShownDate(p.date);
    }, []);

    const handleGestureEnd = useCallback(() => {
      setActive(false);
      setShownAverage(initialAverage ? initialAverage.average : 0);
      setShownDate(initialAverage ? initialAverage.date : new Date());
    }, [initialAverage]);

    const graphAxis = useMemo(() => {
      if (!currentAverageHistory) return [];
      return currentAverageHistory
        .filter(item => !isNaN(item.average) && item.average !== null && item.average !== undefined)
        .map(item => ({
          value: item.average,
          date: new Date(item.date)
        }));
    }, [currentAverageHistory]);

    const isRealAverage = useMemo(() => {
      return shownAverage === realAverage;
    }, [shownAverage, realAverage]);

    const backgroundColor = useMemo(() => {
      return adjust(accent, theme.dark ? -0.89 : 0.93);
    }, [accent, theme.dark]);

    if (!grades || grades.length === 0) {
      // You might want to return null or a placeholder here if there are absolutely no grades
      // But if realAverage exists, we might still want to show something?
      // For now, if there's no history and no real average, we can return null or render empty state.
      if (!realAverage) return null;
    }

    return (
      <Stack
        card
        backgroundColor={backgroundColor}
        hAlign="center"
        vAlign="center"
        gap={0}
      >
        <View
          style={{
            width: "100%",
            height: 100,
            overflow: "hidden",
            borderRadius: 18,
          }}
        >
          <View
            style={{
              width: "105%",
              height: 120,
              marginLeft: -30,
              marginTop: -20,
            }}
          >

            {graphAxis.length > 0 ? (
              <LineGraph
                points={graphAxis}
                animated={true}
                color={adjustedColor}
                enablePanGesture={true}
                onPointSelected={handleGestureUpdate}
                onGestureEnd={handleGestureEnd}
                verticalPadding={30}
                horizontalPadding={30}
                lineThickness={5}
                panGestureDelay={0}
                enableIndicator={true}
                indicatorPulsating={true}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : null}
          </View>
        </View>

        <Stack animated direction="horizontal" hAlign="end" vAlign="end" gap={2} style={{ marginTop: -12 }}>
          <AnimatedNumber variant="h1" color={adjustedColor}>
            {shownAverage ? shownAverage.toFixed(2) : "0.00"}
          </AnimatedNumber>
          <Dynamic animated>
            <Typography variant="title" style={{ color: adjustedColor, marginBottom: 4, opacity: 0.7 }}>
              /{scale}
            </Typography>
          </Dynamic>
        </Stack>

        <MenuView
          actions={[
            {
              title: t('Grades_Avg_Methods'),
              subactions: algorithms.map((algo) => ({
                id: "setAlg:" + algo.key,
                title: algo.label,
                subtitle: algo.description,
                state: algorithm.key === algo.key ? "on" : "off",
                image: Platform.select({
                  ios: algo.sfsymbol
                }),
                imageColor: theme.colors.text
              })),
              displayInline: true
            },
            {
              title: "",
              subactions: [
                {
                  id: 'open:more',
                  title: t('Grades_Avg_KnowMore'),
                  subtitle: t('Grades_Avg_KnowMore_Description'),
                  image: Platform.select({
                    ios: "info.circle"
                  }),
                  imageColor: theme.colors.text
                }
              ],
              displayInline: true
            }
          ]}
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;

            if (actionId.startsWith("open:")) {
              if (actionId === "open:more") {
                router.push("/(tabs)/grades/modals/AboutAverages");
              }
            }

            if (actionId.startsWith("setAlg:")) {
              setAlgorithm(algorithms.find((algo) => algo.key === actionId.slice(7))!);
            }
          }}
        >
          <TouchableOpacity>
            <Stack hAlign="center" vAlign="center" direction="horizontal" style={{ marginTop: -2 }}>
              <Typography variant="title" align="center">
                {algorithm.label}
              </Typography>
              <Icon size={20} opacity={0.5}>
                <Papicons name="chevronDown" />
              </Icon>
            </Stack>
          </TouchableOpacity>
        </MenuView>

        <Dynamic animated key={"dateSource:" + (isRealAverage ? "real" : "estimated")}>
          <Typography color="secondary" style={{ marginTop: 1 }}>
            {isRealAverage ? "par l'établissement" :
              "estimée au " + (shownDate instanceof Date && !isNaN(shownDate.getTime()) ? shownDate.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric"
              }) : "Unknown Date")}
          </Typography>
        </Dynamic>
        <View style={{ height: 14 }} />
      </Stack>
    );
  }
  catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;
