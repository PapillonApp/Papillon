import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { LineGraph } from "react-native-graph";
import Reanimated, {
  Extrapolation,
  LayoutAnimationConfig,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import { Grade } from "@/services/shared/grade";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import ActionMenu from "@/ui/components/ActionMenu";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonGradesAveragesOverTime from "@/utils/grades/algorithms/time";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import { getGradeScoreDenominator, isNumericGradeScore } from "@/utils/grades/score";

import { AverageHistoryItem, calculateAmplifiedGraphPoints, GraphPoint } from "../utils/graph";

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
];

type TimelineMode = "average" | "grades";
type AveragesVariant = "overall" | "subject";

type AveragesProps = {
  grades: Grade[];
  realAverage?: number;
  color?: string;
  scale?: number;
  inline?: boolean;
  variant?: AveragesVariant;
  averageTitle?: string;
};

type TimelineSummary = {
  average: number;
  date: Date;
  label?: string;
};

const DOT_SIZE = 6;
const DOT_GAP = 6;

const Averages = ({ grades, realAverage, color, scale = 20, inline = false, variant = "overall", averageTitle }: AveragesProps) => {
  try {
    const theme = useTheme();
    const accent = color || theme.colors.primary;
    const adjustedColor = adjust(accent, theme.dark ? 0.2 : -0.2);
    const availableAlgorithms = useMemo(() => {
      if (variant === "subject") {
        return [{
          key: "subject",
          label: averageTitle ?? t("SubjectInfo_StudentAverage_Label"),
          description: averageTitle ?? t("SubjectInfo_StudentAverage_Label"),
          algorithm: PapillonSubjectAvg,
          canInjectRealAverage: true,
          sfsymbol: "chart.line.uptrend.xyaxis"
        }];
      }

      return algorithms;
    }, [averageTitle, variant]);

    const [algorithm, setAlgorithm] = useState(availableAlgorithms[0]);
    const [selectedMode, setSelectedMode] = useState<TimelineMode>("average");
    const [active, setActive] = useState(false);

    useEffect(() => {
      if (!availableAlgorithms.some((candidate) => candidate.key === algorithm.key)) {
        setAlgorithm(availableAlgorithms[0]);
      }
    }, [algorithm.key, availableAlgorithms]);

    const currentAverageHistory = useMemo<AverageHistoryItem[]>(() => {
      if (!grades || grades.length === 0) { return []; }
      try {
        const history = PapillonGradesAveragesOverTime(algorithm.algorithm, grades, "studentScore");
        if (algorithm.canInjectRealAverage && typeof realAverage === "number") {
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

    const currentGradesHistory = useMemo<AverageHistoryItem[]>(() => {
      const history: AverageHistoryItem[] = [];

      for (const grade of [...grades].sort((left, right) => getGradeTimestamp(left.givenAt) - getGradeTimestamp(right.givenAt))) {
        if (!isNumericGradeScore(grade.studentScore) || grade.studentScore.disabled || !grade.givenAt) {
          continue;
        }

        const denominator = getGradeScoreDenominator(grade.studentScore, grade.outOf?.value);
        if (typeof denominator !== "number" || denominator <= 0) {
          continue;
        }

        history.push({
          average: (grade.studentScore.value / denominator) * scale,
          date: grade.givenAt,
          label: getGradeTimelineLabel(grade),
        });
      }

      return history.filter((item) => Number.isFinite(item.average));
    }, [grades, scale]);

    const carouselModes = useMemo<TimelineMode[]>(() => {
      if (!inline && currentGradesHistory.length > 0) {
        return ["average", "grades"];
      }

      return ["average"];
    }, [currentGradesHistory.length, inline]);

    useEffect(() => {
      if (!carouselModes.includes(selectedMode)) {
        setSelectedMode(carouselModes[0]);
      }
    }, [carouselModes, selectedMode]);

    const buildInitialTimelinePoint = useCallback((mode: TimelineMode): TimelineSummary => {
      if (mode === "average" && algorithm.canInjectRealAverage && typeof realAverage === "number") {
        return {
          average: realAverage,
          date: new Date(),
        };
      }

      const timeline = mode === "average" ? currentAverageHistory : currentGradesHistory;
      if (timeline.length === 0) {
        return {
          average: 0,
          date: new Date(),
        };
      }

      const latestPoint = timeline[timeline.length - 1];
      return {
        average: latestPoint.average,
        date: latestPoint.date instanceof Date ? latestPoint.date : new Date(latestPoint.date),
        label: latestPoint.label,
      };
    }, [algorithm.canInjectRealAverage, currentAverageHistory, currentGradesHistory, realAverage]);

    const initialTimelinePoints = useMemo<Record<TimelineMode, TimelineSummary>>(() => ({
      average: buildInitialTimelinePoint("average"),
      grades: buildInitialTimelinePoint("grades"),
    }), [buildInitialTimelinePoint]);

    const [timelineStateByMode, setTimelineStateByMode] = useState<Record<TimelineMode, TimelineSummary>>(initialTimelinePoints);

    useEffect(() => {
      setTimelineStateByMode(initialTimelinePoints);
      setActive(false);
    }, [initialTimelinePoints]);

    const handleGestureUpdate = useCallback((mode: TimelineMode, point: GraphPoint) => {
      setActive(true);
      setTimelineStateByMode((previous) => ({
        ...previous,
        [mode]: {
          average: point.originalValue ?? point.value,
          date: point.originalDate ?? point.date,
          label: point.originalLabel ?? point.label,
        },
      }));
    }, []);

    const handleGestureEnd = useCallback((mode: TimelineMode) => {
      setActive(false);
      setTimelineStateByMode((previous) => ({
        ...previous,
        [mode]: initialTimelinePoints[mode],
      }));
    }, [initialTimelinePoints]);

    const graphCallbacksByMode = useMemo<Record<TimelineMode, {
      onPointSelected: (point: GraphPoint) => void;
      onGestureEnd: () => void;
    }>>(() => ({
      average: {
        onPointSelected: (point) => handleGestureUpdate("average", point),
        onGestureEnd: () => handleGestureEnd("average"),
      },
      grades: {
        onPointSelected: (point) => handleGestureUpdate("grades", point),
        onGestureEnd: () => handleGestureEnd("grades"),
      },
    }), [handleGestureEnd, handleGestureUpdate]);

    useEffect(() => {
      if (active) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, [active]);

    const graphPointsByMode = useMemo<Record<TimelineMode, GraphPoint[]>>(() => ({
      average: calculateAmplifiedGraphPoints(currentAverageHistory, scale).map((point) => ({
        ...point,
        value: Math.round(point.value * 100) / 100,
      })),
      grades: calculateAmplifiedGraphPoints(currentGradesHistory, scale).map((point) => ({
        ...point,
        value: Math.round(point.value * 100) / 100,
      })),
    }), [currentAverageHistory, currentGradesHistory, scale]);

    const stableModes = useMemo<Record<TimelineMode, boolean>>(() => ({
      average: isStableTimeline(currentAverageHistory),
      grades: isStableTimeline(currentGradesHistory),
    }), [currentAverageHistory, currentGradesHistory]);

    const graphRangesByMode = useMemo<Record<TimelineMode, {
      x: { min: Date; max: Date };
      y: { min: number; max: number };
    } | undefined>>(() => ({
      average: getStableGraphRange(currentAverageHistory, graphPointsByMode.average, scale),
      grades: getStableGraphRange(currentGradesHistory, graphPointsByMode.grades, scale),
    }), [currentAverageHistory, currentGradesHistory, graphPointsByMode, scale]);

    const backgroundColor = useMemo(() => {
      return adjust(accent, theme.dark ? -0.89 : 0.8);
    }, [accent, theme.dark]);

    const showPager = !inline && carouselModes.length > 1;
    const [pagerWidth, setPagerWidth] = useState(0);
    const pagerRef = useRef<ScrollView>(null);
    const selectedModeRef = useRef(selectedMode);
    const scrollX = useSharedValue(0);

    useEffect(() => {
      selectedModeRef.current = selectedMode;
    }, [selectedMode]);

    useEffect(() => {
      if (!showPager || pagerWidth <= 0) {
        scrollX.value = 0;
        return;
      }

      const targetOffset = Math.max(0, carouselModes.indexOf(selectedModeRef.current)) * pagerWidth;
      scrollX.value = targetOffset;
      pagerRef.current?.scrollTo({
        x: targetOffset,
        animated: false,
      });
    }, [carouselModes, pagerWidth, scrollX, showPager]);

    const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
      const nextWidth = Math.round(event.nativeEvent.layout.width);
      if (nextWidth > 0 && nextWidth !== pagerWidth) {
        setPagerWidth(nextWidth);
      }
    }, [pagerWidth]);

    const pagerScrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
      },
    });

    const selectMode = useCallback((mode: TimelineMode) => {
      const modeIndex = carouselModes.indexOf(mode);
      if (modeIndex === -1 || pagerWidth <= 0) {
        return;
      }

      setSelectedMode(mode);
      pagerRef.current?.scrollTo({
        x: modeIndex * pagerWidth,
        animated: true,
      });
    }, [carouselModes, pagerWidth]);

    const handlePagerScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pagerWidth <= 0) {
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      scrollX.value = offsetX;
      const nextIndex = Math.round(offsetX / pagerWidth);
      const nextMode = carouselModes[nextIndex];
      if (nextMode && nextMode !== selectedMode) {
        setSelectedMode(nextMode);
      }
    }, [carouselModes, pagerWidth, scrollX, selectedMode]);

    const graphTrackStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: -scrollX.value }],
    }));

    const getSummaryState = useCallback((mode: TimelineMode): TimelineSummary => {
      return timelineStateByMode[mode] ?? initialTimelinePoints[mode];
    }, [initialTimelinePoints, timelineStateByMode]);

    const getSummarySubtitle = useCallback((mode: TimelineMode, summary: TimelineSummary): string => {
      const isPageRealAverage = mode === "average" && summary.average === realAverage;

      if (mode === "average") {
        return isPageRealAverage
          ? t("Grades_Avg_Source_Service")
          : t("Grades_Avg_Source_EstimatedAt", {
            date: formatTimelineDate(summary.date),
          });
      }

      return summary.label
        ? t("Grades_Avg_Source_GradeAt", {
          label: summary.label,
          date: formatTimelineDate(summary.date),
        })
        : t("Grades_Avg_Source_GradeOn", {
          date: formatTimelineDate(summary.date),
        });
    }, [realAverage]);

    if (!grades || grades.length === 0) {
      if (typeof realAverage !== "number") { return null; }
    }

    const renderMetricTitle = (mode: TimelineMode, align: "left" | "center") => {
      const titleVariant = inline ? "body1" : "title";

      if (mode === "average" && availableAlgorithms.length > 1) {
        return (
          <ActionMenu
            actions={[
              {
                title: t('Grades_Avg_Methods'),
                subactions: availableAlgorithms.map((algo) => ({
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
                id: 'open:more',
                title: t('Grades_Avg_KnowMore'),
                subtitle: t('Grades_Avg_KnowMore_Description'),
                image: Platform.select({
                  ios: "info.circle"
                }),
                imageColor: theme.colors.text
              }
            ]}
            onPressAction={({ nativeEvent }) => {
              const actionId = nativeEvent.event;

              if (actionId.startsWith("open:")) {
                if (actionId === "open:more") {
                  WebBrowser.openBrowserAsync("https://docs.papillon.bzh/support/kb/averages", {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
                  });
                }
              }

              if (actionId.startsWith("setAlg:")) {
                setAlgorithm(availableAlgorithms.find((algo) => algo.key === actionId.slice(7))!);
              }
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: "100%",
                overflow: "hidden",
                alignItems: align === "center" ? "center" : "flex-start",
              }}
            >
              <Stack
                hAlign={align === "center" ? "center" : "start"}
                vAlign={inline ? "start" : "center"}
                direction="horizontal"
                style={{ marginTop: -2 }}
              >
                <Typography variant={titleVariant} weight="bold" align={align}>
                  {averageTitle ?? algorithm.label}
                </Typography>
                <Icon size={20} opacity={0.5}>
                  <Papicons name="chevronDown" />
                </Icon>
              </Stack>
            </TouchableOpacity>
          </ActionMenu>
        );
      }

      return (
        <Stack
          hAlign={align === "center" ? "center" : "start"}
          vAlign={inline ? "start" : "center"}
          direction="horizontal"
          style={{ marginTop: -2 }}
        >
          <Typography variant={titleVariant} weight="bold" align={align}>
            {mode === "average"
              ? averageTitle ?? algorithm.label
              : t("Grades_Avg_Notes_Title")}
          </Typography>
        </Stack>
      );
    };

    const renderSummaryContent = (mode: TimelineMode, align: "left" | "center") => {
      const summary = getSummaryState(mode);
      const subtitle = getSummarySubtitle(mode, summary);
      const numberVariant = inline ? "h2" : "h1";

      return (
        <View
          style={{
            width: "100%",
            minWidth: 0,
            alignItems: align === "center" ? "center" : "flex-start",
            justifyContent: "center",
            paddingHorizontal: inline ? 0 : 12,
            paddingTop: inline ? 0 : 2,
          }}
        >
          <Stack animated direction="horizontal" hAlign={align === "center" ? "center" : "start"} vAlign="end" gap={2}>
            <AnimatedNumber variant={numberVariant} color={adjustedColor}>
              {summary.average ? summary.average.toFixed(2) : "0.00"}
            </AnimatedNumber>
            <Dynamic animated>
              <Typography variant="title" style={{ color: adjustedColor, marginBottom: inline ? 1 : 3, opacity: 0.7 }}>
                /{scale}
              </Typography>
            </Dynamic>
          </Stack>

          {renderMetricTitle(mode, align)}

          <Dynamic animated key={`dateSource:${mode}:${summary.label ?? "none"}:${summary.average}`}>
            <Typography
              variant={inline ? "body2" : "body1"}
              color="textSecondary"
              style={{ marginTop: inline ? 0 : 2, width: "100%" }}
              numberOfLines={1}
              ellipsizeMode="tail"
              align={align}
            >
              {subtitle}
            </Typography>
          </Dynamic>
        </View>
      );
    };

    const renderGraph = (mode: TimelineMode, layout: "inline" | "page") => {
      const graphAxis = graphPointsByMode[mode];
      const graphRange = graphRangesByMode[mode];
      const compactGraph = stableModes[mode];
      const graphCallbacks = graphCallbacksByMode[mode];
      const graphHeight = layout === "inline"
        ? 100
        : (compactGraph ? 82 : 102);
      const outerStyle = layout === "inline"
        ? {
          width: "100%" as const,
          flex: 1,
          marginLeft: -2,
          height: graphHeight,
          overflow: "hidden" as const,
        }
        : {
          width: "100%" as const,
          height: graphHeight,
          overflow: "hidden" as const,
        };
      const innerStyle = layout === "inline"
        ? {
          width: "105%" as const,
          height: 115,
          marginLeft: -30,
          marginTop: -15,
        }
        : {
          width: "104%" as const,
          height: graphHeight + 8,
          marginLeft: -12,
          marginTop: compactGraph ? 0 : -6,
        };
      return (
        <View style={outerStyle}>
          <View style={innerStyle}>
            {graphAxis.length > 0 ? (
              <LineGraph
                points={graphAxis}
                range={graphRange}
                animated
                color={adjustedColor}
                enablePanGesture
                onPointSelected={graphCallbacks.onPointSelected}
                onGestureEnd={graphCallbacks.onGestureEnd}
                verticalPadding={layout === "inline" ? 30 : (compactGraph ? 18 : 26)}
                horizontalPadding={layout === "inline" ? 30 : 22}
                lineThickness={layout === "inline" ? 4.5 : 5}
                panGestureDelay={0}
                enableIndicator
                enableFadeInMask
                indicatorPulsating
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : null}
          </View>
        </View>
      );
    };

    const graphViewportHeight = showPager
      ? Math.max(...carouselModes.map((mode) => stableModes[mode] ? 82 : 102))
      : (stableModes[selectedMode] ? 82 : 102);

    return (
      <Reanimated.View
        style={{
          width: "100%"
        }}
        entering={!inline ? PapillonAppearIn : undefined}
        exiting={!inline ? PapillonAppearOut : undefined}
      >
        <LayoutAnimationConfig skipEntering={true} skipExiting={true}>
          <Stack
            card={!inline}
            hAlign="center"
            vAlign="center"
            direction={inline ? "horizontal" : "vertical"}
            gap={0}
            style={[
              Platform.OS === 'android' ? {
                borderWidth: 0,
                backgroundColor: theme.colors.card,
                elevation: 0
              } : {},
              inline ? {
                overflow: "hidden",
                backgroundColor: "transparent",
                marginTop: -8,
              } : {
                minHeight: 188,
              }
            ]}
          >
            {Platform.OS === 'ios' && (
              <LinearGradient
                colors={[backgroundColor + "90", backgroundColor + "00"]}
                start={inline ? [0, 1] : [0, 0]}
                end={inline ? [0, 0] : [0, 1]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                }}
              />
            )}

            {inline ? (
              <>
                {renderGraph(selectedMode, "inline")}
                <View
                  style={{
                    flex: 1,
                    minWidth: 0,
                    marginLeft: -24,
                    marginRight: 20,
                    justifyContent: "center",
                  }}
                >
                  {renderSummaryContent(selectedMode, "left")}
                </View>
              </>
            ) : (
              <View
                style={{ width: "100%", minHeight: 176 }}
                onLayout={handlePagerLayout}
              >
                <View
                  style={{
                    width: "100%",
                    height: graphViewportHeight,
                    overflow: "hidden",
                    justifyContent: "center",
                    paddingTop: 6,
                  }}
                >
                  {showPager && pagerWidth > 0 ? (
                    <Reanimated.View
                      style={[
                        {
                          width: pagerWidth * carouselModes.length,
                          flexDirection: "row",
                        },
                        graphTrackStyle,
                      ]}
                    >
                      {carouselModes.map((mode) => (
                        <View
                          key={mode}
                          style={{
                            width: pagerWidth,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {renderGraph(mode, "page")}
                        </View>
                      ))}
                    </Reanimated.View>
                  ) : (
                    <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                      {renderGraph(selectedMode, "page")}
                    </View>
                  )}
                </View>

                <View
                  style={{
                    width: "100%",
                    minHeight: 72,
                    justifyContent: "center",
                    paddingTop: 4,
                  }}
                >
                  {showPager && pagerWidth > 0 ? (
                    <Reanimated.ScrollView
                      ref={pagerRef}
                      horizontal
                      pagingEnabled={false}
                      bounces={false}
                      directionalLockEnabled
                      disableIntervalMomentum
                      snapToInterval={pagerWidth}
                      decelerationRate={Platform.OS === "ios" ? 0.98 : undefined}
                      showsHorizontalScrollIndicator={false}
                      onScroll={pagerScrollHandler}
                      onMomentumScrollEnd={handlePagerScrollEnd}
                      overScrollMode="never"
                      scrollEventThrottle={16}
                      contentContainerStyle={{ alignItems: "stretch" }}
                    >
                      {carouselModes.map((mode) => (
                        <View
                          key={mode}
                          style={{
                            width: pagerWidth,
                            minHeight: 72,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {renderSummaryContent(mode, "center")}
                        </View>
                      ))}
                    </Reanimated.ScrollView>
                  ) : (
                    <View style={{ width: "100%", minHeight: 72, justifyContent: "center" }}>
                      {renderSummaryContent(selectedMode, "center")}
                    </View>
                  )}
                </View>

                {showPager && (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: 2,
                      paddingBottom: 8,
                    }}
                  >
                    <Stack direction="horizontal" hAlign="center" vAlign="center" gap={DOT_GAP}>
                      {carouselModes.map((mode, index) => (
                        <PagerDot
                          key={mode}
                          index={index}
                          pagerWidth={pagerWidth}
                          scrollX={scrollX}
                          activeColor={`${adjustedColor}CC`}
                          inactiveColor={theme.colors.border}
                          onPress={() => selectMode(mode)}
                        />
                      ))}
                    </Stack>
                  </View>
                )}
              </View>
            )}
          </Stack>
        </LayoutAnimationConfig>
      </Reanimated.View>
    );
  }
  catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;

function PagerDot({
  index,
  pagerWidth,
  scrollX,
  activeColor,
  inactiveColor,
  onPress,
}: {
  index: number;
  pagerWidth: number;
  scrollX: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    if (pagerWidth <= 0) {
      return {
        width: DOT_SIZE,
        opacity: 0.6,
        backgroundColor: inactiveColor,
      };
    }

    const progress = scrollX.value / pagerWidth;
    const distance = Math.abs(progress - index);

    return {
      width: interpolate(distance, [0, 1], [14, DOT_SIZE], Extrapolation.CLAMP),
      opacity: interpolate(distance, [0, 1], [1, 0.55], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(distance, [0, 1], [activeColor, inactiveColor]),
    };
  }, [activeColor, inactiveColor, index, pagerWidth]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Reanimated.View
        style={[
          {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: inactiveColor,
          },
          animatedStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

function getGradeTimestamp(date?: Date): number {
  if (!date) {
    return 0;
  }

  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatTimelineDate(date: Date | string): string {
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "Unknown Date";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getGradeTimelineLabel(grade: Grade): string | undefined {
  const parts = [grade.subjectName, grade.description]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(" - ");
}

function isStableTimeline(history: AverageHistoryItem[]): boolean {
  if (history.length <= 1) {
    return true;
  }

  const numericValues = history
    .map((item) => item.average)
    .filter((value) => Number.isFinite(value));

  if (numericValues.length <= 1) {
    return true;
  }

  return Math.max(...numericValues) - Math.min(...numericValues) <= 0.01;
}

function getStableGraphRange(
  history: AverageHistoryItem[],
  points: GraphPoint[],
  scale: number
): {
  x: { min: Date; max: Date };
  y: { min: number; max: number };
} | undefined {
  if (points.length === 0) {
    return undefined;
  }

  const numericValues = history
    .map((item) => item.average)
    .filter((value) => Number.isFinite(value));

  if (numericValues.length === 0) {
    return undefined;
  }

  const minValue = Math.min(...numericValues);
  const maxValue = Math.max(...numericValues);
  if (maxValue - minValue > 0.01) {
    return undefined;
  }

  const value = numericValues[numericValues.length - 1] ?? points[points.length - 1]?.value ?? 0;
  const padding = Math.max(scale * 0.12, 1);

  return {
    x: {
      min: points[0]!.date,
      max: points[points.length - 1]!.date,
    },
    y: {
      min: value - padding,
      max: value + padding,
    },
  };
}
