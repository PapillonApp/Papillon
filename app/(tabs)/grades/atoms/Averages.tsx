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
import { TouchableOpacity, View } from "react-native";
import { LineGraph } from "react-native-graph";
import Reanimated, { LinearTransition } from "react-native-reanimated";

const algorithms = [
  {
    key: "subjects",
    label: "Moyenne des matières",
    description: "Calcule la moyenne pondérée des moyennes de matières",
    algorithm: PapillonSubjectAvg,
    canInjectRealAverage: true,
  },
  {
    key: "weighted",
    label: "Moyenne pondérée",
    description: "Calcule la moyenne pondérée de toutes les notes",
    algorithm: PapillonWeightedAvg,
  }
]

const Averages = ({ grades, realAverage }: { grades: Grade[], realAverage?: number }) => {
  try {
    const theme = useTheme();
    const accent = theme.colors.primary;

    const [algorithm, setAlgorithm] = useState(algorithms[0]);
    const [scale, setScale] = useState(20);

    const currentAverageHistory = useMemo(() => {
      const history = PapillonGradesAveragesOverTime(algorithm.algorithm, grades, "studentScore");
      if (algorithm.canInjectRealAverage && realAverage) {
        history.push({
          average: realAverage,
          date: new Date(),
        });
      }
      return history;
    }, [grades, algorithm, realAverage]);

    const initialAverage = useMemo(() => {
      if (algorithm.canInjectRealAverage && realAverage) {
        return {
          average: realAverage,
          date: new Date(),
        };
      }

      return currentAverageHistory[currentAverageHistory.length - 1];
    }, [currentAverageHistory, algorithm, realAverage]);

    const [shownAverage, setShownAverage] = useState(initialAverage ? initialAverage.average : 0);
    const [shownDate, setShownDate] = useState(initialAverage ? initialAverage.date : new Date());

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
      return adjust(accent, theme.dark ? -0.93 : 0.93);
    }, [accent, theme.dark]);

    return (
      <Reanimated.View
        style={{
          backgroundColor: backgroundColor,
          borderRadius: 18,
          borderCurve: "continuous",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.text + "25",
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.16,
          shadowRadius: 1.5,
        }}
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
              height: 130,
              marginLeft: -30,
              marginTop: -30,
            }}
          >

            <LineGraph
              points={graphAxis}
              animated={true}
              color={accent}
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
          </View>
        </View>

        <Stack animated direction="horizontal" hAlign="end" vAlign="end" style={{ marginTop: -12 }}>
          <AnimatedNumber variant="h1" color={accent}>
            {shownAverage.toFixed(2)}
          </AnimatedNumber>
          <Dynamic animated>
            <Typography variant="title" style={{ color: accent, marginBottom: 2, opacity: 0.5 }}>
              /{scale}
            </Typography>
          </Dynamic>
        </Stack>

        <MenuView
          actions={algorithms.map((algo) => ({
            id: algo.key,
            title: algo.label,
            subtitle: algo.description,
            state: algorithm.key === algo.key ? "on" : "off",
          }))}
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;

            setAlgorithm(algorithms.find((algo) => algo.key === actionId)!);
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
              "estimée au " + shownDate.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
          </Typography>
        </Dynamic>
        <View style={{ height: 14 }} />
      </Reanimated.View>
    );
  }
  catch (e) {
    console.error(e);
    return null;
  }
};

export default Averages;
