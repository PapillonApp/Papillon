import { Papicons } from '@getpapillon/papicons';
import { LegendList } from '@legendapp/list';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, RefreshControl, View } from 'react-native';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import Reanimated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getManager, subscribeManagerUpdate } from '@/services/shared';
import { GradeScore, Period, Subject } from "@/services/shared/grade";
import ChipButton from '@/ui/components/ChipButton';
import { CompactGrade } from '@/ui/components/CompactGrade';
import { Dynamic } from '@/ui/components/Dynamic';
import Icon from '@/ui/components/Icon';
import Item, { Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Search from '@/ui/components/Search';
import Stack from '@/ui/components/Stack';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import Typography from '@/ui/components/Typography';
import { useKeyboardHeight } from '@/ui/hooks/useKeyboardHeight';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import i18n from '@/utils/i18n';
import { getPeriodName, getPeriodNumber, isPeriodWithNumber } from "@/utils/services/periods";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import Averages from './atoms/Averages';
import FeaturesMap from './atoms/FeaturesMap';
import { SubjectItem } from './atoms/Subject';
import { useGradeInfluence } from './hooks/useGradeInfluence';

const MemoizedSubjectItem = React.memo(SubjectItem);

const GradesView: React.FC = () => {
  // Layout du header
  const [headerHeight, setHeaderHeight] = useState(0);
  const bottomTabBarHeight = useBottomTabBarHeight();

  // Thème
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Chargement
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(true);
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
      label: t("Grades_Sorting_Date"),
      value: "date",
      icon: {
        ios: "calendar",
        android: "ic_date",
        papicon: "calendar",
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
  ];

  // Gestion du scroll
  const [shouldCollapseHeader, setShouldCollapseHeader] = useState(false);

  // Manager
  const manager = getManager();

  // Obtention des périodes
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>();

  const fetchPeriods = async (managerToUse = manager) => {
    if (currentPeriod || !managerToUse) { return; }
    setPeriodsLoading(true);

    const result = await managerToUse.getGradesPeriods();
    const currentPeriodFound = getCurrentPeriod(result);

    // sort by time, then put Semestre and Trimestre on top
    const sortedResult = [...result].sort((a, b) => {
      const isAKey = a.name.startsWith("Semestre") || a.name.startsWith("Trimestre");
      const isBKey = b.name.startsWith("Semestre") || b.name.startsWith("Trimestre");

      if (isAKey && !isBKey) { return -1; }
      if (!isAKey && isBKey) { return 1; }

      return a.start.getTime() - b.start.getTime();
    });

    setPeriods(sortedResult);
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
  const [features, setFeatures] = useState<GradeFeatures | null>(null);
  const [serviceAverage, setServiceAverage] = useState<number | null>(null);
  const [serviceRank, setServiceRank] = useState<GradeScore | null>(null);

  const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
    setGradesLoading(true);
    if (period && managerToUse) {
      const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);

      if (grades?.features) {
        setFeatures(grades.features);
      }
      if (!grades || !grades.subjects) {
        setGradesLoading(false);
        return;
      }
      setSubjects(grades.subjects);
      if (grades.studentOverall && typeof grades.studentOverall.value === 'number') {
        setServiceAverage(grades.studentOverall.value)
      } else {
        setServiceAverage(null);
      }

      if (grades.rank && typeof grades.rank.value === 'number' && !grades.rank.disabled) {
        setServiceRank(grades.rank)
      } else {
        setServiceRank(null);
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          setGradesLoading(false);
          setIsRefreshing(false);
        }, 200);
      });
    } else {
      setGradesLoading(false);
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

          if (!aLatestGrade && !bLatestGrade) { return 0; }
          if (!aLatestGrade) { return 1; }
          if (!bLatestGrade) { return -1; }

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

    if (periods.length === 0) {
      fetchPeriods();
    }

    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod, periods]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const subject = item as Subject;
    return (
      // @ts-expect-error navigation types
      <MemoizedSubjectItem subject={subject} grades={grades} getAvgInfluence={getAvgInfluence} getAvgClassInfluence={getAvgClassInfluence} />
    )
  }, [grades]);

  const keyboardHeight = useKeyboardHeight();

  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value - bottomTabBarHeight,
  }));

  // influences
  const { getAvgInfluence, getAvgClassInfluence } = useGradeInfluence(subjects, getSubjectById);

  // header
  const ListHeader = useMemo(() => ((sortedGrades.length > 0 && searchText.length === 0) ? (
    <View style={{ marginBottom: 16 }}>
      <Averages
        grades={grades}
        color={colors.primary}
        realAverage={serviceAverage || undefined}
      />

      {serviceRank && (
        <List style={{ marginTop: 8 }}>
          <Item>
            <Icon opacity={0.5}>
              <Papicons name='crown' />
            </Icon>

            <Typography variant='title'>
              {t('Grades_Tab_Rank')}
            </Typography>
            <Typography variant='body1' color='secondary'>
              {t('Grades_Tab_Rank_Description')}
            </Typography>

            <Trailing>
              <Stack
                direction='horizontal'
                gap={4}
                vAlign='end'
                hAlign='end'
              >
                <Typography variant='h3' inline color='text'>
                  {serviceRank.value}
                </Typography>
                <Typography variant='body1' inline color='secondary'>
                  /{serviceRank.outOf}
                </Typography>
              </Stack>
            </Trailing>
          </Item>
        </List>
      )}

      <View style={{ height: 16 }} />

      <Dynamic
        animated
        entering={PapillonAppearIn}
        exiting={PapillonAppearOut}
      >
        <Stack gap={8}>
          <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.4 }} padding={[0, 0]}>
            <Icon size={20}>
              <Papicons name='star' />
            </Icon>
            <Typography variant='h6' color='text'>
              {t('Grades_Tab_Latest')}
            </Typography>
          </Stack>

          <LegendList
            horizontal
            data={sortedGrades.slice(0, 10)}
            style={{ overflow: 'visible', height: 140 + 24, width: Dimensions.get('window').width - 20 }}
            contentContainerStyle={{ gap: 12 }}
            estimatedItemSize={210 + 12}
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
                hasMaxScore={grade?.studentScore?.value === grade?.maxScore?.value && !grade?.studentScore?.disabled}
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
                    avgInfluence: getAvgInfluence(grade),
                    avgClass: getAvgClassInfluence(grade),
                  })
                }}
              />
            }
          />
        </Stack>
      </Dynamic>

      <FeaturesMap features={features} />

      <Dynamic animated>
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
  ) : null), [sortedGrades, searchText]);

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
                })
                  } - ${period.end.toLocaleDateString(i18n.language, {
                    month: "short",
                    year: "numeric",
                  })
                  } `,
                state: currentPeriod?.id === period.id ? "on" : "off",
                image: Platform.select({
                  ios: (getPeriodNumber(period.name || "0")) + ".calendar"
                }),
                imageColor: colors.text,
              }))
            }
          >
            <TabHeaderTitle
              color={colors.primary}
              leading={periods.length > 0 ? getPeriodName(currentPeriod?.name || '') : t("Tab_Grades")}
              number={isPeriodWithNumber(currentPeriod?.name || '') ? getPeriodNumber(currentPeriod?.name || '') : undefined}
              loading={loading}
              chevron={periods.length > 1}
            />
          </MenuView>
        }
        /* Filtres */
        trailing={
          <ChipButton
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
            icon={sortings.find(s => s.value === sortMethod)?.icon.papicon || 'filter'} chevron
          >
            {sortings.find(s => s.value === sortMethod)?.label || t("Grades_Sort")}
          </ChipButton>
        }
        /* Recherche */
        bottom={<Search placeholder={t('Grades_Search_Placeholder')} color='#2B7ED6' onTextChange={(text) => setSearchText(text)} />}
        shouldCollapseHeader={shouldCollapseHeader}
      />


      <Reanimated.FlatList
        data={filteredSubjects}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: headerHeight + 12, paddingBottom: bottomTabBarHeight }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}

        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: headerHeight - insets.top }}

        keyExtractor={(item: any) => item.id}
        itemLayoutAnimation={LinearTransition.springify()}

        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
          />
        }

        ListHeaderComponent={ListHeader}

        ListFooterComponent={<Reanimated.View style={footerStyle} />}

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
      />
    </View>
  )
};

export default GradesView;