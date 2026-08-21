import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColorValue, Platform, View } from "react-native";
import { LineGraph } from "react-native-graph";

import AnimatedNumber from "@/ui/components/AnimatedNumber";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import adjust from "@/utils/adjustColor";
import {
  GradeDisplayScale,
  getDisplayDenominator,
  getDisplayScaleMax,
  toDisplayScaleFrom20,
} from "@/utils/grades/scale";

import { calculateAmplifiedGraphPoints, GraphPoint } from "../utils/graph";
import type { AverageHistoryPoint, AverageMethodKey } from "../hooks/useGradesData";
import ActionMenu from "@/ui/components/ActionMenu";

const algorithms: { key: AverageMethodKey; label: string; sfsymbol: string }[] = [
  { key: "subject", label: t("Grades_Avg_Subject_Title"), sfsymbol: "square.stack.3d.up.fill" },
  { key: "weighted", label: t("Grades_Avg_All_Pond"), sfsymbol: "plus.forwardslash.minus" },
  { key: "median", label: t("Grades_Avg_Median_Title"), sfsymbol: "chart.bar.xaxis.ascending" },
];

interface AveragesProps {
  history: Partial<Record<AverageMethodKey, AverageHistoryPoint[]>>;
  realAverage?: number | null;
  color?: ColorValue;
  displayScale?: GradeDisplayScale;
}

const Averages = ({
  history,
  realAverage,
  color,
  displayScale = "20",
}: AveragesProps) => {
  try {
    const theme = useTheme();
    const accent = color || theme.colors.primary;
    const adjustedColor = adjust(accent, theme.dark ? 0.2 : -0.2);

    const [algorithm, setAlgorithm] = useState(algorithms[0]);

    const currentAverageHistory = useMemo(() => {
      const points = history[algorithm.key] ?? [];
      return points.map(entry => ({
        ...entry,
        average: toDisplayScaleFrom20(entry.average, displayScale),
      }));
    }, [history, algorithm, displayScale]);

    const initialAverage = useMemo(() => {
      if (currentAverageHistory.length === 0) {
        return { average: 0, date: new Date() };
      }
      return currentAverageHistory[currentAverageHistory.length - 1];
    }, [currentAverageHistory]);

    const [shownAverage, setShownAverage] = useState(initialAverage.average);
    const [shownDate, setShownDate] = useState(initialAverage.date);

    useEffect(() => {
      setShownAverage(initialAverage.average);
      setShownDate(initialAverage.date);
    }, [initialAverage]);

    const [active, setActive] = useState(false);

    const handleGestureUpdate = useCallback(
      (p: { value: number; date: Date; originalValue?: number; originalDate?: Date }) => {
        setActive(true);
        setShownAverage(p.originalValue ?? p.value);
        setShownDate(p.originalDate ?? p.date);
      },
      []
    );

    const handleGestureEnd = useCallback(() => {
      setActive(false);
      setShownAverage(initialAverage.average);
      setShownDate(initialAverage.date);
    }, [initialAverage]);

    useEffect(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [active]);

    const graphAxis = useMemo<GraphPoint[]>(() => {
      const points = calculateAmplifiedGraphPoints(currentAverageHistory, getDisplayScaleMax(displayScale));
      points.forEach(item => {
        item.value = Math.round(item.value * 100) / 100;
      });
      return points;
    }, [currentAverageHistory, displayScale]);

    const displayedRealAverage = useMemo(() => {
      if (realAverage === undefined || realAverage === null) { return undefined; }
      return toDisplayScaleFrom20(realAverage, displayScale);
    }, [realAverage, displayScale]);

    const isRealAverage = useMemo(
      () => shownAverage === displayedRealAverage,
      [shownAverage, displayedRealAverage]
    );

    const backgroundColor = useMemo(
      () => adjust(accent, theme.dark ? -0.89 : 0.8),
      [accent, theme.dark]
    );

    if (currentAverageHistory.length === 0 && !realAverage) {
      return null;
    }

    const graph = graphAxis.length > 0 ? (
      <LineGraph
        points={graphAxis}
        animated
        color={adjustedColor}
        enablePanGesture
        onPointSelected={handleGestureUpdate}
        onGestureEnd={handleGestureEnd}
        verticalPadding={24}
        horizontalPadding={24}
        lineThickness={5}
        panGestureDelay={0}
        enableIndicator
        enableFadeInMask={false}
        indicatorPulsating
        style={{ width: "100%", height: "100%" }}
      />
    ) : null;

    return (
      <View style={{ width: "100%", overflow: "hidden" }}>
        {Platform.OS === "ios" && (
          <LinearGradient
            colors={[backgroundColor + "90", backgroundColor + "00"]}
            start={[0, 0]}
            end={[0, 1]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 150 }}
          />
        )}

        <View style={{ width: "95%", height: 120, marginLeft: -16 }}>{graph}</View>

        <Stack
          hAlign="start"
          vAlign="center"
          gap={0}
          style={{ paddingHorizontal: 36, paddingBottom: 16, paddingTop: 0, width: "100%" }}
        >
          <Stack animated direction="horizontal" hAlign="end" vAlign="start" gap={2}>
            <AnimatedNumber variant="h1" color={adjustedColor}>
              {shownAverage ? shownAverage.toFixed(2) : "0.00"}
            </AnimatedNumber>
            <Dynamic animated>
              <Typography
                variant="title"
                style={{ color: adjustedColor, marginBottom: 3, opacity: 0.7 }}
              >
                {getDisplayDenominator(displayScale)}
              </Typography>
            </Dynamic>
          </Stack>

          <ActionMenu
            actions={[
              {
                title: t("Grades_Avg_Methods"),
                subactions: algorithms.map(algo => ({
                  id: "setAlg:" + algo.key,
                  title: algo.label,
                  state: algorithm.key === algo.key ? "on" : "off",
                  image: Platform.select({ ios: algo.sfsymbol }),
                  imageColor: theme.colors.text,
                })),
                displayInline: true,
              },
            ]}
            onPressAction={({ nativeEvent }) => {
              const actionId = nativeEvent.event;
              if (actionId.startsWith("setAlg:")) {
                const nextAlgorithm = algorithms.find(algo => algo.key === actionId.slice(7));
                if (nextAlgorithm) { setAlgorithm(nextAlgorithm); }
              }
            }}
          >
            <View style={{ width: "100%", overflow: "hidden" }}>
              <Stack hAlign="start" vAlign="start" direction="horizontal" width="100%" style={{ marginTop: 0 }}>
                <Typography variant="title" weight="bold" align="left">
                  {algorithm.label}
                </Typography>
                <Icon size={20} opacity={0.5}>
                  <Papicons name="chevronDown" />
                </Icon>
              </Stack>
            </View>
          </ActionMenu>

          <Dynamic animated key={"dateSource:" + (isRealAverage ? "real" : "estimated")}>
            <Typography
              variant="body1"
              color="textSecondary"
              style={{ marginTop: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
              align="left"
            >
              {isRealAverage
                ? "par l'établissement"
                : "estimée au " +
                  (shownDate instanceof Date && !isNaN(shownDate.getTime())
                    ? shownDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
                    : "Unknown Date")}
            </Typography>
          </Dynamic>
        </Stack>
      </View>
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;
