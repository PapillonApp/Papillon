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
import { View, StyleSheet, Platform, TouchableOpacity, Linking } from "react-native";

import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
  FadeOutLeft,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";


import * as Haptics from "expo-haptics";
import { PressableScale } from "react-native-pressable-scale";
import { ReanimatedGraphProps, ReanimatedGraphPublicMethods } from "@birdwingo/react-native-reanimated-graph/src/core/dto/graphDTO";
import { useCurrentAccount } from "@/stores/account";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import type { Grade } from "@/services/shared/Grade";
import { AlertTriangle, Check, ExternalLink, PieChart, TrendingUp } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
// Using require to set custom types bc module types are broken
const ReanimatedGraph: React.ForwardRefExoticComponent<ReanimatedGraphProps & React.RefAttributes<ReanimatedGraphPublicMethods>> = require("@birdwingo/react-native-reanimated-graph").default;
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

interface GradesAverageGraphProps {
  grades: Grade[];
  overall: number | null;
  classOverall: number | null;
}

const GradesAverageGraph: React.FC<GradesAverageGraphProps> = ({
  grades,
  overall,
  classOverall,
}) => {
  const theme = useTheme();
  const account = useCurrentAccount((store) => store.account!);
  const { showAlert } = useAlert();
  const { playHaptics } = useSoundHapticsWrapper();

  const [gradesHistory, setGradesHistory] = useState<GradeHistory[]>([]);
  const [hLength, setHLength] = useState(0);

  const [currentAvg, setCurrentAvg] = useState(0);
  const [originalCurrentAvg, setOriginalCurrentAvg] = useState(0);
  const [classAvg, setClassAvg] = useState<number>(0);
  const [maxAvg, setMaxAvg] = useState(0);
  const [minAvg, setMinAvg] = useState(0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const originalCurrentAvgRef = useRef(originalCurrentAvg);
  const graphRef = useRef<ReanimatedGraphPublicMethods>(null);
  const gradesHistoryRef = useRef(gradesHistory);

  useEffect(() => {
    if (currentAvg !== originalCurrentAvg) {
      playHaptics("impact", {
        impact: Haptics.ImpactFeedbackStyle.Light,
      });
    }
  }, [currentAvg]);

  // on grades change, set selected date to null
  useEffect(() => {
    setSelectedDate(null);
  }, [grades]);

  useEffect(() => {
    let hst = getAveragesHistory(grades, "student", overall ?? void 0);
    if (hst.length === 0) return;

    let cla = getAveragesHistory(grades, "average", classOverall ?? void 0);

    let maxAvg = getPronoteAverage(grades, "max");
    let minAvg = getPronoteAverage(grades, "min");

    const finalAvg = getPronoteAverage(grades, "student");

    setGradesHistory(hst);
    setHLength(hst.length);

    gradesHistoryRef.current = hst;

    setCurrentAvg(hst[hst.length - 1].value);
    setOriginalCurrentAvg(hst[hst.length - 1].value);

    originalCurrentAvgRef.current = hst[hst.length - 1].value;

    setClassAvg(cla[cla.length - 1].value);

    setMaxAvg(maxAvg);
    setMinAvg(minAvg);

    hst = hst.filter((p) => isNaN(p.value) === false);

    graphRef.current?.updateData({
      xAxis: hst.length > 0 ? hst.map((p, i) => new Date(p.date).getTime()) : [Date.now()],
      yAxis: hst.length > 0 ? hst.map((p) => p.value) : [10],
    });
  }, [grades, account.instance]);

  const updateTo = useCallback(
    (index: number, x: number, y: number) => {
      try {
        if (index < 0 || index > gradesHistoryRef.current.length - 1) return;
        if (!gradesHistoryRef.current[index]?.value) return;

        setSelectedDate(gradesHistoryRef.current[index].date);
        setCurrentAvg(gradesHistoryRef.current[index].value);
      }
      catch (e) {
        console.error(e);
      }
    },
    [gradesHistoryRef]
  );

  const resetToOriginal = useCallback(() => {
    setSelectedDate(null);
    setCurrentAvg(originalCurrentAvgRef.current);
  }, [originalCurrentAvgRef]);

  const theoryAvgDisclaimer = useCallback(() => {
    showAlert({
      title: "Moyenne théorique",
      message: "La moyenne théorique est calculée en prenant en compte toutes les moyennes de tes matières. Elle est donc purement indicative et ne reflète pas la réalité des différentes options ou variations.",
      icon: <TrendingUp />,
    });
  }, []);

  const estimatedAvgDisclaimer = useCallback(() => {
    showAlert({
      title: "Moyenne générale estimée",
      message: "L'estimation automatique des moyennes n'est pas une information exacte, mais une approximation qui essaye de s'en rapprocher un maximum.",
      icon: <PieChart />,
      actions: [
        {
          title: "En savoir plus",
          icon: <ExternalLink />,
          onPress: () => {
            Linking.openURL("https://docs.papillon.bzh/kb/averages");
          }
        },
        {
          title: "OK",
          icon: <Check />,
          primary: true,
        }
      ]
    });
  }, []);

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
        <NativeList animated layout={anim2Papillon(LinearTransition)}>
          <Reanimated.View
            layout={anim2Papillon(LinearTransition)}
            key={theme.colors.primary + account.instance}
          >
            {((showDetails && !overall) || selectedDate) && (
              <Reanimated.View
                style={{
                  height: 10,
                }}
              />
            )}

            {((showDetails && !overall) || selectedDate) && (
              <TouchableOpacity
                onPress={() => {
                  estimatedAvgDisclaimer();
                }}
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 100,
                }}
              >
                <Reanimated.View
                  style={{
                    backgroundColor: theme.colors.primary + "22",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderCurve: "continuous",
                    zIndex: 100,
                  }}
                  entering={anim2Papillon(FadeInLeft)}
                  exiting={anim2Papillon(FadeOutLeft)}
                >
                  <Reanimated.Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.primary,
                      fontFamily: "semibold",
                    }}
                  >
                    Estimation
                  </Reanimated.Text>
                </Reanimated.View>
              </TouchableOpacity>
            )}

            {hLength > 1 ? (
              <Reanimated.View
                layout={anim2Papillon(LinearTransition)}
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
                  yAxis={gradesHistory.map((p) => !isNaN(p.value) ? p.value : (currentAvg ?? 10))}
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
                    updateTo(index, x, y);
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
              layout={anim2Papillon(LinearTransition)}
            >
              <View style={[styles.gradeInfo]}>
                {selectedDate ? (
                  <Reanimated.View
                    key={"sDateG"}
                    entering={anim2Papillon(FadeInDown)}
                    exiting={anim2Papillon(FadeOutUp)}
                  >
                    <NativeText
                      style={{ color: theme.colors.primary }}
                      numberOfLines={1}
                    >
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
                    entering={anim2Papillon(FadeInDown)}
                    exiting={anim2Papillon(FadeOutUp)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <NativeText numberOfLines={1}>
                      {(!overall || selectedDate) ? (
                        "Moyenne estimée"
                      ) : (
                        "Moyenne gén."
                      )}
                    </NativeText>



                    {(!overall || selectedDate) && (
                      <AlertTriangle
                        size={16}
                        color={theme.colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                  </Reanimated.View>
                )}

                <Reanimated.View
                  style={[styles.gradeValue]}
                  layout={anim2Papillon(LinearTransition)}
                >
                  <AnimatedNumber
                    value={currentAvg.toFixed(2)}
                    style={styles.gradeNumber}
                    contentContainerStyle={{ marginLeft: -2 }}
                  />

                  <Reanimated.View layout={anim2Papillon(LinearTransition)}>
                    <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                  </Reanimated.View>
                </Reanimated.View>
              </View>
              <View style={[styles.gradeInfo, styles.gradeRight]}>
                <NativeText numberOfLines={1}>Moyenne classe</NativeText>
                <Reanimated.View
                  style={[styles.gradeValue]}
                  layout={anim2Papillon(LinearTransition)}
                >
                  { !Number.isNaN(classAvg) ? (
                    <>
                      <AnimatedNumber
                        value={classAvg.toFixed(2)}
                        style={styles.gradeNumber}
                        contentContainerStyle={{ marginLeft: -2 }}
                      />
                      <Reanimated.View layout={anim2Papillon(LinearTransition)}>
                        <NativeText style={[styles.gradeOutOf]}>/20</NativeText>
                      </Reanimated.View>
                    </>
                  ) : (
                    <NativeText style={styles.gradeNumberClass}>Inconnue</NativeText>
                  )}
                </Reanimated.View>
              </View>
            </Reanimated.View>

            {showDetails && maxAvg > 0 && minAvg > 0 ? (
              <Reanimated.View
                layout={anim2Papillon(LinearTransition)}
                exiting={FadeOut}
                key={"detailsG"}
                style={{
                  borderTopColor: theme.colors.border,
                  borderTopWidth: 0,
                  paddingTop: 0,
                  marginTop: -4,
                }}
              >
                <NativeItem
                  entering={anim2Papillon(FadeInDown).delay(100)}
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
                  onPress={() => theoryAvgDisclaimer()}
                  separator
                  chevron={false}
                  style={{ paddingHorizontal: 4 }}
                >
                  <NativeText variant="subtitle">Moyenne théorique max.</NativeText>
                </NativeItem>
                <NativeItem
                  entering={anim2Papillon(FadeInDown).delay(200)}
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
                  onPress={() => theoryAvgDisclaimer()}
                  chevron={false}
                  style={{ paddingHorizontal: 4 }}
                >
                  <NativeText variant="subtitle">Moyenne théorique min.</NativeText>
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
