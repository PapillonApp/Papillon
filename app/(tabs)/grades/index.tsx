import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View, FlatList, RefreshControl, Dimensions } from 'react-native';

import Reanimated, { createAnimatedComponent, LayoutAnimationConfig, LinearTransition, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import ChipButton from '@/ui/components/ChipButton';

import Search from '@/ui/components/Search';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import Typography from '@/ui/components/Typography';
import { useTheme } from '@react-navigation/native';

import { getManager, subscribeManagerUpdate } from '@/services/shared';
import { Grade as SharedGrade, Period, Subject as SharedSubject, Subject } from "@/services/shared/grade";
import PapillonMedian from "@/utils/grades/algorithms/median";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import PapillonWeightedAvg from "@/utils/grades/algorithms/weighted";

import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { MenuView } from '@react-native-menu/menu';
import i18n from '@/utils/i18n';
import Stack from '@/ui/components/Stack';
import { SubjectItem } from './atoms/Subject';
import { t } from 'i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import Icon from '@/ui/components/Icon';
import { Papicons } from '@getpapillon/papicons';
import { Dynamic } from '@/ui/components/Dynamic';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { CompactGrade } from '@/ui/components/CompactGrade';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { getPeriodName, getPeriodNumber, isPeriodWithNumber } from "@/utils/services/periods";
import { LegendList } from '@legendapp/list';
import { useNavigation } from 'expo-router';
import ActivityIndicator from '@/ui/components/ActivityIndicator';

const MemoizedSubjectItem = React.memo(SubjectItem);

const GradesView: React.FC = () => {
  // Layout du header
  const [headerHeight, setHeaderHeight] = useState(0);
  const bottomTabBarHeight = useBottomTabBarHeight();

  const ReanimatedLegendList = createAnimatedComponent(LegendList);

  // Thème
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Chargement
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const loading = periodsLoading || gradesLoading;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sortings
  const [sortMethod, setSortMethod] = useState<string>("date");
  const sortings = [
    {
      label: t("Grades_Sorting_Alphabetical"),
      value: "alphabetical",
      icon: {
        ios: "character",
        android: "ic_alphabetical",
        papicon: "font",
      }
    },
    {
      label: t("Grades_Sorting_Averages"),
      value: "averages",
      icon: {
        ios: "chart.xyaxis.line",
        android: "ic_averages",
        papicon: "grades",
      }
    },
    {
      label: t("Grades_Sorting_Date"),
      value: "date",
      icon: {
        ios: "calendar",
        android: "ic_date",
        papicon: "calendar",
      }
    },
  ];

  // Gestion du scroll
  const offsetY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  // Manager
  const manager = getManager();

  // Obtention des périodes
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>();

  const fetchPeriods = async (managerToUse = manager) => {
    if (currentPeriod || !managerToUse) return;
    setPeriodsLoading(true);

    const result = await managerToUse.getGradesPeriods();
    const currentPeriodFound = getCurrentPeriod(result);

    setPeriods(result);
    setCurrentPeriod(currentPeriodFound);
    setPeriodsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchPeriods(updatedManager);
    });

    return () => unsubscribe();
  }, []);

  // Obtention des notes
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [serviceAverage, setServiceAverage] = useState<number | null>(null);

  const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
    setGradesLoading(true);
    if (period && managerToUse) {
      const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);
      setSubjects(grades.subjects);
      if (grades.studentOverall.value) {
        setServiceAverage(grades.studentOverall.value)
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          setGradesLoading(false);
          setIsRefreshing(false);
        }, 200);
      });
    }
  };

  // Fetch grades when current period changes
  useEffect(() => {
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const grades = useMemo(() => {
    return subjects.flatMap((subject) => subject.grades);
  }, [subjects]);

  const getSubjectById = useCallback((id: string) => {
    return subjects.find((subject) => subject.id === id);
  }, [subjects]);

  // Sort
  // Sort grades in subjects by date descending then sort subjects by latest grade descending
  const sortedSubjects = useMemo(() => {
    const subjectsCopy = [...subjects];
    subjectsCopy.forEach((subject) => {
      subject.grades.sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime());
    });

    switch (sortMethod) {
      case "alphabetical":
        subjectsCopy.sort((a, b) => {
          const nameA = getSubjectName(a.name).toLowerCase();
          const nameB = getSubjectName(b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;

      case "averages":
        subjectsCopy.sort((a, b) => {
          const aAvg = a.studentAverage.value;
          const bAvg = b.studentAverage.value;
          return bAvg - aAvg;
        });
        break;

      default:
        subjectsCopy.sort((a, b) => {
          const aLatestGrade = a.grades[0];
          const bLatestGrade = b.grades[0];

          if (!aLatestGrade && !bLatestGrade) return 0;
          if (!aLatestGrade) return 1;
          if (!bLatestGrade) return -1;

          return bLatestGrade.givenAt.getTime() - aLatestGrade.givenAt.getTime();
        });
        break;
    }

    return subjectsCopy;
  }, [subjects, sortMethod]);

  const sortedGrades = useMemo(() => {
    const gradesCopy = [...grades];
    gradesCopy.sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime());
    return gradesCopy;
  }, [grades]);

  // Search
  const [searchText, setSearchText] = useState<string>("");
  const filteredSubjects = useMemo(() => {
    if (searchText.trim() === "") {
      return sortedSubjects;
    }

    const lowerSearchText = searchText.toLowerCase();

    return sortedSubjects.filter((subject) => {
      const subjectName = getSubjectName(subject.name).toLowerCase();
      if (subjectName.includes(lowerSearchText)) {
        return true;
      }

      // Also search in grades descriptions
      const matchingGrades = subject.grades.filter((grade) => {
        return grade.description?.toLowerCase().includes(lowerSearchText);
      });

      return matchingGrades.length > 0;
    });
  }, [searchText, sortedSubjects]);

  // Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const renderItem = useCallback(({ item: subject }: { item: Subject }) => {
    return (
      // @ts-expect-error navigation types
      <MemoizedSubjectItem subject={subject} grades={grades} />
    )
  }, [grades]);

  return (
    <View
      style={{
        flex: 1,
        /* @ts-expect-error colors
        backgroundColor: colors.overground */
      }}
    >
      {/* Header */}
      <TabHeader
        onHeightChanged={setHeaderHeight}
        /* Nom de la période */
        title={
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
                title: (getPeriodName(period.name || "") + " " + (isPeriodWithNumber(period.name || "") ? getPeriodNumber(period.name || "0") : "")).trim(),
                subtitle: `${period.start.toLocaleDateString(i18n.language, {
                  month: "short",
                  year: "numeric",
                })} - ${period.end.toLocaleDateString(i18n.language, {
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
            <TabHeaderTitle
              color='#2B7ED6'
              leading={periods.length > 0 ? getPeriodName(currentPeriod?.name || '') : t("Tab_Grades")}
              number={isPeriodWithNumber(currentPeriod?.name || '') ? getPeriodNumber(currentPeriod?.name || '') : undefined}
              loading={loading}
              chevron={periods.length > 1}
            />
          </MenuView>
        }
        /* Filtres */
        trailing={
          <MenuView
            onPressAction={({ nativeEvent }) => {
              const actionId = nativeEvent.event;
              if (actionId.startsWith("sort:")) {
                const selectedSorting = actionId.replace("sort:", "");
                setSortMethod(selectedSorting);
              }
            }}
            actions={
              sortings.map((s) => ({
                id: "sort:" + s.value,
                title: s.label,
                state: sortMethod === s.value ? "on" : "off",
                image: Platform.select({
                  ios: s.icon.ios,
                  android: s.icon.android,
                }),
                imageColor: colors.text,
              }))
            }
          >
            <View style={{ width: 200, alignItems: 'flex-end' }} >
              <ChipButton icon={sortings.find(s => s.value === sortMethod)?.icon.papicon || 'filter'} chevron onPress={() => { }}>
                {sortings.find(s => s.value === sortMethod)?.label || t("Grades_Sort")}
              </ChipButton>
            </View>
          </MenuView>
        }
        /* Recherche */
        bottom={<Search placeholder={t('Grades_Search_Placeholder')} color='#2B7ED6' onTextChange={(text) => setSearchText(text)} />}
        scrollHandlerOffset={offsetY}
      />


      <Reanimated.FlatList
        style={{ flex: 1, height: '100%' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: headerHeight, gap: 16, paddingBottom: bottomTabBarHeight }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: headerHeight - insets.top }}
        layout={LinearTransition.springify()}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={LinearTransition.springify()}
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}

        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
          />
        }

        ListHeaderComponent={(sortedGrades.length > 0 && searchText.length === 0) ?
          <View>
            <Dynamic animated key={'header:grades_label'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.4 }} padding={[0, 0]}>
                <Icon size={20}>
                  <Papicons name='star' />
                </Icon>
                <Typography variant='h6' color='text'>
                  {t('Grades_Tab_Latest')}
                </Typography>
              </Stack>
            </Dynamic>

            <Dynamic animated key={'header:grades'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <LegendList
                horizontal
                data={sortedGrades.slice(0, 10)}
                style={{ overflow: 'visible', height: 140 + 24 }}
                contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 0, gap: 12 }}
                showsHorizontalScrollIndicator={false}
                recycleItems={true}
                keyExtractor={(item) => item.id}
                renderItem={({ item: grade }) =>
                  <CompactGrade
                    key={grade.id + "_compactGrade_header"}
                    emoji={getSubjectEmoji(getSubjectById(grade.subjectId)?.name || "")}
                    title={getSubjectName(getSubjectById(grade.subjectId)?.name || "")}
                    description={grade.description}
                    score={grade.studentScore?.value || 0}
                    outOf={grade.outOf?.value || 20}
                    disabled={grade.studentScore?.disabled}
                    status={grade.studentScore?.status}
                    color={getSubjectColor(getSubjectById(grade.subjectId)?.name || "")}
                    date={grade.givenAt}
                    onPress={() => {
                      // @ts-expect-error navigation types
                      navigation.navigate('(modals)/grade', {
                        grade: grade,
                        subjectInfo: {
                          name: getSubjectName(getSubjectById(grade.subjectId)?.name || ""),
                          color: getSubjectColor(getSubjectById(grade.subjectId)?.name || ""),
                          emoji: getSubjectEmoji(getSubjectById(grade.subjectId)?.name || ""),
                          originalName: getSubjectById(grade.subjectId)?.name || ""
                        },
                        allGrades: grades
                      })
                    }}
                  />
                }
              />
            </Dynamic>

            <Dynamic animated key={'header:subjects_label'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.4 }} padding={[0, 0]}>
                <Icon size={20}>
                  <Papicons name='grades' />
                </Icon>
                <Typography variant='h6' color='text'>
                  {t('Grades_Tab_Subjects')}
                </Typography>
              </Stack>
            </Dynamic>
          </View>
          : null}

        ListEmptyComponent={loading ? undefined :
          <Dynamic animated key={'empty-list:warn'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
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
        }

        data={filteredSubjects}
        renderItem={renderItem}
      />
    </View>
  )
};

export default GradesView;