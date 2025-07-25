import React, { useCallback, useState, useMemo, useRef } from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import { useTheme } from "@react-navigation/native";

import { MenuView, MenuComponentRef } from '@react-native-menu/menu';
import ReanimatedGraph, { ReanimatedGraphPublicMethods } from '@birdwingo/react-native-reanimated-graph';

import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Reanimated, { Easing, FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import Grade from "@/ui/components/Grade";
import Subject from "@/ui/components/Subject";
import Stack from "@/ui/components/Stack";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";
import Icon from "@/ui/components/Icon";
import { Filter, RefreshCcw, Search } from "lucide-react-native";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonMedian from "@/utils/grades/algorithms/median";
import { useHeaderHeight } from "@react-navigation/elements";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { Animation } from "@/ui/utils/Animation";

const sortings = [
  {
    label: "Alphabétique",
    value: "alphabetical",
    icon: {
      ios: "character",
      android: "ic_alphabetical",
    }
  },
  {
    label: "Moyennes",
    value: "averages",
    icon: {
      ios: "chart.xyaxis.line",
      android: "ic_averages",
    }
  },
  {
    label: "Date",
    value: "date",
    icon: {
      ios: "calendar",
      android: "ic_date",
    }
  },
];

const avgAlgorithms = [
  {
    label: "Moyenne générale",
    subtitle: "Toutes les notes",
    value: "subject",
    algorithm: (grades) => PapillonSubjectAvg(grades)
  },
  {
    label: "Moyenne des matières",
    subtitle: "Pondération",
    value: "weighted",
    algorithm: (grades) => PapillonWeightedAvg(grades)
  },
  {
    label: "Médiane",
    subtitle: "Toutes les notes",
    value: "median",
    algorithm: (grades) => PapillonMedian(grades)
  },
]

const subjects = [
  {
    id: "fran",
    name: "Français",
    icon: "🇫🇷",
    color: "#8BC600",
    average: {
      student: 12.2,
      classAvg: 11.5,
      min: 8.3,
      max: 17.4,
    },
    grades: [
      {
        id: "fran-1",
        title: "Lecture cursive",
        date: 1705363200000, // 16/01
        score: 11.8,
        outOf: 20,
        min: 7.5,
        max: 18.0,
        avg: 12.2,
        coef: 1,
        subjectId: "fran",
      },
      {
        id: "fran-2",
        title: "Test de lecture",
        date: 1705536000000, // 18/01
        score: 9.0,
        outOf: 20,
        min: 6.0,
        max: 16.0,
        avg: 10.5,
        coef: 1,
        subjectId: "fran",
      },
    ]
  },
  {
    id: "phy",
    name: "Physique-Chimie",
    icon: "🧪",
    color: "#00BCD4",
    average: {
      student: 13.9,
      classAvg: 13.2,
      min: 9.5,
      max: 18.7,
    },
    grades: [
      {
        id: "phy-1",
        title: "Lecture cursive",
        date: 1705363200000, // 16/01
        score: 11.8,
        outOf: 20,
        min: 9.0,
        max: 17.0,
        avg: 12.3,
        coef: 1,
        subjectId: "phy",
      },
      {
        id: "phy-2",
        title: "TP électricité",
        date: 1705795200000, // 20/01
        score: 16.0,
        outOf: 20,
        min: 10.0,
        max: 19.0,
        avg: 14.5,
        coef: 1,
        subjectId: "phy",
      },
      {
        id: "phy-3",
        title: "TP électricité 2",
        date: 1705795200000, // 20/01
        score: 19.0,
        outOf: 20,
        min: 10.0,
        max: 19.0,
        avg: 14.5,
        coef: 1,
        subjectId: "phy",
      },
    ]
  },
  {
    id: "math",
    name: "Mathématiques",
    icon: "📐",
    color: "#FF9800",
    average: {
      student: 14.3,
      classAvg: 13.0,
      min: 6.0,
      max: 19.5,
    },
    grades: [
      {
        id: "math-1",
        title: "Contrôle sur les fonctions",
        date: 1705017600000, // 10/01
        score: 15.5,
        outOf: 20,
        min: 10.0,
        max: 19.5,
        avg: 13.6,
        coef: 1,
        subjectId: "math",
      },
      {
        id: "math-2",
        title: "Devoir maison",
        date: 1705536000000, // 17/01
        score: 13.1,
        outOf: 20,
        min: 6.0,
        max: 18.0,
        avg: 12.5,
        coef: 1,
        subjectId: "math",
      },
    ]
  },
  {
    id: "hist",
    name: "Histoire-Géographie",
    icon: "🌍",
    color: "#795548",
    average: {
      student: 11.5,
      classAvg: 12.2,
      min: 7.4,
      max: 17.3,
    },
    grades: [
      {
        id: "hist-1",
        title: "DS Seconde Guerre mondiale",
        date: 1705104000000, // 12/01
        score: 10.5,
        outOf: 20,
        min: 6.0,
        max: 18.0,
        avg: 12.0,
        coef: 2,
        subjectId: "hist",
      },
    ]
  },
  {
    id: "eng",
    name: "Anglais",
    icon: "🇬🇧",
    color: "#3F51B5",
    average: {
      student: 10.15,
      classAvg: 14.2,
      min: 10.5,
      max: 19.2,
    },
    grades: [
      {
        id: "eng-1",
        title: "Compréhension orale",
        date: 1705027200000, // 11/01
        score: 4.5,
        outOf: 10,
        min: 10.0,
        max: 18.5,
        avg: 13.8,
        subjectId: "eng",
      },
      {
        id: "eng-2",
        title: "Expression écrite",
        date: 1705881600000, // 21/01
        score: 11.3,
        outOf: 20,
        min: 12.0,
        max: 19.2,
        avg: 14.6,
        subjectId: "eng",
      },
    ]
  },
];

export default function TabOneScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const headerHeight = useHeaderHeight();
  const windowDimensions = useWindowDimensions();

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const [sorting, setSorting] = useState("alphabetical");
  const [currentAlgorithm, setCurrentAlgorithm] = useState("subject");

  const average = useMemo(() => {
    const algorithm = avgAlgorithms.find(a => a.value === currentAlgorithm);
    const grades = subjects.flatMap(subject => subject.grades);
    if (algorithm) {
      return algorithm.algorithm(grades);
    }
    return 0; // Default average if no algorithm is found
  }, [currentAlgorithm, subjects]);

  // Transform subjects into a list with headers and grades
  const transformedData = useMemo(() => {
    const sortedSubjects = [...subjects].sort((a, b) => {
      if (sorting === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else if (sorting === "averages") {
        return b.average.student - a.average.student;
      } else if (sorting === "date") {
        const aMostRecentDate = Math.max(...a.grades.map(g => g.date));
        const bMostRecentDate = Math.max(...b.grades.map(g => g.date));
        return bMostRecentDate - aMostRecentDate;
      }
      return 0;
    });

    return sortedSubjects.flatMap((subject) => {
      const grades = subject.grades
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => b.date - a.date);

      return [
        { type: "header", subject, ui: { isHeader: true, key: "su:" + subject.id } },
        ...grades.map((grade, index) => ({
          type: "grade",
          grade,
          ui: {
            isFirst: index === 0,
            isLast: index === grades.length - 1,
            key: `g:${grade.id}`,
          },
        })),
      ];
    });
  }, [sorting]);


  // Optimized renderItem function with useCallback
  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.type === "header") {
      const { subject } = item;
      return (
        <Subject
          color={subject.color}
          emoji={subject.icon}
          name={subject.name}
          average={subject.average.student}
          outOf={20} // Assuming outOf is always 20 for simplicity
        />
      );
    }

    if (item.type === "grade") {
      const { grade } = item;
      return (
        <Grade
          isLast={item.ui.isLast}
          isFirst={item.ui.isFirst}
          title={grade.title}
          date={grade.date}
          score={grade.score}
          outOf={grade.outOf}
          color={subjects.find(s => s.id === grade.subjectId)?.color || colors.primary}
        />
      );
    }

    return null;
  }, []);

  function getAverageHistory(grades: { date: number; score: number; outOf: number; }[]) {
    // Sort grades by date in ascending order
    const sortedGrades = [...grades].sort((a, b) => a.date - b.date);

    // Initialize an array to store the average history
    const averageHistory: { date: number; average: number; }[] = [];

    // Iterate through the sorted grades and calculate the average progressively
    sortedGrades.forEach((currentGrade, index) => {
      const gradesUpToCurrent = sortedGrades.slice(0, index + 1);
      const currentAverage = PapillonSubjectAvg(gradesUpToCurrent);

      averageHistory.push({
        date: new Date(currentGrade.date).getTime(),
        average: currentAverage,
      });
    });

    return averageHistory;
  }

  const currentAverageHistory = useMemo(() => {
    const grades = subjects.flatMap(subject => subject.grades);
    return getAverageHistory(grades);
  }, [subjects]);

  const graphAxis = useMemo(() => {
    return {
      xAxis: currentAverageHistory.map(item => new Date(item.date)),
      yAxis: currentAverageHistory.map(item => item.average),
    };
  }, [currentAverageHistory]);

  const graphRef = useRef<ReanimatedGraphPublicMethods>(null);

  const GradesGraph = useCallback(() => {
    return (
      <ReanimatedGraph
        ref={graphRef}
        xAxis={graphAxis.xAxis}
        yAxis={graphAxis.yAxis}
        color="#29947A"
        showXAxisLegend={false}
        showYAxisLegend={false}
        showExtremeValues={false}
        widthRatio={0.95}
        height={100}
        showBlinkingDot={true}
        selectionLines={"none"}
        animationDuration={400}
        showSelectionDot={true}
        gestureEnabled={true}
        showGrid={true}
        showSelectionLines={true}
        showSelectionLinesOnScroll={true}
        containerStyle={{
          marginLeft: -32,
        }}
      />
    );
  }, [graphAxis]);

  return (
    <>
      <TabFlatList
        radius={34}
        waitForInitialLayout
        backgroundColor={theme.dark ? "#071d18ff" : "#ddeeea"}
        foregroundColor="#29947A"
        pattern="checks"
        initialNumToRender={2}
        recycleItems={true}
        estimatedItemSize={80}
        onFullyScrolled={handleFullyScrolled}
        height={184}
        data={transformedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.ui.key}
        header={(
          <View style={{ paddingHorizontal: 20, paddingVertical: 18, paddingTop: headerHeight - 36, flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "flex-start" }}>
            <GradesGraph />

            <Stack direction="horizontal" gap={0} inline vAlign="start" hAlign="end" style={{ width: "100%", marginBottom: -2 }}>
              <Typography variant="h1" color="primary">
                {average.toFixed(2)}
              </Typography>
              <Typography variant="body1" color="secondary" style={{ marginBottom: 2 }}>
                /20
              </Typography>
            </Stack>
            <Typography variant="title" color="primary" align="left">
              {avgAlgorithms.find(a => a.value === currentAlgorithm)?.label || "Aucune moyenne"}
            </Typography>
            <Typography variant="body1" color="secondary" align="left" inline style={{ marginTop: 3 }}>
              {avgAlgorithms.find(a => a.value === currentAlgorithm)?.subtitle || "Aucune moyenne"}
            </Typography>
          </View>
        )}
      />

      {!runsIOS26() && fullyScrolled && (
        <Reanimated.View
          entering={Animation(FadeInUp, "list")}
          exiting={Animation(FadeOutUp, "default")}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight + 1,
              backgroundColor: colors.card,
              zIndex: 1000000,
            },
            Platform.OS === 'android' && {
              elevation: 4,
            },
            Platform.OS === 'ios' && {
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }
          ]}
        />
      )}

      <NativeHeaderTitle>
        <Typography variant="navigation">
          Notes
        </Typography>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Left" key={"left-side-grades:" + sorting + ":" + currentAlgorithm}>
        <MenuView
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;
            if (actionId.startsWith("sort:")) {
              const selectedSorting = actionId.replace("sort:", "");
              setSorting(selectedSorting);
            } else if (actionId.startsWith("algorithm:")) {
              const selectedAlgorithm = actionId.replace("algorithm:", "");
              setCurrentAlgorithm(selectedAlgorithm);
            }
          }}
          actions={[
            {
              id: 'sorting',
              title: 'Tri par',
              image: Platform.select({
                ios: 'line.3.horizontal.decrease',
                android: 'ic_sort',
              }),
              imageColor: colors.text,
              subactions: sortings.map((s) => ({
                id: "sort:" + s.value,
                title: s.label,
                state: sorting === s.value ? "on" : "off",
                image: Platform.select({
                  ios: s.icon.ios,
                  android: s.icon.android,
                }),
                imageColor: colors.text,

              })),
            },
            {
              id: 'algorithm',
              title: 'Moyenne par',
              image: Platform.select({
                ios: 'chart.pie',
                android: 'ic_algorithm',
              }),
              imageColor: colors.text,
              subactions: avgAlgorithms.map((a) => ({
                id: "algorithm:" + a.value,
                title: a.label,
                subtitle: a.subtitle,
                state: currentAlgorithm === a.value ? "on" : "off",
              })),
            },
          ]}
        >
          <NativeHeaderPressable onPress={() => { }}>
            <Icon>
              <Filter />
            </Icon>
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable>
          <Icon>
            <Search />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}