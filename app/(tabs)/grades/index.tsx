import { LegendList } from "@legendapp/list";
import {MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import { ChartAreaIcon, Filter, NotebookTabs, StarIcon } from "lucide-react-native";
import React, { useCallback,useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, useWindowDimensions, View } from "react-native";
import { LineGraph } from 'react-native-graph';
import Reanimated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { Dynamic } from "@/ui/components/Dynamic";
import Grade from "@/ui/components/Grade";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Subject from "@/ui/components/Subject";
import TabFlatList from "@/ui/components/TabFlatList";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import PapillonMedian from "@/utils/grades/algorithms/median";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";

const transformPeriodName = (name: string) => {
  // return only digits
  let newName = name.replace(/[^0-9]/g, '').trim();

  if (newName.length === 0) {
    newName = name[0].toUpperCase();
  }

  return newName.toString()[0];
}

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

const periodsData = [
  {
    id: "period-1",
    name: "Semestre 1",
    startDate: new Date(2023, 8, 1).getTime(), // 1er septembre 2023
    endDate: new Date(2023, 11, 31).getTime(), // 31 décembre 2023
  },
  {
    id: "period-2",
    name: "Semestre 2",
    startDate: new Date(2024, 0, 1).getTime(), // 1er janvier 2024
    endDate: new Date(2024, 2, 31).getTime(), // 31 mars 2024
  },
  {
    id: "period-hors",
    name: "Hors période",
    startDate: new Date(2023, 8, 1).getTime(), // 1er septembre 2023
    endDate: new Date(2024, 2, 31).getTime(), // 31 mars 2024
  },
];

export default function TabOneScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const headerHeight = useHeaderHeight();
  const windowDimensions = useWindowDimensions();

  const [fullyScrolled, setFullyScrolled] = useState(false);
  const sortings = [
    {
      label: t("Grades_Sorting_Alphabetical"),
      value: "alphabetical",
      icon: {
        ios: "character",
        android: "ic_alphabetical",
      }
    },
    {
      label: t("Grades_Sorting_Averages"),
      value: "averages",
      icon: {
        ios: "chart.xyaxis.line",
        android: "ic_averages",
      }
    },
    {
      label: t("Grades_Sorting_Date"),
      value: "date",
      icon: {
        ios: "calendar",
        android: "ic_date",
      }
    },
  ];

  const avgAlgorithms = [
    {
      label: t("Grades_Avg_All_Title"),
      short: t("Grades_Avg_All_Short"),
      subtitle: t("Grades_Method_AllGrades"),
      value: "subject",
      algorithm: (grades) => PapillonSubjectAvg(grades)
    },
    {
      label: t("Grades_Avg_Subject_Title"),
      short: t("Grades_Avg_Subject_Short"),
      subtitle: t("Grades_Method_Weighted"),
      value: "weighted",
      algorithm: (grades) => PapillonWeightedAvg(grades)
    },
    {
      label: t("Grades_Avg_Median_Title"),
      short: t("Grades_Avg_Median_Short"),
      subtitle: t("Grades_Method_AllGrades"),
      value: "median",
      algorithm: (grades) => PapillonMedian(grades)
    },
  ]

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const [sorting, setSorting] = useState("alphabetical");
  const [currentAlgorithm, setCurrentAlgorithm] = useState("subject");

  const periods = useMemo(() => periodsData, []);
  const [currentPeriod, setCurrentPeriod] = useState(periods[0].id);

  const average = useMemo(() => {
    const algorithm = avgAlgorithms.find(a => a.value === currentAlgorithm);
    const grades = subjects.flatMap(subject => subject.grades);
    if (algorithm) {
      return algorithm.algorithm(grades);
    }
    return 0; // Default average if no algorithm is found
  }, [currentAlgorithm, subjects]);

  const [shownAverage, setShownAverage] = useState(average);
  const [selectionDate, setSelectionDate] = useState<number | null>(null);

  // Update shownAverage when algorithm changes
  React.useEffect(() => {
    setShownAverage(average);
  }, [average]);

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

  const getAverageHistory = useCallback((grades: any[]) => {
    // Sort grades by date in ascending order
    const sortedGrades = [...grades].sort((a, b) => a.date - b.date);

    // Initialize an array to store the average history
    const averageHistory: { date: number; average: number; }[] = [];

    // Iterate through the sorted grades and calculate the average progressively
    sortedGrades.forEach((currentGrade, index) => {
      const gradesUpToCurrent = sortedGrades.slice(0, index + 1);

      // use currentAlgorithm to determine the average calculation method
      const currentAverage = avgAlgorithms.find(a => a.value === currentAlgorithm)?.algorithm(gradesUpToCurrent) || 0;

      averageHistory.push({
        date: new Date(currentGrade.date).getTime(),
        average: currentAverage,
      });
    });

    return averageHistory;
  }, [currentAlgorithm]);

  const currentAverageHistory = useMemo(() => {
    const grades = subjects.flatMap(subject => subject.grades);
    return getAverageHistory(grades);
  }, [subjects, currentAlgorithm]);

  const graphAxis = useMemo(() => {
    const newGraph = currentAverageHistory.map(item => ({
      value: item.average,
      date: new Date(item.date)
    }));

    return newGraph;
  }, [currentAverageHistory]);

  const graphRef = useRef<ReanimatedGraphPublicMethods>(null);

  const handleGestureUpdate = useCallback((p) => {
    setShownAverage(p.value);
    setSelectionDate(p.date.getTime());
  }, [currentAverageHistory]);

  const handleGestureEnd = useCallback(() => {
    setShownAverage(average);
    setSelectionDate(null);
  }, [average]);

  const GradesGraph = useCallback(() => (
    <Reanimated.View
      key={"grades-graph-container:" + graphAxis.length + ":" + currentAlgorithm}
      style={{
        width: windowDimensions.width + 36 - 8,
        height: 120,
        position: 'absolute',
        top: -20,
        left: -36,
        right: 0,
        zIndex: 1000,
      }}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
    >
      <React.Suspense fallback={
        <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#29947A" />
        </View>
      }>
        <LineGraph
          points={graphAxis}
          animated={true}
          color="#29947A"
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
      </React.Suspense>
    </Reanimated.View>
  ), [graphAxis, handleGestureUpdate, handleGestureEnd, windowDimensions.width]);

  const LatestGradeItem = useCallback(({ item }) => (
    <View key={item.id}
      style={{
        width: 220,
        height: 150,
        borderRadius: 24,
        borderCurve: "continuous",
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        backgroundColor: (subjects.find(s => s.id === item.subjectId)?.color || colors.primary) + "33",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text>
          {item.subjectId ? subjects.find(s => s.id === item.subjectId)?.icon : "❓"}
        </Text>
        <Typography variant="body1" color={(subjects.find(s => s.id === item.subjectId)?.color || colors.primary)} style={{ flex: 1 }} numberOfLines={1} weight="semibold">
          {item.subjectId ? subjects.find(s => s.id === item.subjectId)?.name : t("Grades_Unknown_Subject")}
        </Typography>
        <Typography variant="body1" color={(subjects.find(s => s.id === item.subjectId)?.color || colors.primary)} numberOfLines={1}>
          {new Date(item.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </Typography>
      </View>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "column",
          gap: 4,
          backgroundColor: colors.card,
          borderRadius: 24,
          borderCurve: "continuous",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="title" color="text" style={{ lineHeight: 20 }} numberOfLines={2}>
          {item.title}
        </Typography>
        <View style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          gap: 4,
          borderRadius: 120,
          paddingHorizontal: 7,
          paddingVertical: 3,
          backgroundColor: (subjects.find(s => s.id === item.subjectId)?.color || colors.primary) + "33",
        }}>
          <Typography variant="h4" color={(subjects.find(s => s.id === item.subjectId)?.color || colors.primary)}>
            {item.score.toFixed(2)}
          </Typography>
          <Typography variant="body1" inline color={(subjects.find(s => s.id === item.subjectId)?.color || colors.primary)} style={{ marginBottom: 2 }}>
            / {item.outOf}
          </Typography>
        </View>
      </View>
    </View>
  ), [colors, subjects]);

  const LatestGrades = useCallback(() => (
    <>
      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <StarIcon size={18} />
        </Icon>
        <Typography>
          Nouvelles notes
        </Typography>
      </Stack>
      <LegendList
        horizontal
        keyExtractor={(item) => item.id}
        data={subjects.flatMap(subject => subject.grades).sort((a, b) => b.date - a.date)}
        renderItem={({ item }) => (
          <LatestGradeItem item={item} />
        )}
        style={{
          height: 150,
          marginBottom: 16,
          overflow: "visible",
        }}
        contentContainerStyle={{
          display: "flex",
          flexDirection: "row",
          overflow: "visible",
          gap: 10,
        }}
        showsHorizontalScrollIndicator={false}
      />
      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <ChartAreaIcon size={18} />
        </Icon>
        <Typography>
          Mes notes
        </Typography>
      </Stack>
    </>
  ), [subjects, colors]);

  return (
    <>
      <TabFlatList
        radius={36}
        waitForInitialLayout
        backgroundColor={theme.dark ? "#071d18ff" : "#ddeeea"}
        foregroundColor="#29947A"
        pattern="checks"
        initialNumToRender={2}
        recycleItems={true}
        estimatedItemSize={80}
        onFullyScrolled={handleFullyScrolled}
        height={170}
        data={transformedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.ui.key}
        header={(
          <View style={{ paddingHorizontal: 20, paddingVertical: 18, flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "flex-start" }}>
            <GradesGraph />

            <Stack direction="horizontal" gap={0} inline vAlign="start" hAlign="end" style={{ width: "100%", marginBottom: -2 }}>
              <Dynamic animated key={"shownAverage:" + shownAverage.toFixed(2)}>
                <Typography variant="h1" color="primary">
                  {shownAverage.toFixed(2)}
                </Typography>
              </Dynamic>
              <Dynamic animated>
                <Typography variant="body1" color="secondary" style={{ marginBottom: 2 }}>
                  /20
                </Typography>
              </Dynamic>
            </Stack>
            <Typography variant="title" color="primary" align="left">
              {avgAlgorithms.find(a => a.value === currentAlgorithm)?.label || "Aucune moyenne"}
            </Typography>
            <Dynamic animated key={"selectionDate:" + selectionDate + ":" + currentAlgorithm} style={{ transformOrigin: "top left" }}>
              <Typography variant="body1" color="secondary" align="left" inline style={{ marginTop: 3 }}>
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
        )}
        ListHeaderComponent={<LatestGrades />}
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

      <NativeHeaderTitle key={"grades-title:" + shownAverage.toFixed(2) + ":" + fullyScrolled}>
        <Dynamic
          animated={true}
          style={{
            flexDirection: "column",
            alignItems: Platform.OS === 'android' ? "left" : "center",
            justifyContent: "center",
            gap: 4,
            width: 200,
            height: 60,
            marginTop: runsIOS26() ? fullyScrolled ? 6 : 0 : Platform.OS === 'ios' ? -4 : -2,
          }}
        >
          <Dynamic animated>
            <Typography variant="navigation">
              {t("Tab_Grades")}
            </Typography>
          </Dynamic>
          {fullyScrolled && (
            <Dynamic animated>
              <Typography inline variant={"body2"} style={{ color: "#29947A" }} align="center">
                {avgAlgorithms.find(a => a.value === currentAlgorithm)?.short || "Aucune moyenne"} : {shownAverage.toFixed(2)}/20
              </Typography>
            </Dynamic>
          )}
        </Dynamic>
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
              title: t("Grades_Menu_SortBy"),
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
              title: t("Grades_Menu_AverageBy"),
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

      <NativeHeaderSide side="Right" key={"right -side-period:" + currentPeriod}>
        <MenuView
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;
            if (actionId.startsWith("period:")) {
              const selectedPeriodId = actionId.replace("period:", "");
              setCurrentPeriod(selectedPeriodId);
            }
          }}
          actions={
            periods.map((period) => ({
              id: "period:" + period.id,
              title: period.name,
              subtitle: `${new Date(period.startDate).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })} - ${new Date(period.endDate).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}`,
              state: currentPeriod === period.id ? "on" : "off",
            }))
          }
        >
          <NativeHeaderPressable onPress={() => { }}>
            <View
              style={{
                position: "absolute",
                right: 3,
                top: 3,
                backgroundColor: colors.primary,
                width: 16,
                height: 16,
                borderRadius: 60,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontFamily: "bold",
                }}
              >
                {transformPeriodName(periods.find(p => p.id === currentPeriod)?.name || t("Grades_Menu_CurrentPeriod"))}
              </Text>
            </View>
            <Icon>
              <NotebookTabs />
            </Icon>
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>
    </>
  );
}