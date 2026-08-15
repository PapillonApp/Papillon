import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorValue, Platform, TouchableOpacity, View } from "react-native";
import { LineGraph } from "react-native-graph";
import { LayoutAnimationConfig } from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import { Host, HStack, Text } from "@expo/ui/swift-ui";
import { useFont } from "@/utils/theme/fonts";

import { Grade } from "@/services/shared/grade";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import PapillonMedian from "@/utils/grades/algorithms/median";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonGradesAveragesOverTime from "@/utils/grades/algorithms/time";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import {
  GradeDisplayScale,
  getDisplayDenominator,
  getDisplayScaleMax,
  toDisplayScaleFrom20,
} from "@/utils/grades/scale";

import { calculateAmplifiedGraphPoints, GraphPoint } from "../utils/graph";
import ActionMenu from "@/ui/components/ActionMenu";
import { trackAdvancedEvent } from "@/utils/logger/analytics";
import {
  Animation,
  animation,
  contentTransition,
  font,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import useResizable from "@/ui/utils/Resizable";

const algorithms = [
  {
    key: "subjects",
    label: t("Grades_Avg_Subject_Title"),
    description: t("Grades_Avg_Subject_Description"),
    algorithm: PapillonSubjectAvg,
    canInjectRealAverage: true,
    sfsymbol: "square.stack.3d.up.fill",
  },
  {
    key: "weighted",
    label: t("Grades_Avg_All_Pond"),
    description: t("Grades_Avg_All_Pond_Description"),
    algorithm: PapillonWeightedAvg,
    sfsymbol: "plus.forwardslash.minus",
  },
  {
    key: "median",
    label: t("Grades_Avg_Median_Title"),
    description: t("Grades_Avg_Median_Description"),
    algorithm: PapillonMedian,
    sfsymbol: "chart.bar.xaxis.ascending",
  },
];

const Averages = ({
  grades,
  realAverage,
  color,
  displayScale = "20",
  inline = false,
  paddingTop = 0,
  largeElement = undefined,
}: {
  grades: Grade[];
  realAverage?: number;
  color?: ColorValue;
  displayScale?: GradeDisplayScale;
  inline?: boolean;
  paddingTop?: number;
  largeElement?: ReactNode;
}) => {
  try {
    const theme = useTheme();
    const accent = color || theme.colors.primary;
    const adjustedColor = adjust(accent, theme.dark ? 0.2 : -0.2);
    const papillonFont = useFont();
    const resizable = useResizable();

    const [algorithm, setAlgorithm] = useState(algorithms[0]);

    const currentAverageHistory = useMemo(() => {
      if (!grades || grades.length === 0) {
        return [];
      }
      try {
        const history = PapillonGradesAveragesOverTime(
          algorithm.algorithm,
          grades,
          "studentScore"
        );
        if (algorithm.canInjectRealAverage && realAverage) {
          history.push({
            average: realAverage,
            date: new Date(),
          });
        }
        return history.map(entry => ({
          ...entry,
          average: toDisplayScaleFrom20(entry.average, displayScale),
        }));
      } catch (e) {
        console.error("Error calculating average history:", e);
        return [];
      }
    }, [grades, algorithm, realAverage, displayScale]);

    const initialAverage = useMemo(() => {
      if (currentAverageHistory.length === 0) {
        return {
          average: 0,
          date: new Date(),
        };
      }

      if (algorithm.canInjectRealAverage && realAverage) {
        return {
          average: toDisplayScaleFrom20(realAverage, displayScale),
          date: new Date(),
        };
      }

      if (!currentAverageHistory || currentAverageHistory.length === 0) {
        return null;
      }
      return currentAverageHistory[currentAverageHistory.length - 1];
    }, [currentAverageHistory, algorithm, realAverage, displayScale]);

    const [shownAverage, setShownAverage] = useState(
      initialAverage ? initialAverage.average : 0
    );
    const [shownDate, setShownDate] = useState(
      initialAverage ? initialAverage.date : new Date()
    );

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

    const handleGestureUpdate = useCallback(
      (p: {
        value: number;
        date: Date;
        originalValue?: number;
        originalDate?: Date;
      }) => {
        setActive(true);
        setShownAverage(p.originalValue ?? p.value);
        setShownDate(p.originalDate ?? p.date);
      },
      []
    );

    const handleGestureEnd = useCallback(() => {
      setActive(false);
      setShownAverage(initialAverage ? initialAverage.average : 0);
      setShownDate(initialAverage ? initialAverage.date : new Date());
    }, [initialAverage]);

    useEffect(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [active]);

    const graphAxis = useMemo<GraphPoint[]>(() => {
      return calculateAmplifiedGraphPoints(
        currentAverageHistory,
        getDisplayScaleMax(displayScale)
      );
    }, [currentAverageHistory, displayScale]);

    const displayedRealAverage = useMemo(() => {
      if (realAverage === undefined) {
        return undefined;
      }

      return toDisplayScaleFrom20(realAverage, displayScale);
    }, [realAverage, displayScale]);

    const isRealAverage = useMemo(() => {
      return shownAverage === displayedRealAverage;
    }, [shownAverage, displayedRealAverage]);

    const backgroundColor = useMemo(() => {
      return adjust(accent, theme.dark ? -0.89 : 0.8);
    }, [accent, theme.dark]);

    if (!grades || grades.length === 0) {
      // You might want to return null or a placeholder here if there are absolutely no grades
      // But if realAverage exists, we might still want to show something?
      // For now, if there's no history and no real average, we can return null or render empty state.
      if (!realAverage) {
        return null;
      }
    }

    graphAxis.forEach(item => {
      item.value = Math.round(item.value * 100) / 100;
    });

    const hasOnlySkills = grades.every(
      grade =>
        grade.studentScore?.disabled === true || (grade.skills?.length ?? 0) > 0
    );

    if (hasOnlySkills) return null;

    return (
      <Reanimated.View
        style={{
          width: "100%",
          paddingTop: inline ? 0 : 220 + paddingTop + 20,
          marginBottom: inline ? 0 : -30,
          borderRadius: inline ? 25 : 0,
          overflow: inline ? "hidden" : "visible",
          height: inline ? undefined : resizable.isLarge ? 420 : 220,
        }}
        entering={!inline ? PapillonAppearIn : undefined}
        exiting={!inline ? PapillonAppearOut : undefined}
      >
        <LayoutAnimationConfig skipEntering={true} skipExiting={true}>
          <Stack
            hAlign="center"
            vAlign="center"
            direction={"vertical"}
            gap={0}
            style={[
              Platform.OS === "android" && {
                borderWidth: 0,
                backgroundColor: theme.colors.card,
                elevation: 0,
              },
              inline
                ? {
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    marginTop: -8,
                    height: 120
                  }
                : {
                    position: "absolute",
                    top: paddingTop,
                    left: -16,
                    right: -16,
                  },
            ]}
          >
            {Platform.OS === "ios" && (
              <LinearGradient
                colors={[backgroundColor + "90", backgroundColor + "00"]}
                start={inline ? [0, 1] : [0, 0.8]}
                end={inline ? [0, 0] : [0, 1]}
                style={{
                  position: "absolute",
                  top: inline ? 0 : -500,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                }}
              />
            )}

            <View
              style={{
                height: 120,
                width: "100%",
                marginLeft: inline ? -2 : 0,
                marginTop: -10,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 125,
                  marginLeft: -30,
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
                    lineThickness={inline ? 4.5 : 5}
                    panGestureDelay={0}
                    enableIndicator={true}
                    enableFadeInMask={false}
                    indicatorPulsating={true}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : null}
              </View>
            </View>

            <Stack
              flex
              inline
              width={"100%"}
              direction={"horizontal"}
              hAlign={"center"}
              height={inline ? 80 : resizable.isLarge ? 140 : 100}
              style={
                inline
                  ? {
                      position: "absolute",
                      inset: 0,
                      height: "100%",
                    }
                  : undefined
              }
            >
              <Stack
                inline
                hAlign={"start"}
                vAlign={"center"}
                gap={0}
                style={[
                  {
                    paddingHorizontal: 20,
                    width: resizable.isLarge ? 200 : "100%",
                  },
                  inline && {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                  },
                ]}
              >
                {Platform.OS === "ios" && inline && (
                  <LinearGradient
                    colors={[
                      theme.colors.background,
                      `${theme.colors.background.toString()}AA`,
                      `${theme.colors.background.toString()}00`,
                    ]}
                    start={[0, 0]}
                    end={[0.7, 0]}
                    style={{ position: "absolute", inset: 0 }}
                    pointerEvents="none"
                  />
                )}
                {Platform.OS === "ios" ? (
                  <Host matchContents>
                    <HStack
                      alignment="firstTextBaseline"
                      spacing={1}
                      modifiers={[animation(Animation.default, shownAverage)]}
                    >
                      <Text
                        modifiers={[
                          font({ family: papillonFont("bold"), size: 30 }),
                          contentTransition("numericText"),
                          animation(Animation.default, shownAverage),
                          foregroundStyle(adjustedColor),
                        ]}
                      >
                        {shownAverage ? shownAverage.toFixed(2) : "0.00"}
                      </Text>
                      <Text
                        modifiers={[
                          font({ family: papillonFont("bold"), size: 20 }),
                          padding({ top: 1 }),
                          animation(Animation.default, shownAverage),
                          foregroundStyle(adjustedColor),
                        ]}
                      >
                        {getDisplayDenominator(displayScale)}
                      </Text>
                    </HStack>
                  </Host>
                ) : (
                  <Stack
                    animated
                    direction="horizontal"
                    hAlign="end"
                    vAlign="end"
                    gap={2}
                  >
                    <AnimatedNumber
                      variant={inline ? "h2" : "h1"}
                      color={adjustedColor}
                    >
                      {shownAverage ? shownAverage.toFixed(2) : "0.00"}
                    </AnimatedNumber>

                    <Dynamic animated>
                      <Typography
                        variant="title"
                        style={{
                          color: adjustedColor,
                          marginBottom: inline ? 1 : 3,
                          opacity: 0.7,
                        }}
                      >
                        {getDisplayDenominator(displayScale)}
                      </Typography>
                    </Dynamic>
                  </Stack>
                )}

                <ActionMenu
                  actions={[
                    {
                      title: t("Grades_Avg_Methods"),
                      subactions: algorithms.map(algo => ({
                        id: "setAlg:" + algo.key,
                        title: algo.label,
                        subtitle: algo.description,
                        state: algorithm.key === algo.key ? "on" : "off",
                        image: Platform.select({
                          ios: algo.sfsymbol,
                        }),
                        imageColor: theme.colors.text,
                      })),
                      displayInline: true,
                    },
                    {
                      id: "open:more",
                      papicon: "info",
                      title: t("Grades_Avg_KnowMore"),
                      subtitle: t("Grades_Avg_KnowMore_Description"),
                      image: Platform.select({
                        ios: "info.circle",
                      }),
                      imageColor: theme.colors.text,
                    },
                  ]}
                  onPressAction={({ nativeEvent }) => {
                    const actionId = nativeEvent.event;

                    if (actionId.startsWith("open:")) {
                      if (actionId === "open:more") {
                        WebBrowser.openBrowserAsync(
                          "https://docs.papillon.bzh/support/kb/averages",
                          {
                            presentationStyle: "pageSheet",
                          }
                        );
                      }
                    }

                    if (actionId.startsWith("setAlg:")) {
                      const nextAlgorithm = algorithms.find(
                        algo => algo.key === actionId.slice(7)
                      );
                      if (nextAlgorithm) {
                        setAlgorithm(nextAlgorithm);
                        trackAdvancedEvent(
                          "grades_calculation_method_changed",
                          {
                            method: nextAlgorithm.key,
                          }
                        );
                      }
                    }
                  }}
                >
                  <TouchableOpacity
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <Stack
                      hAlign="center"
                      vAlign={"start"}
                      direction="horizontal"
                      width={"100%"}
                      style={{ marginTop: 0 }}
                    >
                      <Typography
                        variant={inline ? "body1" : "title"}
                        weight="bold"
                        align="center"
                      >
                        {algorithm.label}
                      </Typography>
                      <Icon size={20} opacity={0.5}>
                        <Papicons name="chevronDown" />
                      </Icon>
                    </Stack>
                  </TouchableOpacity>
                </ActionMenu>

                <Dynamic
                  animated
                  key={"dateSource:" + (isRealAverage ? "real" : "estimated")}
                >
                  <Typography
                    variant={inline ? "body2" : "body1"}
                    color="textSecondary"
                    style={{ marginTop: inline ? 0 : 1 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    align={inline ? "left" : "center"}
                  >
                    {isRealAverage
                      ? "par l'établissement"
                      : "estimée au " +
                        (shownDate instanceof Date &&
                        !isNaN(shownDate.getTime())
                          ? shownDate.toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unknown Date")}
                  </Typography>
                </Dynamic>
                {!inline && <View style={{ height: 14 }} />}
              </Stack>
              {!inline && (
                <View style={{ flex: 1, marginLeft: -20 }}>
                  {largeElement && largeElement}
                </View>
              )}
            </Stack>
          </Stack>
        </LayoutAnimationConfig>
      </Reanimated.View>
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;
