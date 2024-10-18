import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import {
  getAveragesHistory,
  getPronoteAverage,
  GradeHistory,
} from "@/utils/grades/getAverages";
import { useTheme } from "@react-navigation/native";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";

import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

import * as Haptics from "expo-haptics";
import { PressableScale } from "react-native-pressable-scale";

import ReanimatedGraph, {
  ReanimatedGraphPublicMethods,
} from "@birdwingo/react-native-reanimated-graph";
import { useCurrentAccount } from "@/stores/account";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import type { Grade } from "@/services/shared/Grade";

interface GradesAverageGraphProps {
  grades: Grade[];
  overall: number | null;
}

const GradesAverageGraph: React.FC<GradesAverageGraphProps> = ({
  grades,
  overall,
}) => {
  const theme = useTheme();
  const account = useCurrentAccount((store) => store.account!);

  const [gradesHistory, setGradesHistory] = useState<GradeHistory[]>([]);
  const [hLength, setHLength] = useState(0);

  const [currentAvg, setCurrentAvg] = useState(0);
  const [originalCurrentAvg, setOriginalCurrentAvg] = useState(0);
  const [classAvg, setClassAvg] = useState(0);
  const [maxAvg, setMaxAvg] = useState(0);
  const [minAvg, setMinAvg] = useState(0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const originalCurrentAvgRef = useRef(originalCurrentAvg);
  const graphRef = useRef<ReanimatedGraphPublicMethods>(null);
  const gradesHistoryRef = useRef(gradesHistory);

  useEffect(() => {
    if (currentAvg !== originalCurrentAvg) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentAvg]);

  // on grades change, set selected date to null
  useEffect(() => {
    setSelectedDate(null);
  }, [grades]);

  useEffect(() => {
    let hst = getAveragesHistory(grades, "student", overall ?? void 0);
    if (hst.length === 0) return;

    let cla = getAveragesHistory(grades, "average");

    let maxAvg = getPronoteAverage(grades, "max");
    let minAvg = getPronoteAverage(grades, "min");

    setGradesHistory(hst);
    setHLength(hst.length);

    gradesHistoryRef.current = hst;

    setCurrentAvg(hst[hst.length - 1].value);
    setOriginalCurrentAvg(hst[hst.length - 1].value);

    originalCurrentAvgRef.current = hst[hst.length - 1].value;

    setClassAvg(cla[cla.length - 1].value);

    setMaxAvg(maxAvg);
    setMinAvg(minAvg);

    graphRef.current?.updateData({
      xAxis: hst.map((p, i) => new Date(p.date).getTime()),
      yAxis: hst.map((p) => p.value),
    });
  }, [grades, account.instance]);

  const updateTo = useCallback(
    (index: number) => {
      if (index < 0 || index > gradesHistoryRef.current.length - 1) return;
      if (!gradesHistoryRef.current[index]?.value) return;

      setSelectedDate(gradesHistoryRef.current[index].date);
      setCurrentAvg(gradesHistoryRef.current[index].value);
    },
    [gradesHistoryRef]
  );

  const resetToOriginal = useCallback(() => {
    setSelectedDate(null);
    setCurrentAvg(originalCurrentAvgRef.current);
  }, [originalCurrentAvgRef]);

  return (
    <PressableScale
      style={{
        paddingTop: 0,
      }}
      activeScale={0.975}
      weight="light"
      onPress={() => setShowDetails(!showDetails)}
    >
      {hLength > 0 && (
        <NativeList animated>
          <Reanimated.View
            layout={animPapillon(LinearTransition)}
            key={theme.colors.primary + account.instance}
          >
            {hLength > 1 ? (
              <Reanimated.View
                layout={animPapillon(LinearTransition)}
                entering={FadeIn}
                exiting={FadeOut}
                style={{
                  paddingTop: 16,
                  marginVertical: -16,
                  marginLeft: -14,
                }}
              >
                <ReanimatedGraph
                  xAxis={gradesHistory.map((p, i) =>
                    new Date(p.date).getTime()
                  )}
                  yAxis={gradesHistory.map((p) => p.value)}
                  color={theme.colors.primary}
                  showXAxisLegend={false}
                  showYAxisLegend={false}
                  showExtremeValues={false}
                  widthRatio={0.95}
                  height={120}
                  showBlinkingDot={true}
                  selectionLines={"none"}
                  ref={graphRef}
                  animationDuration={400}
                  onGestureUpdate={(x, y, index) => {
                    if (index < 0 || index > gradesHistory.length - 1) return;
                    if (!gradesHistory[index]?.value) return;

                    updateTo(index);
                  }}
                  onGestureEnd={() => {
                    resetToOriginal();
                  }}
                />
              </Reanimated.View>
            ) : (
              <View />
            )}

            <Reanimated.View
              style={[
                styles.gradeBoth,
                Platform.OS === "android" && {
                  marginTop: 0,
                },
              ]}
              layout={animPapillon(LinearTransition)}
            >
              <View style={[styles.gradeInfo]}>
                {selectedDate ? (
                  <Reanimated.View
                    key={"sDateG"}
                    entering={animPapillon(FadeInDown)}
                    exiting={animPapillon(FadeOutUp)}
                  >
                    <NativeText
                      style={{ color: theme.colors.primary }}
                      numberOfLines={1}
                    >
                      au{" "}
                      {new Date(selectedDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </NativeText>
                  </Reanimated.View>
                ) : (
                  <Reanimated.View
                    key={"cAvgG"}
                    entering={animPapillon(FadeInDown)}
                    exiting={animPapillon(FadeOutUp)}
                  >
                    <NativeText numberOfLines={1}>Moyenne gén.</NativeText>
                  </Reanimated.View>
                )}

                <Reanimated.View
                  style={[styles.gradeValue]}
                  layout={animPapillon(LinearTransition)}
                >
                  <AnimatedNumber
                    value={currentAvg.toFixed(2)}
                    style={styles.gradeNumber}
                    contentContainerStyle={{ marginLeft: -2 }}
                  />

                  <Reanimated.View layout={animPapillon(LinearTransition)}>
                    <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                  </Reanimated.View>
                </Reanimated.View>
              </View>
              <View style={[styles.gradeInfo, styles.gradeRight]}>
                <NativeText numberOfLines={1}>Moyenne classe</NativeText>
                <Reanimated.View
                  style={[styles.gradeValue]}
                  layout={animPapillon(LinearTransition)}
                >
                  <AnimatedNumber
                    value={classAvg.toFixed(2)}
                    style={styles.gradeNumberClass}
                  />
                  <Reanimated.View layout={animPapillon(LinearTransition)}>
                    <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                  </Reanimated.View>
                </Reanimated.View>
              </View>
            </Reanimated.View>

            {showDetails && maxAvg > 0 && minAvg > 0 ? (
              <Reanimated.View
                layout={animPapillon(LinearTransition)}
                entering={FadeIn}
                exiting={FadeOut}
                key={"detailsG"}
                style={{
                  borderTopColor: theme.colors.border,
                  borderTopWidth: 0.5,
                  paddingTop: 0,
                  paddingLeft: 4,
                  paddingRight: 8,
                }}
              >
                <NativeItem
                  trailing={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "flex-end",
                      }}
                    >
                      <NativeText variant="titleLarge">
                        {maxAvg.toFixed(2)}
                      </NativeText>
                      <NativeText variant="subtitle">/20</NativeText>
                    </View>
                  }
                  separator
                >
                  <NativeText variant="subtitle">Moyenne max.</NativeText>
                </NativeItem>
                <NativeItem
                  trailing={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "flex-end",
                      }}
                    >
                      <NativeText variant="titleLarge">
                        {minAvg.toFixed(2)}
                      </NativeText>
                      <NativeText variant="subtitle">/20</NativeText>
                    </View>
                  }
                >
                  <NativeText variant="subtitle">Moyenne min.</NativeText>
                </NativeItem>
              </Reanimated.View>
            ) : (
              <View />
            )}
          </Reanimated.View>
        </NativeList>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  gradeBoth: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  gradeInfo: {
    flex: 1,
    gap: 3,
  },
  gradeRight: {
    alignItems: "flex-end",
    opacity: 0.5,
  },
  gradeValue: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  gradeNumber: {
    fontSize: 24,
    lineHeight: 24,
    fontFamily: "semibold",
    letterSpacing: 0.3,
  },
  gradeNumberClass: {
    fontSize: 24,
    lineHeight: 24,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  gradeOutOf: {
    fontSize: 16,
    lineHeight: 16,
    marginLeft: 2,
    opacity: 0.6,
    letterSpacing: 1,
  },
});

export default GradesAverageGraph;
