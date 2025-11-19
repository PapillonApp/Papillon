import { LegendList } from "@legendapp/list";
import { MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, useWindowDimensions, View } from "react-native";
import Reanimated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { Dynamic } from "@/ui/components/Dynamic";
import Grade from "@/ui/components/Grade";
import Icon from "@/ui/components/Icon";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
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

import { Papicons } from '@getpapillon/papicons';
import { Grade as SharedGrade, Period, Subject as SharedSubject } from "@/services/shared/grade";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { CompactGrade } from "@/ui/components/CompactGrade";
import { useNavigation } from "expo-router";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import GradesWidget from "../index/widgets/Grades";
import { useAccountStore } from "@/stores/account";
import { getPeriodName, getPeriodNumber } from "@/utils/services/periods";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

const EmptyListComponent = memo(() => (
  <Dynamic animated key={'empty-list:warn'}>
    <Stack
      hAlign="center"
      vAlign="center"
      flex
      style={{ width: "100%" }}
    >
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={"Grades"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {t('Grades_Empty_Title')}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {t('Grades_Empty_Description')}
      </Typography>
    </Stack>
  </Dynamic>
));

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
      algorithm: (grades: SharedGrade[]) => PapillonSubjectAvg(grades)
    },
    {
      label: t("Grades_Avg_Subject_Title"),
      short: t("Grades_Avg_Subject_Short"),
      subtitle: t("Grades_Method_Weighted"),
      value: "weighted",
      algorithm: (grades: SharedGrade[]) => PapillonWeightedAvg(grades)
    },
    {
      label: t("Grades_Avg_Median_Title"),
      short: t("Grades_Avg_Median_Short"),
      subtitle: t("Grades_Method_AllGrades"),
      value: "median",
      algorithm: (grades: SharedGrade[]) => PapillonMedian(grades)
    },
  ]

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const [sorting, setSorting] = useState("alphabetical");
  const [currentAlgorithm, setCurrentAlgorithm] = useState("subject");

  const [periods, setPeriods] = useState<Period[]>([]);
  const [newSubjects, setSubjects] = useState<Array<SharedSubject>>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [serviceAverage, setServiceAverage] = useState<number | null>(null);

  const manager = getManager();

  const fetchPeriods = async (managerToUse = manager) => {
    if (currentPeriod) {
      return;
    }

    if (!managerToUse) {
      return;
    }

    const result = await managerToUse.getGradesPeriods()
    setPeriods(result);

    const currentPeriodFound = getCurrentPeriod(result)
    setCurrentPeriod(currentPeriodFound)
  };

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchPeriods(updatedManager);
    });

    return () => unsubscribe();
  }, []);

  const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
    if (period && managerToUse) {
      const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);
      setSubjects(grades.subjects);
      if (grades.studentOverall.value) {
        setServiceAverage(grades.studentOverall.value)
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 200);
      });
    }
  };

  // Fetch grades when current period changes
  useEffect(() => {
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const average = useMemo(() => {
    const algorithm = avgAlgorithms.find(a => a.value === currentAlgorithm);
    if (serviceAverage !== null && algorithm?.value === "subject") {
      return serviceAverage;
    }
    const grades = newSubjects.flatMap(subject => subject.grades).filter(grade => grade.studentScore?.value !== undefined);
    if (algorithm && grades.length > 0) {
      const result = algorithm.algorithm(grades);
      return isNaN(result) ? 0 : result;
    }
    return 0;
  }, [currentAlgorithm, newSubjects, serviceAverage]);

  const [shownAverage, setShownAverage] = useState(average);
  const [selectionDate, setSelectionDate] = useState<number | null>(null);

  // Update shownAverage when algorithm changes only if is not set
  React.useEffect(() => {
    if (!shownAverage) {
      setShownAverage(average);
    }
  }, [average]);
  const accounts = useAccountStore((state) => state.accounts);

  const subjectData = useMemo(() => {
    const subjectMap = new Map();
    newSubjects.forEach(subject => {
      const cleanedName = subject.name.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
      if (!subjectMap.has(cleanedName)) {
        subjectMap.set(cleanedName, {
          color: getSubjectColor(subject.name),
          emoji: getSubjectEmoji(subject.name),
          name: getSubjectName(subject.name),
          originalName: subject.name
        });
      }
    });
    return subjectMap;
  }, [accounts]);


  const getSubjectInfo = useCallback((subjectName: string) => {
    const cleanedName = subjectName.toLocaleLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
    return subjectData.get(cleanedName) || {
      color: getSubjectColor(subjectName),
      emoji: getSubjectEmoji(subjectName),
      name: getSubjectName(subjectName),
      originalName: subjectName
    };
  }, [accounts]);

  // Transform subjects into a list with headers and grades
  const transformedData = useMemo(() => {
    const sortedSubjects = [...newSubjects].sort((a, b) => {
      if (sorting === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else if (sorting === "averages") {
        const aAvg = a.studentAverage?.value ?? 0;
        const bAvg = b.studentAverage?.value ?? 0;
        return bAvg - aAvg;
      } else if (sorting === "date") {
        const aGrades = a.grades.filter(g => g.givenAt);
        const bGrades = b.grades.filter(g => g.givenAt);
        const aMostRecentDate = aGrades.length > 0 ? Math.max(...aGrades.map(g => g.givenAt.getTime())) : 0;
        const bMostRecentDate = bGrades.length > 0 ? Math.max(...bGrades.map(g => g.givenAt.getTime())) : 0;
        return bMostRecentDate - aMostRecentDate;
      }
      return 0;
    });

    const result = sortedSubjects.flatMap((subject) => {
      const grades = subject.grades
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime());

      return [
        { type: "header", subject, ui: { isHeader: true, key: "su:" + subject.id + "(" + currentPeriod?.name + ")" } },
        ...grades.map((grade, index) => ({
          type: "grade",
          grade,
          ui: {
            isFirst: index === 0,
            isLast: index === grades.length - 1,
            key: `g:${grade.id}(${currentPeriod?.name})`,
          },
        })),
      ];
    });

    return result;
  }, [newSubjects, sorting, currentPeriod]);

  const renderItemGrade = useCallback(({ item, uiFirst, uiLast }: { item: SharedGrade; index: number, uiFirst: boolean, uiLast: boolean }) => {
    const subject = newSubjects.find(s => s.id === item.subjectId);
    const subjectInfo = getSubjectInfo(subject?.name ?? "");
    return (
      <Grade
        isLast={uiLast}
        isFirst={uiFirst}
        title={item.description ? item.description : t('Grade_NoDescription', { subject: subjectInfo.name })}
        date={item.givenAt.getTime()}
        score={(item.studentScore?.value ?? 0)}
        disabled={item.studentScore?.disabled}
        status={item.studentScore?.status}
        outOf={item.outOf?.value ?? 20}
        color={subjectInfo.color}
        onPress={() => {
          navigation.navigate('(modals)/grade', {
            grade: item,
            subjectInfo: subjectInfo,
            allGrades: newSubjects.flatMap(subject => subject.grades)
          });
        }}
      />
    );
  }, [newSubjects, getSubjectInfo]);

  const renderItemSubject = useCallback(({ item }: { item: SharedSubject; index: number }) => {
    const subjectInfo = getSubjectInfo(item.name);
    return (
      <Subject
        color={subjectInfo.color}
        emoji={subjectInfo.emoji}
        name={subjectInfo.name}
        average={item.studentAverage?.value ?? 0}
        disabled={item.studentAverage.disabled}
        status={item.studentAverage.status}
        outOf={item.outOf?.value ?? 20}
      />
    );
  }, [getSubjectInfo]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.type === "header") {
      return renderItemSubject({ item: item.subject, index });
    } else if (item.type === "grade") {
      return renderItemGrade({
        item: item.grade,
        index,
        uiFirst: item.ui.isFirst,
        uiLast: item.ui.isLast
      });
    }
    return null;
  }, [renderItemSubject, renderItemGrade]);

  const navigation = useNavigation();

  const recentGrades = useMemo(() => {
    return newSubjects.flatMap(subject => subject.grades).sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime()).slice(0, 6);
  }, [newSubjects]);

  const LatestGradeItem = useCallback(({ item }: { item: SharedGrade }) => {
    const subject = newSubjects.find(s => s.id === item.subjectId);
    const subjectInfo = getSubjectInfo(subject?.name ?? "");

    return (
      <Reanimated.View
        sharedTransitionTag={item.id + "_compactGrade"}
      >
        <CompactGrade
          key={item.id + "_compactGrade"}
          emoji={subjectInfo.emoji}
          title={subjectInfo.name}
          description={item.description}
          score={item.studentScore?.value ?? 0}
          outOf={item.outOf?.value ?? 20}
          disabled={item.studentScore?.disabled}
          color={subjectInfo.color}
          status={item.studentScore?.status}
          date={item.givenAt}
          onPress={() => {
            navigation.navigate('(modals)/grade', {
              grade: item,
              subjectInfo: subjectInfo,
              allGrades: newSubjects.flatMap(subject => subject.grades)
            });
          }}
        />
      </Reanimated.View>
    )
  }, [colors, newSubjects, getSubjectInfo]);

  const LatestGrades = useCallback(() => (
    <Reanimated.View
      key={"latest-grades:" + currentPeriod}
    >
      <Stack direction="horizontal" gap={10} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
      }}>
        <Icon>
          <Papicons name={"Star"} size={18} />
        </Icon>
        <Typography>
          {t("Latest_Grades")}
        </Typography>
      </Stack>
      <FlatList
        horizontal
        keyExtractor={(item: SharedGrade) => item.id}
        data={recentGrades}
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
          <Papicons name={"Grades"} size={18} />
        </Icon>
        <Typography>
          Mes notes
        </Typography>
      </Stack>
    </Reanimated.View>
  ), [newSubjects, colors]);

  const insets = useSafeAreaInsets();

  return (
    <>
      <TabFlatList
        radius={36}
        engine="FlatList"
        backgroundColor={theme.dark ? "#071d18ff" : "#ddeeea"}
        foregroundColor="#29947A"
        pattern={"cross"}
        initialNumToRender={2}
        removeClippedSubviews={true}
        onFullyScrolled={handleFullyScrolled}
        height={200}
        data={transformedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.ui.key}
        ListEmptyComponent={<EmptyListComponent />}
        header={(
          <GradesWidget
            accent="#29947A"
            algorithm={currentAlgorithm}
            period={currentPeriod}
          />
        )}
        ListHeaderComponent={transformedData.length > 0 ? <LatestGrades /> : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={200}
          />
        }
      />

      {!runsIOS26 && fullyScrolled && (
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

      <NativeHeaderTitle key={"grades-title:" + shownAverage.toFixed(2) + ":" + fullyScrolled + ":" + currentPeriod?.id}>
        <MenuView
          onPressAction={({ nativeEvent }) => {
            const actionId = nativeEvent.event;

            if (actionId.startsWith("period:")) {
              const selectedPeriodId = actionId.replace("period:", "");
              setCurrentPeriod(periods.find(period => period.id === selectedPeriodId));
            }
          }}
          actions={
            periods.map((period) => ({
              id: "period:" + period.id,
              title: period.name,
              subtitle: `${period.start.toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })} - ${period.end.toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}`,
              state: currentPeriod?.id === period.id ? "on" : "off",
              image: Platform.select({
                ios: (getPeriodNumber(period.name || "0")) + ".calendar"
              }),
              imageColor: colors.text,
            }))
          }
        >
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column",
              alignItems: Platform.OS === 'android' ? "left" : "center",
              justifyContent: "center",
              gap: 4,
              width: 200,
              height: 60,
              marginTop: runsIOS26 ? fullyScrolled ? 6 : 0 : Platform.OS === 'ios' ? -4 : -2,
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: (!runsIOS26 && fullyScrolled) ? 0 : 4, height: 30, marginBottom: -3 }}>
              <Dynamic animated>
                <Typography inline variant="navigation" numberOfLines={1}>{getPeriodName(currentPeriod?.name || t("Tab_Grades"))}</Typography>
              </Dynamic>
              {currentPeriod?.name &&
                <Dynamic animated style={{ marginTop: -3 }}>
                  <NativeHeaderHighlight color="#29947A" light={!runsIOS26 && fullyScrolled}>
                    {getPeriodNumber(currentPeriod?.name || t("Grades_Menu_CurrentPeriod"))}
                  </NativeHeaderHighlight>
                </Dynamic>
              }
              {periods.length > 0 && (
                <Dynamic animated>
                  <Papicons style={{ marginTop: -2 }} name={"ChevronDown"} color={colors.text} size={22} opacity={0.5} />
                </Dynamic>
              )}
            </Dynamic>
            {fullyScrolled && (
              <Dynamic animated>
                <Typography inline variant={"body2"} style={{ color: "#29947A" }} align="center">
                  {avgAlgorithms.find(a => a.value === currentAlgorithm)?.short || "Aucune moyenne"} : {(shownAverage ?? 0).toFixed(2)}/20
                </Typography>
              </Dynamic>
            )}
          </Dynamic>
        </MenuView>
      </NativeHeaderTitle >

      <NativeHeaderSide side="Left" key={"left-side-grades:" + sorting}>
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
          actions={
            sortings.map((s) => ({
              id: "sort:" + s.value,
              title: s.label,
              state: sorting === s.value ? "on" : "off",
              image: Platform.select({
                ios: s.icon.ios,
                android: s.icon.android,
              }),
              imageColor: colors.text,
            }))
          }
        >
          <NativeHeaderPressable onPress={() => { }}>
            <Icon size={28}>
              <Papicons name={"Filter"} color={"#29947A"} />
            </Icon>
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>

      <NativeHeaderSide side="Right" key={"right-side-grades:" + currentAlgorithm}>
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
          actions={avgAlgorithms.map((a) => ({
            id: "algorithm:" + a.value,
            title: a.label,
            subtitle: a.subtitle,
            state: currentAlgorithm === a.value ? "on" : "off",
          }))}
        >
          <NativeHeaderPressable onPress={() => { }}>
            <Icon size={28}>
              <Papicons name={"Pie"} color={"#29947A"} />
            </Icon>
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide >
    </>
  );
}