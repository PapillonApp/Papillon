import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColorValue, FlatList, Platform, TouchableOpacity, View } from "react-native";
import { LineGraph } from "react-native-graph";

import GlassContainer from "@/ui/new/GlassContainer";

import { useFont } from '@/utils/theme/fonts';
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

import { 
  Host as SwiftUIHost,
  Text as SwiftUIText,
  HStack as SwiftUIHStack,
  Spacer as SwiftUISpacer,
  VStack as SwiftUIVStack,
  Picker as SwiftUIPicker,
  Popover as SwiftUIPopover,
} from "@expo/ui/swift-ui";

import {
  Animation,
  animation,
  contentTransition,
  font,
  foregroundStyle,
  padding,
  pickerStyle,
  tag,
  tint,
} from "@expo/ui/swift-ui/modifiers";

import { Host, BottomSheet, RNHostView } from '@expo/ui';
import List from "@/ui/new/List";
import Checkbox from "@/ui/new/Checkbox";
import { Leading } from "@/ui/components/Item";
import useResizable from "@/ui/utils/Resizable";


const algorithms: { key: AverageMethodKey; label: string; description: string; recommended?: boolean; papicon?: string; sfsymbol: string }[] = [
  {
    key: "subject",
    label: t("Grades_Avg_Subject_Title"),
    description: "Additionne les moyennes de chacune des matières.",
    sfsymbol: "square.stack.3d.up.fill",
    papicon: "grades",
    recommended: true,
  },
  {
    key: "weighted",
    label: t("Grades_Avg_All_Pond"),
    description: "Moyenne des notes individuelles sans tenir compte des matières.",
    sfsymbol: "plus.forwardslash.minus",
    papicon: "pie"
  },
  {
    key: "median",
    label: t("Grades_Avg_Median_Title"),
    description: "Médiane des notes (autant de notes au dessus qu'en dessous).",
    sfsymbol: "chart.bar.xaxis.ascending",
    papicon: "piggybank"
  },
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
    const papillonFont = useFont();
    const { isLarge } = useResizable();

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
        horizontalPadding={32}
        lineThickness={4}
        panGestureDelay={0}
        indicatorPulsating
        enableIndicator
        style={{ height: "100%", marginLeft: -36, marginRight: -10 }}
      />
    ) : null;

    const [algorithmSheetPresented, setAlgorithmSheetPresented] = useState(false);

    const algorithmPicker = () => {
      return (
        <View style={{ padding: 0, gap: 8, maxWidth: 600, alignSelf: "center" }}>
              <View style={{ gap: 4, padding: 8 }}>
                <Typography variant="h4">
                  Calcul de la moyenne générale
                </Typography>
                <Typography color="textSecondary" variant="body1">
                  Il existe de nombreuses manières de calculer ta moyenne générale. Utilise ce panneau pour t'aider à le sélectionner.
                </Typography>
              </View>

              <List scrollEnabled={false} style={{ padding: 0, margin: 0 }}>
                <List.Section>
                  {algorithms.map((algo) => (
                    <List.Item
                      key={algo.key}
                      onPress={() => {
                        setAlgorithm(algo);
                        setTimeout(() => {
                          setAlgorithmSheetPresented(false);
                        }, 100);
                      }}
                    > 
                      <List.Leading>
                        <Icon papicon>
                          <Papicons name={algo.papicon} />
                        </Icon>
                      </List.Leading>

                      <Typography variant="action">
                        {algo.label}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        {algo.description}
                      </Typography>

                      {algo.recommended && (
                        <Typography variant="body1" weight="semibold" color="primary">
                          Recommandé
                        </Typography>
                      )}

                      <List.Trailing>
                        <Checkbox checked={algorithm.key === algo.key} onChange={() => {
                          setAlgorithm(algo);
                          setTimeout(() => {
                            setAlgorithmSheetPresented(false);
                          }, 100);
                        }} />
                      </List.Trailing>
                    </List.Item>
                  ))}
                </List.Section>
              </List>

              <View style={{ gap: 4, padding: 8, marginBottom: isLarge ? 16 : 0 }}>
                <Typography variant="caption" weight="regular" color="textSecondary">
                  Papillon ne peut pas précisément connaître ta moyenne générale. Hormis si c'est indiqué, la moyenne affichée est une estimation et peut différer de ton bulletin.
                </Typography>
              </View>
            </View>
      )
    }

    return (
      <View style={{ backgroundColor: theme.colors.item, borderRadius: 24, overflow: "hidden" }}>
        <View style={{ height: 140, marginBottom: -16 }}>
          {graph}
        </View>

        <View style={{ padding: 18, paddingTop: 0, width: '100%', gap: 1 }}>
          {Platform.OS === "ios" ? (
            <SwiftUIHost style={{ width: "100%", height: 38 }}>
              <SwiftUIHStack
                alignment="firstTextBaseline"
                spacing={1}
                modifiers={[animation(Animation.default, shownAverage)]}
              >
                <SwiftUIText
                  modifiers={[
                    font({ family: papillonFont("semibold"), size: 36 }),
                    contentTransition("numericText"),
                    animation(Animation.default, shownAverage),
                    foregroundStyle(adjustedColor),
                  ]}
                >
                  {shownAverage ? shownAverage.toFixed(2) : "0.00"}
                </SwiftUIText>
                <SwiftUIText
                  modifiers={[
                    font({ family: papillonFont("medium"), size: 20 }),
                    padding({ top: 1 }),
                    animation(Animation.default, shownAverage),
                    foregroundStyle(adjustedColor),
                  ]}
                >
                  {getDisplayDenominator(displayScale)}
                </SwiftUIText>
                <SwiftUISpacer />
              </SwiftUIHStack>
            </SwiftUIHost>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, marginBottom: -2 }}>
              <Typography
                variant="h1"
                weight="bold"
                style={{ color: adjustedColor }}
              >
                {shownAverage.toFixed(2)}
              </Typography>
              <Typography
                variant="body1"
                weight="medium"
                style={{ paddingBottom: 2, color: adjustedColor }}
              >
                {getDisplayDenominator(displayScale)}
              </Typography>
            </View>
          )}
          

          <TouchableOpacity onPress={() => setAlgorithmSheetPresented(true)} style={{ alignSelf: "flex-start" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Typography variant="title" weight="semibold">
                {algorithm.label}
              </Typography>

              <Icon size={16} opacity={0.5}>
                <Papicons name="chevronDown" />
              </Icon>
            </View>
          </TouchableOpacity>

          <Typography
            variant={ "body1"}
            color="textSecondary"
            numberOfLines={1}
            ellipsizeMode="tail"
            align="left"
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
        </View>

         <BottomSheet
          isPresented={algorithmSheetPresented}
          onDismiss={() => setAlgorithmSheetPresented(false)}
        >
          <RNHostView matchContents>
            {algorithmPicker()}
          </RNHostView>
        </BottomSheet>
      </View>
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;
